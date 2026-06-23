export default function Home() {
  return (
    <section className="w-full">
      <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
        <div className="border-b border-border/60 bg-muted/40 px-5 py-4">
          <p className="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
            Arisan Bola PELITA
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            Dashboard is ready.
          </h1>
        </div>

        <div className="space-y-3 px-5 py-5 text-sm text-muted-foreground">
          <p>
            Phase 2 complete: shared layout and top navigation are now active.
          </p>
          <p>
            Next phases will fill this page with grouped team cards and assigned
            members.
          </p>
        </div>
      </div>
    </section>
  );
}
