import { createClient } from "@/lib/supabase/client";

export async function createGroup(name: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  // Create group
  const { data: group, error: groupError } = await supabase
    .from("groups")
    .insert({ name, created_by: user.id })
    .select()
    .single();

  if (groupError) throw groupError;

  // Auto-add creator as admin member
  const { error: memberError } = await supabase
    .from("group_members")
    .insert({
      group_id: group.id,
      user_id: user.id,
      role: "admin",
    });

  if (memberError) throw memberError;

  return group;
}

export async function joinGroup(inviteCode: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  // Find group by invite code
  const { data: group, error: findError } = await supabase
    .from("groups")
    .select("*")
    .eq("invite_code", inviteCode)
    .single();

  if (findError || !group) throw new Error("Invalid invite code");

  // Check if already a member
  const { data: existing } = await supabase
    .from("group_members")
    .select("id")
    .eq("group_id", group.id)
    .eq("user_id", user.id)
    .single();

  if (existing) return group; // Already a member

  // Join group
  const { error: joinError } = await supabase
    .from("group_members")
    .insert({
      group_id: group.id,
      user_id: user.id,
      role: "member",
    });

  if (joinError) throw joinError;

  return group;
}

export async function getMyGroups() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data: memberships } = await supabase
    .from("group_members")
    .select("group_id, role, groups(id, name, invite_code, created_by, created_at)")
    .eq("user_id", user.id);

  if (!memberships) return [];

  return memberships.map((m) => ({
    ...(m.groups as unknown as Record<string, unknown>),
    myRole: m.role,
  }));
}

export async function getGroupDetails(groupId: string) {
  const supabase = createClient();

  const { data: group, error } = await supabase
    .from("groups")
    .select("*")
    .eq("id", groupId)
    .single();

  if (error) throw error;

  const { data: members } = await supabase
    .from("group_members")
    .select("*, profiles(id, full_name, avatar_url, email)")
    .eq("group_id", groupId);

  const { data: votes } = await supabase
    .from("votes")
    .select("*")
    .eq("group_id", groupId);

  return { group, members: members || [], votes: votes || [] };
}

export async function castVote(
  groupId: string,
  destinationId: string,
  rank: number
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  // Upsert vote (update if exists, insert if new)
  const { error } = await supabase.from("votes").upsert(
    {
      group_id: groupId,
      user_id: user.id,
      destination_id: destinationId,
      rank,
    },
    { onConflict: "group_id,user_id,destination_id" }
  );

  if (error) throw error;
}

export async function getVoteResults(groupId: string) {
  const supabase = createClient();

  const { data: votes } = await supabase
    .from("votes")
    .select("destination_id, rank")
    .eq("group_id", groupId);

  if (!votes || votes.length === 0) return [];

  // Tally votes — lower rank = higher preference
  const tally: Record<string, { totalRank: number; voteCount: number }> = {};

  votes.forEach((v) => {
    if (!tally[v.destination_id]) {
      tally[v.destination_id] = { totalRank: 0, voteCount: 0 };
    }
    tally[v.destination_id].totalRank += v.rank;
    tally[v.destination_id].voteCount += 1;
  });

  // Sort by average rank (ascending — rank 1 is best)
  return Object.entries(tally)
    .map(([destId, { totalRank, voteCount }]) => ({
      destinationId: destId,
      avgRank: totalRank / voteCount,
      voteCount,
    }))
    .sort((a, b) => a.avgRank - b.avgRank);
}
