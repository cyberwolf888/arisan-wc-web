import { notFound, unstable_rethrow } from "next/navigation";

import { PageErrorState } from "@/components/page-error-state";
import { getErrorMessage } from "@/lib/errors";
import { getMember } from "@/lib/members";

import { EditMemberForm } from "./edit-member-form";

type EditMemberPageProps = {
  params: Promise<{
    id: string;
  }>;
};

async function getEditMemberPageData(id: string) {
  try {
    return {
      member: await getMember(id),
      errorMessage: null,
    };
  } catch (error) {
    unstable_rethrow(error);

    return {
      member: null,
      errorMessage: getErrorMessage(error, "Failed to load member. Please try again."),
    };
  }
}

export default async function EditMemberPage({ params }: EditMemberPageProps) {
  const { id } = await params;
  const { member, errorMessage } = await getEditMemberPageData(id);

  if (errorMessage) {
    return (
      <PageErrorState
        title="Unable to load member"
        message={errorMessage}
        backHref="/members"
        backLabel="Back to Members"
      />
    );
  }

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
