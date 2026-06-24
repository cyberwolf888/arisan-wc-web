"use client"

import { useMemo, useState } from "react"
import { Search, X } from "lucide-react"

import { GroupStandingsTable, type EnrichedTeam } from "@/components/group-standings-table"
import { Input } from "@/components/ui/input"

type Props = {
  orderedGroups: string[]
  enrichedByGroup: Record<string, EnrichedTeam[]>
}

function matchesQuery(team: EnrichedTeam, query: string): boolean {
  const q = query.toLowerCase()
  if (team.nameEn.toLowerCase().includes(q)) return true
  return team.members.some((m) => m.toLowerCase().includes(q))
}

export function HomeSearchWrapper({ orderedGroups, enrichedByGroup }: Props) {
  const [query, setQuery] = useState("")

  const filteredGroups = useMemo(() => {
    if (!query.trim()) {
      return orderedGroups.map((group) => ({
        group,
        teams: enrichedByGroup[group] ?? [],
      }))
    }

    return orderedGroups
      .map((group) => {
        const teams = (enrichedByGroup[group] ?? []).filter((team) =>
          matchesQuery(team, query.trim()),
        )
        return { group, teams }
      })
      .filter(({ teams }) => teams.length > 0)
  }, [query, orderedGroups, enrichedByGroup])

  const hasResults = filteredGroups.some(({ teams }) => teams.length > 0)

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search teams or members..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9 pr-9"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {query.trim() && !hasResults ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          No teams or members match your search.
        </p>
      ) : (
        filteredGroups.map(({ group, teams }) => (
          <GroupStandingsTable key={group} groupName={group} teams={teams} />
        ))
      )}
    </div>
  )
}
