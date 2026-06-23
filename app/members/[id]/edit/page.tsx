import { notFound } from "next/navigation";

import { getMember } from "@/lib/members";

import { EditMemberForm } from "./edit-member-form";

type EditMemberPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditMemberPage({ params }: EditMemberPageProps) {
  const { id } = await params;
  const member = await getMember(id);

  if (!member) {
    notFound();
  }

  return (
    <EditMemberForm
      memberId={member._id}
      initialValues={{
        name: member.name?.trim() || "",
        payment_status: Boolean(member.payment_status),
      }}
    />
  );
}
