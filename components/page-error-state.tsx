"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PageErrorStateProps = {
  title: string;
  message: string;
  backHref?: string;
  backLabel?: string;
};

export function PageErrorState({
  title,
  message,
  backHref,
  backLabel = "Back",
}: PageErrorStateProps) {
  const router = useRouter();

  return (
    <section className="w-full">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 rounded-2xl border border-destructive/40 bg-card p-5 shadow-sm sm:p-6">
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-destructive uppercase">
            Data Load Failed
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">{title}</h1>
          <p
            role="alert"
            className="mt-3 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-3 text-sm text-destructive"
          >
            {message}
          </p>
        </div>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          {backHref ? (
            <Link
              href={backHref}
              className={cn(buttonVariants({ variant: "outline" }), "justify-center")}
            >
              {backLabel}
            </Link>
          ) : null}
          <Button type="button" onClick={() => router.refresh()}>
            Try Again
          </Button>
        </div>
      </div>
    </section>
  );
}
