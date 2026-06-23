import Image from "next/image";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type TeamCardProps = {
  team: {
    name_en: string | null;
    flag: string | null;
  };
  members: string[];
};

export function TeamCard({ team, members }: TeamCardProps) {
  const teamName = team.name_en?.trim() || "Unknown team";

  return (
    <Card className="h-full border border-border/70 bg-card/90 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-14 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border/70 bg-muted/30">
            {team.flag ? (
              <Image
                src={team.flag}
                alt={`${teamName} flag`}
                width={80}
                height={60}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            ) : (
              <span className="text-[0.65rem] font-semibold tracking-wide text-muted-foreground uppercase">
                No Flag
              </span>
            )}
          </div>
          <CardTitle className="text-sm leading-snug">{teamName}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {members.length > 0 ? (
          <ul className="space-y-1.5 text-sm">
            {members.map((memberName, index) => (
              <li
                key={`${memberName}-${index}`}
                className="rounded-md bg-muted/45 px-2 py-1.5 text-foreground"
              >
                {memberName}
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-md border border-dashed border-border/70 bg-muted/25 px-2 py-2 text-xs text-muted-foreground">
            No representatives assigned yet.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
