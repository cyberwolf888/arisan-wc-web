type ListPageLoadingProps = {
  rows?: number;
};

export function ListPageLoading({ rows = 6 }: ListPageLoadingProps) {
  return (
    <section className="w-full space-y-4" aria-busy="true" aria-live="polite">
      <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="h-3 w-28 animate-pulse rounded bg-muted" />
            <div className="mt-3 h-7 w-40 animate-pulse rounded bg-muted" />
            <div className="mt-3 h-4 w-72 max-w-full animate-pulse rounded bg-muted" />
          </div>
          <div className="h-10 w-32 animate-pulse rounded-md bg-muted" />
        </div>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card p-2 shadow-sm sm:p-3">
        <div className="overflow-hidden rounded-xl border border-border/70">
          <div className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,0.9fr)_auto] gap-4 border-b border-border/70 px-4 py-3">
            <div className="h-4 w-20 animate-pulse rounded bg-muted" />
            <div className="h-4 w-28 animate-pulse rounded bg-muted" />
            <div className="ml-auto h-4 w-16 animate-pulse rounded bg-muted" />
          </div>

          {Array.from({ length: rows }).map((_, index) => (
            <div
              key={index}
              className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,0.9fr)_auto] gap-4 border-b border-border/60 px-4 py-4 last:border-b-0"
            >
              <div className="h-5 w-32 animate-pulse rounded bg-muted" />
              <div className="h-6 w-24 animate-pulse rounded-full bg-muted" />
              <div className="ml-auto flex gap-2">
                <div className="h-9 w-20 animate-pulse rounded-md bg-muted" />
                <div className="h-9 w-20 animate-pulse rounded-md bg-muted" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

type FormPageLoadingProps = {
  fields?: number;
};

export function FormPageLoading({ fields = 2 }: FormPageLoadingProps) {
  return (
    <section className="w-full" aria-busy="true" aria-live="polite">
      <div className="mx-auto w-full max-w-xl rounded-2xl border border-border/60 bg-card p-5 shadow-sm sm:p-6">
        <div className="h-7 w-40 animate-pulse rounded bg-muted" />
        <div className="mt-3 h-4 w-72 max-w-full animate-pulse rounded bg-muted" />

        <div className="mt-6 space-y-5">
          {Array.from({ length: fields }).map((_, index) => (
            <div key={index} className="space-y-2">
              <div className="h-4 w-24 animate-pulse rounded bg-muted" />
              <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
              <div className="h-4 w-52 max-w-full animate-pulse rounded bg-muted" />
            </div>
          ))}

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <div className="h-10 w-full animate-pulse rounded-md bg-muted sm:w-24" />
            <div className="h-10 w-full animate-pulse rounded-md bg-muted sm:w-32" />
          </div>
        </div>
      </div>
    </section>
  );
}
