"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button, buttonVariants } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type MemberFormValues = {
  name: string;
  payment_status: boolean;
};

type MemberFormProps = {
  title: string;
  description: string;
  submitLabel: string;
  submittingLabel?: string;
  initialValues?: MemberFormValues;
  onSubmit: (values: MemberFormValues) => Promise<void>;
};

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Failed to save member. Please try again.";
}

export function MemberForm({
  title,
  description,
  submitLabel,
  submittingLabel = "Saving...",
  initialValues,
  onSubmit,
}: MemberFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<MemberFormValues>({
    defaultValues: {
      name: initialValues?.name ?? "",
      payment_status: initialValues?.payment_status ?? false,
    },
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      await onSubmit({
        name: values.name.trim(),
        payment_status: values.payment_status,
      });
    } catch (error) {
      setSubmitError(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <section className="w-full">
      <div className="mx-auto w-full max-w-xl rounded-2xl border border-border/60 bg-card p-5 shadow-sm sm:p-6">
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>

        <Form {...form}>
          <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
            <FormField
              control={form.control}
              name="name"
              rules={{
                required: "Name is required.",
                validate: (value) => value.trim().length > 0 || "Name is required.",
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      placeholder="e.g. John Doe"
                      autoComplete="off"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="payment_status"
              render={({ field }) => (
                <FormItem className="rounded-lg border border-border/70 bg-muted/20 p-3">
                  <div className="flex items-center gap-3">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(checked) => field.onChange(Boolean(checked))}
                      />
                    </FormControl>
                    <div className="space-y-0.5">
                      <FormLabel className="cursor-pointer">Payment completed</FormLabel>
                      <FormDescription>
                        Mark member as paid if arisan contribution already received.
                      </FormDescription>
                    </div>
                  </div>
                </FormItem>
              )}
            />

            {submitError ? (
              <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {submitError}
              </p>
            ) : null}

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Link
                href="/members"
                className={cn(buttonVariants({ variant: "outline" }), "justify-center")}
              >
                Cancel
              </Link>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? submittingLabel : submitLabel}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </section>
  );
}
