import { daysBetween, isoWeekKey, todayStr } from "./dates";
import type { AppData, CheckIn, DiaryEntry, MoodId, MoodDef } from "./types";

/** Longest run of consecutive check-in days ending today (or yesterday, so a
 * day without a check-in yet doesn't zero the streak). */
export function checkInStreak(checkIns: CheckIn[], now = todayStr()): number {
  const dates = new Set(checkIns.map((c) => c.date));
  let streak = 0;
  let cursor = now;
  if (!dates.has(cursor)) {
    const yesterday = new Date(now + "T00:00:00");
    yesterday.setDate(yesterday.getDate() - 1);
    const yStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;
    if (!dates.has(yStr)) return 0;
    cursor = yStr;
  }
  while (dates.has(cursor)) {
    streak += 1;
    const d = new Date(cursor + "T00:00:00");
    d.setDate(d.getDate() - 1);
    cursor = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }
  return streak;
}

/** Mood counts across the last `days` days, combining check-ins and entries. */
export function moodCounts(
  data: Pick<AppData, "checkIns" | "entries">,
  days = 30,
  now = todayStr(),
): Map<MoodId, number> {
  const cutoff = new Date(now + "T00:00:00");
  cutoff.setDate(cutoff.getDate() - days + 1);
  const cutoffStr = `${cutoff.getFullYear()}-${String(cutoff.getMonth() + 1).padStart(2, "0")}-${String(cutoff.getDate()).padStart(2, "0")}`;
  const counts = new Map<MoodId, number>();
  const add = (moods: MoodId[]) => moods.forEach((m) => counts.set(m, (counts.get(m) ?? 0) + 1));
  data.checkIns.filter((c) => c.date >= cutoffStr).forEach((c) => add(c.moods));
  data.entries.filter((e) => e.date >= cutoffStr).forEach((e) => add(e.moods));
  return counts;
}

/** Share of positive moods (0–1) in one day's moods; null when no moods. */
export function dayPositivity(moods: MoodId[], moodDefs: MoodDef[]): number | null {
  if (!moods.length) return null;
  const positive = moods.filter((m) => moodDefs.find((d) => d.id === m)?.positive).length;
  return positive / moods.length;
}

/** Average positivity per ISO week for the last `weeks` weeks. */
export function weeklyPositivity(
  checkIns: CheckIn[],
  entries: DiaryEntry[],
  moodDefs: MoodDef[],
  weeks = 8,
  now = todayStr(),
): { weekKey: string; avg: number | null }[] {
  const byWeek = new Map<string, number[]>();
  const consider = (date: string, moods: MoodId[]) => {
    const p = dayPositivity(moods, moodDefs);
    if (p === null) return;
    const wk = isoWeekKey(date);
    const arr = byWeek.get(wk) ?? [];
    arr.push(p);
    byWeek.set(wk, arr);
  };
  checkIns.forEach((c) => consider(c.date, c.moods));
  entries.forEach((e) => consider(e.date, e.moods));

  const out: { weekKey: string; avg: number | null }[] = [];
  const today = new Date(now + "T00:00:00");
  for (let i = weeks - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i * 7);
    const key = isoWeekKey(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`);
    const arr = byWeek.get(key);
    out.push({
      weekKey: key,
      avg: arr?.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null,
    });
  }
  return out;
}

/** Count of diary entries written in the last `days` days. */
export function recentEntryCount(entries: DiaryEntry[], days = 30, now = todayStr()): number {
  const cutoff = new Date(now + "T00:00:00");
  cutoff.setDate(cutoff.getDate() - days + 1);
  const cutoffStr = `${cutoff.getFullYear()}-${String(cutoff.getMonth() + 1).padStart(2, "0")}-${String(cutoff.getDate()).padStart(2, "0")}`;
  return entries.filter((e) => e.date >= cutoffStr).length;
}

/** Days a given date is away (recurring dates wrap to the next year). */
export function daysAway(date: string, recurring: boolean, now = todayStr()): number {
  if (recurring) {
    const today = new Date(now + "T00:00:00");
    const target = new Date(date + "T00:00:00");
    target.setFullYear(today.getFullYear());
    if (target.getTime() < today.getTime()) target.setFullYear(today.getFullYear() + 1);
    return Math.round((target.getTime() - today.getTime()) / 86_400_000);
  }
  return daysBetween(now, date);
}
