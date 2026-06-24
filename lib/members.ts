import { createClient } from "@/lib/supabase/server";
import type { Tables, TablesInsert, TablesUpdate } from "@/lib/supabase/types";

export type Member = Pick<Tables<"members">, "_id" | "name" | "payment_status">;

export type MemberWriteInput = {
  name: string;
  payment_status: boolean;
};

function normalizeName(name: string) {
  return name.trim().replace(/\s+/g, " ");
}

function ensureMemberId(id: string) {
  const normalizedId = id.trim();

  if (!normalizedId) {
    throw new Error("Member id is required.");
  }

  return normalizedId;
}

function ensureMemberInput(input: MemberWriteInput) {
  const normalizedName = normalizeName(input.name);

  if (!normalizedName) {
    throw new Error("Member name is required.");
  }

  return {
    name: normalizedName,
    payment_status: Boolean(input.payment_status),
  };
}

function getMemberInsertPayload(input: MemberWriteInput) {
  const normalized = ensureMemberInput(input);

  return {
    name: normalized.name,
    payment_status: normalized.payment_status,
  } satisfies TablesInsert<"members">;
}

function getMemberUpdatePayload(input: MemberWriteInput) {
  const normalized = ensureMemberInput(input);

  return {
    name: normalized.name,
    payment_status: normalized.payment_status,
  } satisfies TablesUpdate<"members">;
}

export async function getMembers() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("members")
    .select("_id,name,payment_status")
    .order("name", { ascending: true, nullsFirst: false });

  if (error) {
    throw new Error(`Failed to fetch members: ${error.message}`);
  }

  return (data ?? []) as Member[];
}

export async function getMember(id: string) {
  const memberId = ensureMemberId(id);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("members")
    .select("_id,name,payment_status")
    .filter("_id", "eq", memberId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch member: ${error.message}`);
  }

  return (data as Member | null) ?? null;
}

export async function createMember(input: MemberWriteInput) {
  const payload = getMemberInsertPayload(input);
  const supabase = await createClient();

  // Supabase's generated write types reject this valid payload under strict TS.
  const { data, error } = await supabase
    .from("members")
    .insert(payload as never)
    .select("_id,name,payment_status")
    .single();

  if (error) {
    throw new Error(`Failed to create member: ${error.message}`);
  }

  return data as Member;
}

export async function updateMember(id: string, input: MemberWriteInput) {
  const memberId = ensureMemberId(id);
  const payload = getMemberUpdatePayload(input);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("members")
    .update(payload as never)
    .filter("_id", "eq", memberId)
    .select("_id,name,payment_status")
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to update member: ${error.message}`);
  }

  return (data as Member | null) ?? null;
}

export async function deleteMember(id: string) {
  const memberId = ensureMemberId(id);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("members")
    .delete()
    .filter("_id", "eq", memberId)
    .select("_id")
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to delete member: ${error.message}`);
  }

  return Boolean((data as Pick<Tables<"members">, "_id"> | null)?._id);
}
