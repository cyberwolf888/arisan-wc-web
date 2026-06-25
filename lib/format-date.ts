/**
 * Parse a match date string from the games API ("MM/DD/YYYY HH:mm"),
 * treat it as UTC, shift to UTC+8, and format as:
 *   "Sunday 28 June 2026, 12:00"
 *
 * Falls back to the raw string if parsing fails.
 */
export function formatMatchDate(localDate: string | null | undefined): string {
  if (!localDate) return "";

  // Expected format: "MM/DD/YYYY HH:mm"
  const match = localDate.match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})$/);
  if (!match) return localDate;

  const [, mm, dd, yyyy, hh, mi] = match;

  // Build UTC Date then shift +8 hours
  const utc = new Date(
    Date.UTC(
      parseInt(yyyy, 10),
      parseInt(mm, 10) - 1,
      parseInt(dd, 10),
      parseInt(hh, 10),
      parseInt(mi, 10),
    ),
  );

  // UTC+8 offset: add 8 * 60 * 60 * 1000 ms
  const utc8 = new Date(utc.getTime() + 8 * 60 * 60 * 1000);

  const dayName = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    timeZone: "UTC",
  }).format(utc8);

  const dayNum = String(utc8.getUTCDate()).padStart(2, "0");

  const monthName = new Intl.DateTimeFormat("en-US", {
    month: "long",
    timeZone: "UTC",
  }).format(utc8);

  const year = utc8.getUTCFullYear();
  const hours = String(utc8.getUTCHours()).padStart(2, "0");
  const minutes = String(utc8.getUTCMinutes()).padStart(2, "0");

  return `${dayName} ${dayNum} ${monthName} ${year}, ${hours}:${minutes}`;
}
