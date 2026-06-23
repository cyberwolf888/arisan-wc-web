"use server";

import { revalidatePath } from "next/cache";

import {
  createMember,
  deleteMember,
  getMembers,
  type Member,
  type MemberWriteInput,
  updateMember,
} from "@/lib/members";

function revalidateMemberRoutes() {
  revalidatePath("/");
  revalidatePath("/members");
  revalidatePath("/teams");
}

export async function getMembersAction(): Promise<Member[]> {
  return getMembers();
}

export async function createMemberAction(input: MemberWriteInput): Promise<Member> {
  const member = await createMember(input);
  revalidateMemberRoutes();
  return member;
}

export async function updateMemberAction(id: string, input: MemberWriteInput): Promise<Member> {
  const member = await updateMember(id, input);

  if (!member) {
    throw new Error("Member not found.");
  }

  revalidateMemberRoutes();
  return member;
}

export async function deleteMemberAction(id: string): Promise<void> {
  const deleted = await deleteMember(id);

  if (!deleted) {
    throw new Error("Member not found.");
  }

  revalidateMemberRoutes();
}
