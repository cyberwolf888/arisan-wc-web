const GAMES_API_URL = "https://worldcup26.ir/get/games";

export type ApiGame = {
  _id: string;
  id: string;
  home_team_id: string;
  away_team_id: string;
  home_score: string;
  away_score: string;
  home_scorers: string;
  away_scorers: string;
  group: string;
  matchday: string;
  local_date: string;
  persian_date: string;
  stadium_id: string;
  finished: string;
  time_elapsed: string;
  type: string;
  home_team_name_en: string;
  home_team_name_fa: string;
  away_team_name_en: string;
  away_team_name_fa: string;
};

type ApiResponse = {
  games: ApiGame[];
};

/**
 * Parse a PostgreSQL array literal like {"J. Quiñones 9'","R. Jiménez 67'"}
 * into a JS string array. Returns [] for null, "null", or empty.
 */
// The API wraps scorer names in Unicode curly quotes (U+201C/U+201D) or ASCII quotes.
const OPEN_QUOTE = "\u201C";  // "
const CLOSE_QUOTE = "\u201D"; // "

function isQuoteChar(ch: string) {
  return ch === '"' || ch === OPEN_QUOTE || ch === CLOSE_QUOTE;
}

export function parseScorers(raw: string | null | undefined): string[] {
  if (!raw || raw === "null" || raw.trim() === "{}") return [];

  // Strip outer { } if present (PostgreSQL array literal)
  const inner = raw.trim().replace(/^\{/, "").replace(/\}$/, "");
  if (!inner) return [];

  // Split on comma between quoted entries; skip the quote chars themselves
  const results: string[] = [];
  let current = "";
  let inQuote = false;

  for (let i = 0; i < inner.length; i++) {
    const ch = inner[i];

    if (isQuoteChar(ch)) {
      inQuote = !inQuote;
      // Do NOT add the quote character to current
    } else if (ch === "," && !inQuote) {
      const trimmed = current.trim();
      if (trimmed) results.push(trimmed);
      current = "";
    } else {
      current += ch;
    }
  }

  const last = current.trim();
  if (last) results.push(last);

  return results;
}

/** ApiGame enriched with flag URLs from the Supabase teams table. */
export type EnrichedGame = ApiGame & {
  homeFlagUrl: string | null;
  awayFlagUrl: string | null;
};

/**
 * Fetch all games from the external API.
 * Returns [] on error.
 * Cached by Next.js for 5 minutes.
 */
export async function fetchGames(): Promise<ApiGame[]> {
  try {
    const res = await fetch(GAMES_API_URL, {
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      console.error(`[games-api] HTTP ${res.status} from ${GAMES_API_URL}`);
      return [];
    }

    const json: ApiResponse = await res.json();
    return json.games ?? [];
  } catch (err) {
    console.error("[games-api] Failed to fetch games:", err);
    return [];
  }
}
