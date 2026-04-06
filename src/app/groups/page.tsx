"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getMyGroups, createGroup, joinGroup } from "@/lib/supabase/groups";
import Link from "next/link";

export default function GroupsPage() {
  const router = useRouter();
  const [groups, setGroups] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadGroups();
  }, []);

  async function loadGroups() {
    try {
      const data = await getMyGroups();
      setGroups(data);
    } catch {
      // Not logged in or error
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    if (!groupName.trim() || creating) return;
    setCreating(true);
    setError("");
    try {
      const group = await createGroup(groupName);
      router.push(`/groups/${group.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create group");
    } finally {
      setCreating(false);
    }
  }

  async function handleJoin() {
    if (!inviteCode.trim() || creating) return;
    setCreating(true);
    setError("");
    try {
      const group = await joinGroup(inviteCode.trim());
      router.push(`/groups/${group.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid invite code");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="min-h-screen pt-24 px-6 pb-16">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1">
              <span className="gradient-text">Group Trips</span>
            </h1>
            <p className="text-zinc-400 text-sm">
              Plan together, vote on destinations, split expenses
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => { setShowJoin(true); setShowCreate(false); }}
              className="px-4 py-2 text-sm border border-zinc-700 hover:border-zinc-500 text-zinc-300 rounded-lg transition-all"
            >
              Join Group
            </button>
            <button
              onClick={() => { setShowCreate(true); setShowJoin(false); }}
              className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all"
            >
              + Create Group
            </button>
          </div>
        </div>

        {/* Create Form */}
        {showCreate && (
          <div className="p-5 rounded-xl bg-zinc-900/50 border border-zinc-800/50 mb-6 animate-scale-in">
            <h3 className="font-semibold mb-3">Create a Trip Group</h3>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Group name (e.g., Goa Squad 2026)"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                className="flex-1 px-4 py-2.5 rounded-lg bg-zinc-800/50 border border-zinc-700/50 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500 placeholder:text-zinc-600"
              />
              <button
                onClick={handleCreate}
                disabled={!groupName.trim() || creating}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-all disabled:opacity-40"
              >
                {creating ? "Creating..." : "Create"}
              </button>
            </div>
            {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
          </div>
        )}

        {/* Join Form */}
        {showJoin && (
          <div className="p-5 rounded-xl bg-zinc-900/50 border border-zinc-800/50 mb-6 animate-scale-in">
            <h3 className="font-semibold mb-3">Join with Invite Code</h3>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Paste invite code"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleJoin()}
                className="flex-1 px-4 py-2.5 rounded-lg bg-zinc-800/50 border border-zinc-700/50 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500 placeholder:text-zinc-600 font-mono tracking-wider"
              />
              <button
                onClick={handleJoin}
                disabled={!inviteCode.trim() || creating}
                className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white text-sm font-medium rounded-lg transition-all disabled:opacity-40"
              >
                {creating ? "Joining..." : "Join"}
              </button>
            </div>
            {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
          </div>
        )}

        {/* Groups List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-zinc-900/50 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : groups.length > 0 ? (
          <div className="space-y-3">
            {groups.map((group) => (
              <Link
                key={group.id as string}
                href={`/groups/${group.id}`}
                className="block p-5 rounded-xl bg-zinc-900/50 border border-zinc-800/50 hover:border-zinc-700/50 hover:bg-zinc-900/70 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold group-hover:text-indigo-400 transition-colors">
                      {group.name as string}
                    </h3>
                    <div className="flex items-center gap-3 mt-1 text-sm text-zinc-500">
                      <span className={`px-2 py-0.5 text-xs rounded ${
                        group.myRole === "admin"
                          ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                          : "bg-zinc-800 text-zinc-400"
                      }`}>
                        {group.myRole as string}
                      </span>
                      <span>
                        Code: <span className="font-mono text-zinc-400">{group.invite_code as string}</span>
                      </span>
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-zinc-600 group-hover:text-indigo-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/20">
            <div className="text-5xl mb-4">👥</div>
            <h3 className="text-xl font-bold mb-2">No groups yet</h3>
            <p className="text-zinc-500 mb-6 max-w-md mx-auto">
              Create a group and invite your friends to plan a trip together.
              Vote on destinations, chat, and split expenses.
            </p>
            <button
              onClick={() => setShowCreate(true)}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all"
            >
              Create My First Group
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
