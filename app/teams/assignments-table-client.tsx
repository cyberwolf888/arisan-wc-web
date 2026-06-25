"use client";

import { XIcon } from "lucide-react";
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
import { buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getErrorMessage } from "@/lib/errors";
import type { MemberAssignmentGroup, TeamSlot } from "@/lib/assignments";
import { cn } from "@/lib/utils";

import { deleteAssignmentAction } from "./actions";

type SlotToDelete = {
  _id: string;
  member_name: string;
  team_name: string;
};

type AssignmentsTableClientProps = {
  initialGroups: MemberAssignmentGroup[];
  r32TeamIds: string[];
};

export function AssignmentsTableClient({ initialGroups, r32TeamIds }: AssignmentsTableClientProps) {
  const router = useRouter();
  const [groups, setGroups] = useState<MemberAssignmentGroup[]>(initialGroups);
  const r32Set = useMemo(() => new Set(r32TeamIds), [r32TeamIds]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [slotToDelete, setSlotToDelete] = useState<SlotToDelete | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const selectedDescription = useMemo(() => {
    if (!slotToDelete) return "";
    return `${slotToDelete.member_name} from ${slotToDelete.team_name}`;
  }, [slotToDelete]);

  const handleDelete = async () => {
    if (!slotToDelete || isDeleting) return;
    setIsDeleting(true);
    setErrorMessage(null);

    try {
      await deleteAssignmentAction(slotToDelete._id);
      setGroups((prev) =>
        prev.map((group) => ({
          ...group,
          teams: group.teams.map((slot) =>
            slot?._id === slotToDelete._id ? null : slot,
          ) as [TeamSlot, TeamSlot, TeamSlot],
        })),
      );
      setSlotToDelete(null);
      router.refresh();
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Failed to delete assignment. Please try again."));
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
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">Team Assignments</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Assign members to teams and manage existing assignments.
            </p>
          </div>

          <Link href="/teams/assign" className={cn(buttonVariants({ variant: "default" }))}>
            Add Assignment
          </Link>
        </div>
      </div>

      {errorMessage ? (
        <div className="flex flex-col gap-3 rounded-xl border border-destructive/40 bg-destructive/10 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p role="alert" className="text-sm text-destructive">
            {errorMessage}
          </p>
        </div>
      ) : null}

      {groups.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/70 bg-card/80 p-6 text-center shadow-sm">
          <p className="text-base font-medium">No assignments yet. Assign a member to a team.</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Create your first assignment to start matching members with teams.
          </p>
          <div className="mt-4">
            <Link href="/teams/assign" className={cn(buttonVariants({ variant: "default" }))}>
              Add Assignment
            </Link>
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border/60 shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#2d6a4f] hover:bg-[#2d6a4f]">
                <TableHead className="w-14 text-center font-bold text-white">No.</TableHead>
                <TableHead className="font-bold text-white">Nama</TableHead>
                <TableHead className="text-center font-bold text-white">Tim 1</TableHead>
                <TableHead className="text-center font-bold text-white">Tim 2</TableHead>
                <TableHead className="text-center font-bold text-white">Tim 3</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groups.map((group, index) => {
                const hasAnyR32Team = group.teams.some(
                  (slot) => slot && r32Set.has(slot.team_id),
                );
                return (
                <TableRow key={group.member_id} className="bg-[#f0f7f4] hover:bg-[#e6f2ec]">
                  <TableCell className="text-center font-medium text-muted-foreground">
                    {index + 1}
                  </TableCell>
                  <TableCell className="font-medium">
                    {!hasAnyR32Team ? <span>💩 {group.member_name}</span> : group.member_name}
                  </TableCell>
                  {group.teams.map((slot, i) => {
                    const isInR32 = slot ? r32Set.has(slot.team_id) : true;
                    return (
                      <TableCell key={i} className="text-center">
                        {slot ? (
                          <span className="inline-flex items-center gap-1.5">
                            {slot.team_flag ? (
                              slot.team_flag.startsWith("http") ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={slot.team_flag}
                                  alt={slot.team_name}
                                  width={24}
                                  height={16}
                                  className={cn(
                                    "inline-block rounded-sm object-cover",
                                    !isInR32 && "grayscale opacity-50",
                                  )}
                                />
                              ) : (
                                <span className={cn("text-base leading-none", !isInR32 && "opacity-50")}>
                                  {slot.team_flag}
                                </span>
                              )
                            ) : null}
                            <span className={cn(!isInR32 && "line-through text-muted-foreground")}>
                              {slot.team_name}
                            </span>
                            <button
                              type="button"
                              className="ml-0.5 inline-flex size-4 items-center justify-center rounded-full text-muted-foreground/60 transition-colors hover:bg-destructive/15 hover:text-destructive"
                              onClick={() => {
                                setErrorMessage(null);
                                setSlotToDelete({
                                  _id: slot._id,
                                  member_name: group.member_name,
                                  team_name: slot.team_name,
                                });
                              }}
                            >
                              <XIcon className="size-3" />
                            </button>
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
            </TableBody>
          </Table>
        </div>
      )}

      <AlertDialog
        open={Boolean(slotToDelete)}
        onOpenChange={(open) => {
          if (!open && !isDeleting) {
            setSlotToDelete(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete assignment?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove {selectedDescription}. The member and team will not be deleted.
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
