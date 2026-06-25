import { MatchCard } from "@/components/match-card";
import type { EnrichedGame } from "@/lib/games-api";

export type R32Game = EnrichedGame & {
  homeMemberName: string | null;
  awayMemberName: string | null;
};

type Props = {
  games: R32Game[];
};

export function R32MatchesSection({ games }: Props) {
  if (games.length === 0) return null;

  return (
    <section className="w-full space-y-4">
      <div className="flex items-center gap-3">
        <h2 className="text-base font-semibold tracking-tight">Round of 32</h2>
        <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800 border border-amber-200">
          R32
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {games.map((game) => (
          <MatchCard
            key={game._id}
            game={game}
            homeMemberName={game.homeMemberName}
            awayMemberName={game.awayMemberName}
          />
        ))}
      </div>
    </section>
  );
}
