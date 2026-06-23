import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/supabase/types";

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
    .eq("_id", memberId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch member: ${error.message}`);
  }

  return (data as Member | null) ?? null;
}

export async function createMember(input: MemberWriteInput) {
  const payload = ensureMemberInput(input);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("members")
    .insert(payload)
    .select("_id,name,payment_status")
    .single();

  if (error) {
    throw new Error(`Failed to create member: ${error.message}`);
  }

  return data as Member;
}

export async function updateMember(id: string, input: MemberWriteInput) {
  const memberId = ensureMemberId(id);
  const payload = ensureMemberInput(input);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("members")
    .update(payload)
    .eq("_id", memberId)
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
    .eq("_id", memberId)
    .select("_id")
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to delete member: ${error.message}`);
  }

  return Boolean(data?._id);
}
