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
import { getErrorMessage } from "@/lib/errors";
import type { Assignment } from "@/lib/assignments";
import { cn } from "@/lib/utils";

import { deleteAssignmentAction } from "./actions";

type AssignmentsTableClientProps = {
  initialAssignments: Assignment[];
};

export function AssignmentsTableClient({ initialAssignments }: AssignmentsTableClientProps) {
  const router = useRouter();
  const [assignments, setAssignments] = useState<Assignment[]>(initialAssignments);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [assignmentToDelete, setAssignmentToDelete] = useState<Assignment | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const selectedDescription = useMemo(() => {
    if (!assignmentToDelete) return "";
    return `${assignmentToDelete.member_name} from ${assignmentToDelete.team_name}`;
  }, [assignmentToDelete]);

  const handleDelete = async () => {
    if (!assignmentToDelete || isDeleting) {
      return;
    }

    setErrorMessage(null);
    setIsDeleting(true);

    try {
      await deleteAssignmentAction(assignmentToDelete._id);
      setAssignments((previousAssignments) =>
        previousAssignments.filter((a) => a._id !== assignmentToDelete._id),
      );
      setAssignmentToDelete(null);
      router.refresh();
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Failed to load assignments. Please try again."));
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

      {assignments.length === 0 ? (
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
        <div className="rounded-2xl border border-border/60 bg-card p-2 shadow-sm sm:p-3">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Team</TableHead>
                <TableHead>Assigned Member</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignments.map((assignment) => (
                <TableRow key={assignment._id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {assignment.team_flag ? (
                        <span className="text-base leading-none">{assignment.team_flag}</span>
                      ) : null}
                      {assignment.team_name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="border-primary/30 bg-primary/5 text-primary"
                    >
                      {assignment.member_name}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/teams/${assignment._id}/reassign`}
                        className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                      >
                        Reassign
                      </Link>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setErrorMessage(null);
                          setAssignmentToDelete(assignment);
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
        open={Boolean(assignmentToDelete)}
        onOpenChange={(open) => {
          if (!open && !isDeleting) {
            setAssignmentToDelete(null);
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
