/** Date helpers. All dates are local-time "YYYY-MM-DD" strings. */

export const pad = (n: number) => String(n).padStart(2, "0");

export function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function todayStr(): string {
  return toDateStr(new Date());
}

export function parseDate(s: string): Date {
  const parts = s.split("-").map(Number);
  const y = parts[0] ?? 1970;
  const m = parts[1] ?? 1;
  const d = parts[2] ?? 1;
  return new Date(y, m - 1, d);
}

export function isValidDateStr(s: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = parseDate(s);
  return !Number.isNaN(d.getTime()) && toDateStr(d) === s;
}

export function addDays(s: string, days: number): string {
  const d = parseDate(s);
  d.setDate(d.getDate() + days);
  return toDateStr(d);
}

export function daysBetween(from: string, to: string): number {
  const a = parseDate(from).getTime();
  const b = parseDate(to).getTime();
  return Math.round((b - a) / 86_400_000);
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function formatDate(s: string, style: "long" | "short" | "medium" = "medium"): string {
  if (!isValidDateStr(s)) return "";
  const d = parseDate(s);
  if (style === "long") return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  if (style === "short") return `${pad(d.getMonth() + 1)}/${pad(d.getDate())}`;
  return `${MONTHS[d.getMonth()].slice(0, 3)} ${d.getDate()}, ${d.getFullYear()}`;
}

export function monthLabel(year: number, month: number): string {
  return `${MONTHS[month] ?? ""} ${year}`;
}

/** "2 years, 3 months" since `start` (or "" when not set). */
export function relationshipDuration(start: string, now = todayStr()): { years: number; months: number; days: number } | null {
  if (!isValidDateStr(start)) return null;
  const a = parseDate(start);
  const b = parseDate(now);
  let years = b.getFullYear() - a.getFullYear();
  let months = b.getMonth() - a.getMonth();
  let days = b.getDate() - a.getDate();
  if (days < 0) {
    months -= 1;
    days += new Date(b.getFullYear(), b.getMonth(), 0).getDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  if (years < 0) return null;
  return { years, months, days };
}

export function durationText(d: { years: number; months: number; days: number } | null): string {
  if (!d) return "";
  const parts: string[] = [];
  if (d.years) parts.push(`${d.years} year${d.years === 1 ? "" : "s"}`);
  if (d.months) parts.push(`${d.months} month${d.months === 1 ? "" : "s"}`);
  if (!d.years && d.days) parts.push(`${d.days} day${d.days === 1 ? "" : "s"}`);
  return parts.length ? parts.join(", ") : "Day 1";
}

/** Days until the next yearly occurrence of `date` (0 = today). */
export function daysUntilNext(date: string, now = todayStr()): number | null {
  if (!isValidDateStr(date)) return null;
  const today = parseDate(now);
  const next = parseDate(date);
  next.setFullYear(today.getFullYear());
  if (next.getTime() < parseDate(now).getTime()) next.setFullYear(today.getFullYear() + 1);
  return daysBetween(now, toDateStr(next));
}

/** ISO week key like "2026-W44". */
export function isoWeekKey(s: string): string {
  const d = parseDate(s);
  const target = new Date(d.getTime());
  const dayNr = (d.getDay() + 6) % 7; // Mon=0..Sun=6
  target.setDate(target.getDate() - dayNr + 3); // Thursday of this week
  const firstThursday = new Date(target.getFullYear(), 0, 4);
  const firstDayNr = (firstThursday.getDay() + 6) % 7;
  firstThursday.setDate(firstThursday.getDate() - firstDayNr + 3);
  const week = 1 + Math.round((target.getTime() - firstThursday.getTime()) / (7 * 86_400_000));
  return `${target.getFullYear()}-W${pad(week)}`;
}

/** Monday of the ISO week containing `s`. */
export function weekStart(s: string): string {
  const d = parseDate(s);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return toDateStr(d);
}

/** Month/day match across years (for On This Day). */
export function sameMonthDay(a: string, b: string): boolean {
  return a.slice(5) === b.slice(5);
}

/** Grid of 42 day-slots (Mon-Sun, 6 rows) for a calendar month. Each slot is a date string or null. */
export function monthGrid(year: number, month: number): (string | null)[] {
  const first = new Date(year, month, 1);
  const lead = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (string | null)[] = [];
  for (let i = 0; i < lead; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(toDateStr(new Date(year, month, d)));
  while (cells.length % 7 !== 0) cells.push(null);
  while (cells.length < 42) cells.push(null);
  return cells;
}

export const WEEKDAY_LETTERS = ["M", "T", "W", "T", "F", "S", "S"];

export function greeting(hour: number): string {
  if (hour < 5) return "Good night";
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}
