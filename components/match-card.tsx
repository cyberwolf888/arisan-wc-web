import Image from "next/image";

import { parseScorers, type EnrichedGame } from "@/lib/games-api";
import { formatMatchDate } from "@/lib/format-date";

const KNOCKOUT_LABELS: Record<string, string> = {
  r32: "Round of 32",
  round_of_32: "Round of 32",
  r16: "Round of 16",
  round_of_16: "Round of 16",
  qf: "Quarter-Final",
  quarter_final: "Quarter-Final",
  sf: "Semi-Final",
  semi_final: "Semi-Final",
  "3rd": "Third Place",
  third_place: "Third Place",
  final: "Final",
};

type Props = {
  game: EnrichedGame;
  homeMemberName?: string | null;
  awayMemberName?: string | null;
};

export function MatchCard({ game, homeMemberName, awayMemberName }: Props) {
  const isFinished = game.finished?.toUpperCase() === "TRUE";
  const homeScorers = parseScorers(game.home_scorers);
  const awayScorers = parseScorers(game.away_scorers);
  const hasScorers = homeScorers.length > 0 || awayScorers.length > 0;

  const typeKey = game.type?.toLowerCase() ?? "";
  const isGroupStage = typeKey === "group";
  const groupLabel = isGroupStage && game.group
    ? `Group ${game.group}`
    : (KNOCKOUT_LABELS[typeKey] ?? game.group ?? game.type ?? "Match");

  return (
    <div className="flex flex-col rounded-2xl border border-border bg-card text-card-foreground shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800 border border-amber-200">
          {groupLabel}
        </span>
        <span className="text-xs text-muted-foreground font-medium">
          Matchday {game.matchday}
        </span>
      </div>

      {/* Teams row */}
      <div className="flex items-center justify-between px-4 py-3 gap-2">
        {/* Home */}
        <div className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
          <div className="relative w-14 h-10 rounded overflow-hidden border border-border flex-shrink-0">
            {game.homeFlagUrl ? (
              <Image
                src={game.homeFlagUrl}
                alt={`${game.home_team_name_en} flag`}
                fill
                className="object-cover"
                sizes="56px"
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground text-xs">
                ?
              </div>
            )}
          </div>
          <span className="text-xs font-semibold text-center leading-tight line-clamp-2">
            {game.home_team_name_en}
          </span>
          {homeMemberName && (
            <span className="text-[0.65rem] text-muted-foreground text-center leading-tight">
              {homeMemberName}
            </span>
          )}
        </div>

        {/* vs */}
        <span className="text-sm font-bold text-muted-foreground flex-shrink-0 px-1">
          vs
        </span>

        {/* Away */}
        <div className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
          <div className="relative w-14 h-10 rounded overflow-hidden border border-border flex-shrink-0">
            {game.awayFlagUrl ? (
              <Image
                src={game.awayFlagUrl}
                alt={`${game.away_team_name_en} flag`}
                fill
                className="object-cover"
                sizes="56px"
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground text-xs">
                ?
              </div>
            )}
          </div>
          <span className="text-xs font-semibold text-center leading-tight line-clamp-2">
            {game.away_team_name_en}
          </span>
          {awayMemberName && (
            <span className="text-[0.65rem] text-muted-foreground text-center leading-tight">
              {awayMemberName}
            </span>
          )}
        </div>
      </div>

      {/* Score / Date */}
      <div className="flex items-center justify-center px-4 py-3">
        {isFinished ? (
          <span className="text-3xl font-bold text-amber-500 tracking-wide tabular-nums">
            {game.home_score} - {game.away_score}
          </span>
        ) : (
          <span className="text-sm text-muted-foreground font-medium">
            {formatMatchDate(game.local_date) || game.local_date}
          </span>
        )}
      </div>

      {/* Scorers footer */}
      <div className="border-t border-border mt-auto">
        {hasScorers ? (
          <div className="flex justify-between gap-3 px-4 py-2.5">
            <ul className="flex flex-col gap-0.5 min-w-0">
              {homeScorers.map((s, i) => (
                <li key={i} className="text-[0.65rem] text-muted-foreground truncate">
                  {s}
                </li>
              ))}
            </ul>
            <ul className="flex flex-col gap-0.5 min-w-0 text-right">
              {awayScorers.map((s, i) => (
                <li key={i} className="text-[0.65rem] text-muted-foreground truncate">
                  {s}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="h-2.5" />
        )}
      </div>
    </div>
  );
}
