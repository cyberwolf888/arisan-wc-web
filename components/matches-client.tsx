"use client"

import { useMemo, useState } from "react";

import { MatchCard } from "@/components/match-card";
import { cn } from "@/lib/utils";
import type { EnrichedGame } from "@/lib/games-api";

// Canonical ordering for knockout stages
const KNOCKOUT_ORDER = [
  "r32",
  "round_of_32",
  "r16",
  "round_of_16",
  "qf",
  "quarter_final",
  "sf",
  "semi_final",
  "3rd",
  "third_place",
  "final",
];

const KNOCKOUT_LABELS: Record<string, string> = {
  r32: "R32",
  round_of_32: "R32",
  r16: "R16",
  round_of_16: "R16",
  qf: "QF",
  quarter_final: "QF",
  sf: "SF",
  semi_final: "SF",
  "3rd": "3RD",
  third_place: "3RD",
  final: "FINAL",
};

type FilterTab = { id: string; label: string };

function buildFilterTabs(games: EnrichedGame[]): FilterTab[] {
  const groups = new Set<string>();
  const knockouts = new Set<string>();

  for (const g of games) {
    if (g.type?.toLowerCase() === "group" && g.group) {
      groups.add(g.group.toUpperCase());
    } else if (g.type) {
      knockouts.add(g.type.toLowerCase());
    }
  }

  const groupTabs: FilterTab[] = Array.from(groups)
    .sort()
    .map((g) => ({ id: `group:${g}`, label: `Group ${g}` }));

  // Dedupe by display label while preserving canonical order
  const seen = new Set<string>();
  const knockoutTabs: FilterTab[] = KNOCKOUT_ORDER.filter((k) => knockouts.has(k))
    .map((k) => ({ id: `knockout:${k}`, label: KNOCKOUT_LABELS[k] }))
    .filter((t) => {
      if (seen.has(t.label)) return false;
      seen.add(t.label);
      return true;
    });

  return [{ id: "all", label: "All Matches" }, ...groupTabs, ...knockoutTabs];
}

export function MatchesClient({ games }: { games: EnrichedGame[] }) {
  const [activeTab, setActiveTab] = useState("all");

  const tabs = useMemo(() => buildFilterTabs(games), [games]);

  const filtered = useMemo(() => {
    if (activeTab === "all") return games;

    if (activeTab.startsWith("group:")) {
      const group = activeTab.slice("group:".length);
      return games.filter(
        (g) =>
          g.group?.toUpperCase() === group && g.type?.toLowerCase() === "group",
      );
    }

    if (activeTab.startsWith("knockout:")) {
      const type = activeTab.slice("knockout:".length);
      // Match both the canonical key and any alias that maps to the same label
      const targetLabel = KNOCKOUT_LABELS[type];
      return games.filter(
        (g) =>
          g.type &&
          KNOCKOUT_LABELS[g.type.toLowerCase()] === targetLabel,
      );
    }

    return games;
  }, [games, activeTab]);

  return (
    <section className="w-full space-y-6">
      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              activeTab === tab.id
                ? "bg-amber-500 border-amber-500 text-white shadow-sm"
                : "border-border bg-background text-muted-foreground hover:border-foreground/30 hover:text-foreground",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Match grid */}
      {filtered.length === 0 ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">
          No matches found.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((game) => (
            <MatchCard key={game._id} game={game} />
          ))}
        </div>
      )}
    </section>
  );
}
