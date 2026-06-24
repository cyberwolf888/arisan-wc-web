"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Combobox } from "@/components/ui/combobox";
import { getErrorMessage } from "@/lib/errors";
import type { Member } from "@/lib/members";
import { cn } from "@/lib/utils";

import { createAssignmentAction, type TeamOption } from "../actions";

type AssignFormProps = {
  teams: TeamOption[];
  members: Member[];
};

type AssignFormValues = {
  team_id: string;
  member_id: string;
};

export function AssignForm({ teams, members }: AssignFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<AssignFormValues>({
    defaultValues: {
      team_id: "",
      member_id: "",
    },
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    setSubmitSuccess(false);
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      await createAssignmentAction({
        team_id: values.team_id,
        member_id: values.member_id,
      });
      setSubmitSuccess(true);
      form.reset();
    } catch (error) {
      setSubmitError(getErrorMessage(error, "Failed to save assignment. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <section className="w-full">
      <div className="mx-auto w-full max-w-xl rounded-2xl border border-border/60 bg-card p-5 shadow-sm sm:p-6">
        <h1 className="text-xl font-semibold tracking-tight">Add Assignment</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Assign a member to a team. Each member can be assigned to multiple teams.
        </p>

        <Form {...form}>
          <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
            <FormField
              control={form.control}
              name="team_id"
              rules={{ required: "Team is required." }}
              render={({ field }) => {
                const teamOptions = teams.map((team) => ({
                  value: team._id,
                  label: team.name_en ?? "Unknown team",
                }));

                const flagMap = new Map(teams.map((t) => [t._id, t.flag]));

                return (
                  <FormItem>
                    <FormLabel>Team</FormLabel>
                    <FormControl>
                      <Combobox
                        items={teamOptions}
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder="Search teams..."
                        renderItem={(item) => {
                          const flag = flagMap.get(item.value);
                          return (
                            <span className="flex items-center gap-2">
                              {flag ? (
                                <img
                                  src={flag}
                                  alt=""
                                  className="size-5 shrink-0 object-contain"
                                />
                              ) : null}
                              {item.label}
                            </span>
                          );
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      Choose the team you want to assign a member to.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            <FormField
              control={form.control}
              name="member_id"
              rules={{ required: "Member is required." }}
              render={({ field }) => {
                const memberOptions = members.map((member) => ({
                  value: member._id,
                  label: member.name?.trim() || "Unnamed member",
                }));

                return (
                  <FormItem>
                    <FormLabel>Member</FormLabel>
                    <FormControl>
                      <Combobox
                        items={memberOptions}
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder="Search members..."
                      />
                    </FormControl>
                    <FormDescription>
                      Choose the member to assign to this team.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            {submitSuccess ? (
              <p
                role="alert"
                className="rounded-lg border border-green-500/40 bg-green-500/10 px-3 py-2 text-sm text-green-600"
              >
                Assignment saved successfully.
              </p>
            ) : null}

            {submitError ? (
              <p
                role="alert"
                className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
              >
                {submitError}
              </p>
            ) : null}

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Link
                href="/teams"
                className={cn(buttonVariants({ variant: "outline" }), "justify-center")}
              >
                Cancel
              </Link>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Assigning..." : "Assign Member"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </section>
  );
}
