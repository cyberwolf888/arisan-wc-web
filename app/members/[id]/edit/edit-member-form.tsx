"use client";

import { useRouter } from "next/navigation";

import { MemberForm, type MemberFormValues } from "@/components/member-form";

import { updateMemberAction } from "../../actions";

type EditMemberFormProps = {
  memberId: string;
  initialValues: MemberFormValues;
};

export function EditMemberForm({ memberId, initialValues }: EditMemberFormProps) {
  const router = useRouter();

  return (
    <MemberForm
      title="Edit Member"
      description="Update member details and payment status."
      submitLabel="Save Changes"
      submittingLabel="Saving..."
      initialValues={initialValues}
      onSubmit={async (values) => {
        await updateMemberAction(memberId, values);
        router.push("/members");
        router.refresh();
      }}
    />
  );
}
