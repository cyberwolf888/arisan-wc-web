"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Member } from "@/lib/members";
import { cn } from "@/lib/utils";

import { deleteMemberAction } from "./actions";

type MembersTableClientProps = {
  initialMembers: Member[];
};

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Failed to load members. Please try again.";
}

function getMemberName(name: string | null) {
  return name?.trim() || "Unnamed member";
}

export function MembersTableClient({ initialMembers }: MembersTableClientProps) {
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const selectedMemberName = useMemo(
    () => getMemberName(memberToDelete?.name ?? null),
    [memberToDelete],
  );

  const handleDelete = async () => {
    if (!memberToDelete || isDeleting) {
      return;
    }

    setErrorMessage(null);
    setIsDeleting(true);

    try {
      await deleteMemberAction(memberToDelete._id);
      setMembers((previousMembers) =>
        previousMembers.filter((member) => member._id !== memberToDelete._id),
      );
      setMemberToDelete(null);
      router.refresh();
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <section className="w-full space-y-4">
      <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
              Arisan Bola PELITA
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">Members</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Manage participant names and payment status.
            </p>
          </div>

          <Link href="/members/new" className={cn(buttonVariants({ variant: "default" }))}>
            Add Member
          </Link>
        </div>
      </div>

      {errorMessage ? (
        <div className="flex flex-col gap-3 rounded-xl border border-destructive/40 bg-destructive/10 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-destructive">{errorMessage}</p>
        </div>
      ) : null}

      {members.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/70 bg-card/80 p-6 text-center shadow-sm">
          <p className="text-base font-medium">No members yet. Add one.</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Create your first member to start assigning team representatives.
          </p>
          <div className="mt-4">
            <Link href="/members/new" className={cn(buttonVariants({ variant: "default" }))}>
              Add Member
            </Link>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-border/60 bg-card p-2 shadow-sm sm:p-3">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Payment Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member._id}>
                  <TableCell className="font-medium">{getMemberName(member.name)}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        member.payment_status
                          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                          : "border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-300",
                      )}
                    >
                      {member.payment_status ? "Paid" : "Unpaid"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/members/${member._id}/edit`}
                        className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                      >
                        Edit
                      </Link>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setErrorMessage(null);
                          setMemberToDelete(member);
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AlertDialog
        open={Boolean(memberToDelete)}
        onOpenChange={(open) => {
          if (!open && !isDeleting) {
            setMemberToDelete(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete member?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove {selectedMemberName}. If member still assigned to teams, delete may fail
              until assignments removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={isDeleting}
              onClick={(event) => {
                event.preventDefault();
                void handleDelete();
              }}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
