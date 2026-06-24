const GROUPS_API_URL = "https://worldcup26.ir/get/groups";

export type ApiTeamStats = {
  _id: string;
  team_id: string; // matches teams.id (numeric, as string)
  mp: string;
  w: string;
  d: string;
  l: string;
  pts: string;
  gf: string;
  ga: string;
  gd: string;
};

export type ApiGroup = {
  _id: string;
  name: string; // e.g. "H"
  teams: ApiTeamStats[];
  createdAt: string;
  updatedAt: string;
  __v: number;
};

type ApiResponse = {
  groups: ApiGroup[];
};

/**
 * Fetch group standings from the external API.
 * Returns a map of normalized group name → sorted (by pts desc) team stats.
 * Cached by Next.js for 5 minutes.
 * Falls back to an empty map on error.
 */
export async function fetchGroupStandings(): Promise<Map<string, ApiTeamStats[]>> {
  try {
    const res = await fetch(GROUPS_API_URL, {
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      console.error(`[groups-api] HTTP ${res.status} from ${GROUPS_API_URL}`);
      return new Map();
    }

    const json: ApiResponse = await res.json();

    const map = new Map<string, ApiTeamStats[]>();

    for (const group of json.groups ?? []) {
      const key = group.name.trim().toUpperCase();
      const sorted = [...group.teams].sort(
        (a, b) => parseInt(b.pts, 10) - parseInt(a.pts, 10),
      );
      map.set(key, sorted);
    }

    return map;
  } catch (err) {
    console.error("[groups-api] Failed to fetch group standings:", err);
    return new Map();
  }
}
