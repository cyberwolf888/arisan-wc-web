import { createClient } from "@/lib/supabase/server";
import type { Tables, TablesInsert, TablesUpdate } from "@/lib/supabase/types";

export type Assignment = {
  _id: string;
  member_id: string;
  team_id: string | null;
  member_name: string;
  team_name: string;
  team_flag: string | null;
};

export type AssignmentWriteInput = {
  member_id: string;
  team_id: string;
};

type AssignmentMemberRow = Pick<Tables<"members">, "name">;
type AssignmentTeamRow = Pick<Tables<"teams">, "name_en" | "flag">;
type AssignmentQueryRow = Pick<Tables<"member_teams">, "_id" | "member_id" | "team_id"> & {
  members: AssignmentMemberRow | AssignmentMemberRow[] | null;
  teams: AssignmentTeamRow | AssignmentTeamRow[] | null;
};

function ensureAssignmentId(id: string) {
  const normalizedId = id.trim();

  if (!normalizedId) {
    throw new Error("Assignment id is required.");
  }

  return normalizedId;
}

function normalizeAssignmentInput(input: AssignmentWriteInput) {
  const memberId = input.member_id.trim();
  const teamId = input.team_id.trim();

  if (!memberId) {
    throw new Error("Member is required.");
  }

  if (!teamId) {
    throw new Error("Team is required.");
  }

  return { member_id: memberId, team_id: teamId };
}

function getAssignmentInsertPayload(input: AssignmentWriteInput) {
  const normalized = normalizeAssignmentInput(input);

  return {
    member_id: normalized.member_id,
    team_id: normalized.team_id,
  } satisfies TablesInsert<"member_teams">;
}

function getAssignmentUpdatePayload(input: AssignmentWriteInput) {
  const normalized = normalizeAssignmentInput(input);

  return {
    member_id: normalized.member_id,
    team_id: normalized.team_id,
  } satisfies TablesUpdate<"member_teams">;
}

function mapAssignmentRow(row: AssignmentQueryRow) {
  const memberRow = Array.isArray(row.members) ? row.members[0] : row.members;
  const teamRow = Array.isArray(row.teams) ? row.teams[0] : row.teams;

  return {
    _id: row._id,
    member_id: row.member_id,
    team_id: row.team_id,
    member_name: memberRow?.name?.trim() || "Unnamed member",
    team_name: teamRow?.name_en?.trim() || "Unknown team",
    team_flag: teamRow?.flag ?? null,
  } satisfies Assignment;
}

export async function getAssignments() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("member_teams")
    .select("_id, member_id, team_id, members(name), teams(name_en, flag)")
    .order("_id", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch assignments: ${error.message}`);
  }

  return ((data ?? []) as AssignmentQueryRow[]).map(mapAssignmentRow);
}

export async function getAssignment(id: string) {
  const assignmentId = ensureAssignmentId(id);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("member_teams")
    .select("_id, member_id, team_id, members(name), teams(name_en, flag)")
    .filter("_id", "eq", assignmentId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch assignment: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  return mapAssignmentRow(data as AssignmentQueryRow);
}

export async function createAssignment(input: AssignmentWriteInput) {
  const payload = getAssignmentInsertPayload(input);
  const supabase = await createClient();

  // Supabase's generated write types reject this valid join-table payload under strict TS.
  const { data, error } = await supabase
    .from("member_teams")
    .insert(payload as never)
    .select("_id, member_id, team_id, members(name), teams(name_en, flag)")
    .single();

  if (error) {
    throw new Error(`Failed to create assignment: ${error.message}`);
  }

  return mapAssignmentRow(data as AssignmentQueryRow);
}

export async function updateAssignment(id: string, input: AssignmentWriteInput) {
  const assignmentId = ensureAssignmentId(id);
  const payload = getAssignmentUpdatePayload(input);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("member_teams")
    .update(payload as never)
    .filter("_id", "eq", assignmentId)
    .select("_id, member_id, team_id, members(name), teams(name_en, flag)")
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to update assignment: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  return mapAssignmentRow(data as AssignmentQueryRow);
}

export async function deleteAssignment(id: string) {
  const assignmentId = ensureAssignmentId(id);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("member_teams")
    .delete()
    .filter("_id", "eq", assignmentId)
    .select("_id")
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to delete assignment: ${error.message}`);
  }

  return Boolean((data as Pick<Tables<"member_teams">, "_id"> | null)?._id);
}
