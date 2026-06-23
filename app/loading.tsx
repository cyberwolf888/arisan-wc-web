const groups = ["A", "B", "C", "D", "E", "F", "G", "H"];

export default function LoadingHomePage() {
  return (
    <section className="w-full space-y-6" aria-busy="true" aria-live="polite">
      <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
        <div className="h-3 w-36 animate-pulse rounded bg-muted" />
        <div className="mt-3 h-7 w-64 animate-pulse rounded bg-muted" />
        <div className="mt-3 h-4 w-80 max-w-full animate-pulse rounded bg-muted" />
      </div>

      {groups.map((group) => (
        <section
          key={group}
          className="rounded-2xl border border-border/60 bg-card/70 p-4 shadow-sm sm:p-5"
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="h-6 w-24 animate-pulse rounded bg-muted" />
            <div className="h-3 w-16 animate-pulse rounded bg-muted" />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={`${group}-${index}`} className="rounded-xl border border-border/70 bg-card p-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-14 animate-pulse rounded-md bg-muted" />
                  <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                </div>
                <div className="mt-3 h-8 animate-pulse rounded-md bg-muted" />
              </div>
            ))}
          </div>
        </section>
      ))}
    </section>
  );
}
