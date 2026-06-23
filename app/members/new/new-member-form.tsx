"use client";

import { useRouter } from "next/navigation";

import { MemberForm } from "@/components/member-form";

import { createMemberAction } from "../actions";

export function NewMemberForm() {
  const router = useRouter();

  return (
    <MemberForm
      title="Add Member"
      description="Create a new arisan member and set payment status."
      submitLabel="Create Member"
      submittingLabel="Creating..."
      onSubmit={async (values) => {
        await createMemberAction(values);
        router.push("/members");
        router.refresh();
      }}
    />
  );
}
