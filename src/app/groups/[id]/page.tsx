"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { getGroupDetails, castVote, getVoteResults } from "@/lib/supabase/groups";
import { destinations } from "@/lib/data/destinations";
import { formatBudget } from "@/lib/engine/budget-engine";
import type { Destination } from "@/types";

interface GroupMember {
  user_id: string;
  role: string;
  profiles: { id: string; full_name: string; avatar_url: string; email: string };
}

interface VoteResult {
  destinationId: string;
  avgRank: number;
  voteCount: number;
}

export default function GroupDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [group, setGroup] = useState<Record<string, unknown> | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [voting, setVoting] = useState(false);
  const [myVotes, setMyVotes] = useState<Map<string, number>>(new Map());
  const [results, setResults] = useState<VoteResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [voteSubmitting, setVoteSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadGroup = useCallback(async () => {
    try {
      const data = await getGroupDetails(id);
      setGroup(data.group);
      setMembers(data.members as unknown as GroupMember[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load group. You may not be logged in or may not have access.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadGroup();
  }, [loadGroup]);

  const handleCopyCode = () => {
    if (!group) return;
    navigator.clipboard.writeText(group.invite_code as string);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppInvite = () => {
    if (!group) return;
    const text = `Join my trip group "${group.name}" on SmartPlan! 🗺️\n\nInvite code: ${group.invite_code}\n\nJoin here: ${window.location.origin}/groups?join=${group.invite_code}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleVote = (destId: string, rank: number) => {
    setMyVotes((prev) => {
      const next = new Map(prev);
      next.set(destId, rank);
      return next;
    });
  };

  const handleSubmitVotes = async () => {
    if (myVotes.size === 0 || voteSubmitting) return;
    setVoteSubmitting(true);
    try {
      for (const [destId, rank] of myVotes.entries()) {
        await castVote(id, destId, rank);
      }
      setVoting(false);
      // Load results
      const voteResults = await getVoteResults(id);
      setResults(voteResults);
      setShowResults(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit votes. Please try again.");
    } finally {
      setVoteSubmitting(false);
    }
  };

  const [revealLoading, setRevealLoading] = useState(false);
  const [destSearch, setDestSearch] = useState("");

  const handleRevealResults = async () => {
    setRevealLoading(true);
    try {
      const voteResults = await getVoteResults(id);
      setResults(voteResults);
      setShowResults(true);
    } finally {
      setRevealLoading(false);
    }
  };

  const votingDestinations = destSearch
    ? destinations.filter((d) => d.name.toLowerCase().includes(destSearch.toLowerCase()))
    : destinations;

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-zinc-500">Loading group...</div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">🔒</div>
          <h1 className="text-xl font-bold mb-2">Group not found</h1>
          <p className="text-zinc-500 mb-4">{error || "You may not have access to this group."}</p>
          <a
            href="/groups"
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors inline-block"
          >
            Back to Groups
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 px-6 pb-16">
      <div className="max-w-4xl mx-auto">
        {/* Group Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1">{group.name as string}</h1>
            <div className="flex items-center gap-3 text-sm text-zinc-500">
              <span>{members.length} members</span>
              <span>•</span>
              <span className="font-mono text-zinc-400">
                Code: {group.invite_code as string}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCopyCode}
              className="px-4 py-2 text-sm border border-zinc-700 hover:border-zinc-500 text-zinc-300 rounded-lg transition-all"
            >
              {copied ? "✓ Copied" : "📋 Copy Code"}
            </button>
            <button
              onClick={handleWhatsAppInvite}
              className="px-4 py-2 text-sm bg-green-600 hover:bg-green-500 text-white rounded-lg transition-all"
            >
              💬 WhatsApp Invite
            </button>
          </div>
        </div>

        {/* Members */}
        <div className="p-5 rounded-xl bg-zinc-900/50 border border-zinc-800/50 mb-6">
          <h3 className="font-semibold mb-4">Members</h3>
          <div className="flex flex-wrap gap-3">
            {members.map((member) => (
              <div
                key={member.user_id}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-800/50 border border-zinc-700/30"
              >
                {member.profiles?.avatar_url ? (
                  <img
                    src={member.profiles.avatar_url}
                    alt={member.profiles.full_name || "Member"}
                    className="w-7 h-7 rounded-full"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-indigo-500/20 flex items-center justify-center text-xs text-indigo-400 font-bold">
                    {(member.profiles?.full_name || "?")[0].toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="text-sm font-medium">
                    {member.profiles?.full_name || member.profiles?.email || "Member"}
                  </div>
                  <div className="text-xs text-zinc-500 capitalize">{member.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Voting Section */}
        {!voting && !showResults && (
          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            <button
              onClick={() => setVoting(true)}
              className="p-6 rounded-xl border border-dashed border-indigo-500/30 bg-indigo-500/5 hover:bg-indigo-500/10 transition-all text-center"
            >
              <div className="text-3xl mb-2">🗳️</div>
              <h3 className="font-semibold text-indigo-400">Vote on Destination</h3>
              <p className="text-xs text-zinc-500 mt-1">
                Rank your top destinations anonymously
              </p>
            </button>
            <button
              onClick={handleRevealResults}
              disabled={revealLoading}
              className="p-6 rounded-xl border border-dashed border-teal-500/30 bg-teal-500/5 hover:bg-teal-500/10 transition-all text-center disabled:opacity-50"
            >
              <div className="text-3xl mb-2">{revealLoading ? "⏳" : "🏆"}</div>
              <h3 className="font-semibold text-teal-400">
                {revealLoading ? "Loading..." : "Reveal Results"}
              </h3>
              <p className="text-xs text-zinc-500 mt-1">
                See where the group wants to go
              </p>
            </button>
          </div>
        )}

        {/* Voting UI */}
        {voting && (
          <div className="mb-6 animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">
                Rank your top destinations (1 = best)
              </h3>
              <button
                onClick={() => setVoting(false)}
                className="text-sm text-zinc-500 hover:text-zinc-300"
              >
                Cancel
              </button>
            </div>
            <input
              type="text"
              placeholder="Search destinations..."
              value={destSearch}
              onChange={(e) => setDestSearch(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-zinc-800/50 border border-zinc-700/50 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500 placeholder:text-zinc-600 mb-4"
            />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
              {votingDestinations.map((dest) => {
                const myRank = myVotes.get(dest.id);
                return (
                  <div
                    key={dest.id}
                    className={`p-4 rounded-xl border transition-all ${
                      myRank
                        ? "bg-indigo-600/10 border-indigo-500/30"
                        : "bg-zinc-900/50 border-zinc-800/50 hover:border-zinc-700"
                    }`}
                  >
                    <img
                      src={dest.image_url}
                      alt={dest.name}
                      className="w-full h-24 rounded-lg object-cover mb-2"
                    />
                    <h4 className="font-medium text-sm mb-1">{dest.name}</h4>
                    <p className="text-xs text-zinc-500 mb-2">
                      {formatBudget(dest.avg_daily_cost)}/day
                    </p>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((rank) => (
                        <button
                          key={rank}
                          onClick={() => handleVote(dest.id, rank)}
                          className={`flex-1 py-1 text-xs rounded transition-all ${
                            myRank === rank
                              ? "bg-indigo-600 text-white"
                              : "bg-zinc-800 text-zinc-500 hover:bg-zinc-700"
                          }`}
                        >
                          {rank}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            {error && (
              <p className="text-red-400 text-sm mb-3">{error}</p>
            )}
            <button
              onClick={handleSubmitVotes}
              disabled={myVotes.size === 0 || voteSubmitting}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all disabled:opacity-40"
            >
              {voteSubmitting
                ? "Submitting votes..."
                : `Submit ${myVotes.size} vote${myVotes.size !== 1 ? "s" : ""}`}
            </button>
          </div>
        )}

        {/* Results */}
        {showResults && (
          <div className="mb-6 animate-scale-in">
            <h3 className="font-semibold mb-4">🏆 Voting Results</h3>
            {results.length > 0 ? (
              <div className="space-y-3">
                {results.map((result, i) => {
                  const dest = destinations.find((d) => d.id === result.destinationId);
                  if (!dest) return null;
                  const isWinner = i === 0;

                  return (
                    <div
                      key={result.destinationId}
                      className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                        isWinner
                          ? "bg-amber-500/5 border-amber-500/20 ring-1 ring-amber-500/20"
                          : "bg-zinc-900/50 border-zinc-800/50"
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg ${
                          isWinner
                            ? "bg-amber-500/20 text-amber-400"
                            : "bg-zinc-800 text-zinc-500"
                        }`}
                      >
                        {isWinner ? "👑" : `#${i + 1}`}
                      </div>
                      <img
                        src={dest.image_url}
                        alt={dest.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h4 className={`font-semibold ${isWinner ? "text-amber-400" : ""}`}>
                          {dest.name}
                        </h4>
                        <div className="text-xs text-zinc-500">
                          {result.voteCount} votes • Avg rank: {result.avgRank.toFixed(1)}
                        </div>
                      </div>
                      <span className="text-sm text-teal-400 font-medium">
                        {formatBudget(dest.avg_daily_cost)}/day
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-zinc-500">
                <div className="text-3xl mb-2">🗳️</div>
                <p>No votes yet. Ask members to vote first!</p>
              </div>
            )}
            <button
              onClick={() => setShowResults(false)}
              className="w-full mt-4 py-2 text-sm text-zinc-500 hover:text-zinc-300"
            >
              Back to group
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
