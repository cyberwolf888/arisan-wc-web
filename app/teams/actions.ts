"use server";

import { revalidatePath } from "next/cache";

import {
  createAssignment,
  deleteAssignment,
  getAssignments,
  type Assignment,
  type AssignmentWriteInput,
  updateAssignment,
} from "@/lib/assignments";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/supabase/types";

export type TeamOption = Pick<Tables<"teams">, "_id" | "name_en" | "flag">;

function revalidateRoutes() {
  revalidatePath("/");
  revalidatePath("/teams");
}

export async function getAssignmentsAction(): Promise<Assignment[]> {
  return getAssignments();
}

export async function getTeamsAction(): Promise<TeamOption[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("teams")
    .select("_id,name_en,flag")
    .order("name_en", { ascending: true, nullsFirst: false });

  if (error) {
    throw new Error(`Failed to fetch teams: ${error.message}`);
  }

  return (data ?? []) as TeamOption[];
}

export async function createAssignmentAction(input: AssignmentWriteInput): Promise<Assignment> {
  const assignment = await createAssignment(input);
  revalidateRoutes();
  return assignment;
}

export async function updateAssignmentAction(
  id: string,
  input: AssignmentWriteInput,
): Promise<Assignment> {
  const assignment = await updateAssignment(id, input);

  if (!assignment) {
    throw new Error("Assignment not found.");
  }

  revalidateRoutes();
  return assignment;
}

export async function deleteAssignmentAction(id: string): Promise<void> {
  const deleted = await deleteAssignment(id);

  if (!deleted) {
    throw new Error("Assignment not found.");
  }

  revalidateRoutes();
}
