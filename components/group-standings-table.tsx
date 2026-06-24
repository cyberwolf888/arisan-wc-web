import Image from "next/image";

export type EnrichedTeam = {
  teamId: string;
  numericId: number | null;
  nameEn: string;
  flag: string | null;
  members: string[];
  mp: number;
  w: number;
  d: number;
  l: number;
  pts: number;
};

type GroupStandingsTableProps = {
  groupName: string;
  teams: EnrichedTeam[];
};

export function GroupStandingsTable({ groupName, teams }: GroupStandingsTableProps) {
  const title = groupName === "UNGROUPED" ? "Ungrouped" : `Group ${groupName}`;

  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-card/70 shadow-sm">
      <div className="flex items-center justify-between px-5 py-4">
        <h2 className="text-lg font-semibold tracking-tight">⚽ {title}</h2>
        <span className="text-xl" role="img" aria-label="trophy">
          🏆
        </span>
      </div>

      <div className="border-t border-border/30 px-4 py-2.5">
        <div className="grid grid-cols-[2.5rem_1fr_3rem_3rem_3rem_3rem_3rem] items-center">
          <span className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">#</span>
          <span className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">Team</span>
          <span className="text-center text-xs font-semibold tracking-widest text-muted-foreground uppercase">MP</span>
          <span className="text-center text-xs font-semibold tracking-widest text-muted-foreground uppercase">W</span>
          <span className="text-center text-xs font-semibold tracking-widest text-muted-foreground uppercase">D</span>
          <span className="text-center text-xs font-semibold tracking-widest text-muted-foreground uppercase">L</span>
          <span className="text-center text-xs font-semibold tracking-widest text-muted-foreground uppercase">Pts</span>
        </div>
      </div>

      {teams.length === 0 ? (
        <p className="px-4 py-6 text-sm text-muted-foreground">
          No teams in this group yet.
        </p>
      ) : (
        teams.map((team, index) => {
          const rank = index + 1;
          const isTopTwo = rank <= 2;

          return (
            <div
              key={team.teamId}
              className={`grid grid-cols-[2.5rem_1fr_3rem_3rem_3rem_3rem_3rem] items-center border-t border-border/20 px-4 py-3 ${
                index % 2 === 0 ? "bg-muted/15" : ""
              }`}
            >
              <div
                className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold"
                style={{
                  backgroundColor: isTopTwo ? "#fef3c7" : "#f3f4f6",
                  color: isTopTwo ? "#92400e" : "#6b7280",
                }}
              >
                {rank}
              </div>

              <div className="flex min-w-0 items-center gap-2.5">
                <div className="flex h-8 w-11 shrink-0 overflow-hidden rounded border border-border/70">
                  {team.flag ? (
                    <Image
                      src={team.flag}
                      alt={`${team.nameEn} flag`}
                      width={60}
                      height={40}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-muted/30 text-[0.5rem] text-muted-foreground">
                      —
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium leading-snug">
                    {team.nameEn}
                  </p>
                  {team.members.length > 0 && (
                    <p className="truncate text-[0.68rem] leading-tight text-muted-foreground">
                      {team.members.join(", ")}
                    </p>
                  )}
                </div>
              </div>

              <span className="text-center text-sm">{team.mp}</span>
              <span className="text-center text-sm font-medium text-green-600">{team.w}</span>
              <span className="text-center text-sm">{team.d}</span>
              <span className="text-center text-sm font-medium text-red-600">{team.l}</span>
              <span className="text-center text-sm font-bold">{team.pts}</span>
            </div>
          );
        })
      )}
    </div>
  );
}
