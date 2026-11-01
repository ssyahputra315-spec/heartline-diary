import { emptyData, type AppData } from "./types";
import { isValidDateStr } from "./dates";

const STORAGE_KEY = "mylovediary.data.v1";

export function loadData(): AppData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return normalize(JSON.parse(raw) as Partial<AppData>);
  } catch {
    return null;
  }
}

export function saveData(data: AppData): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

export function clearData(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

/** Coerce imported/persisted JSON into a fully-shaped AppData. Invalid rows are dropped. */
export function normalize(input: Partial<AppData>): AppData {
  const base = emptyData();
  const d: AppData = {
    ...base,
    ...input,
    version: 1,
    profile: { ...base.profile, ...(input.profile ?? {}) },
  };
  d.checkIns = (input.checkIns ?? []).filter(
    (c): c is AppData["checkIns"][number] =>
      !!c && typeof c === "object" && isValidDateStr((c as { date?: string }).date ?? "") &&
      Array.isArray((c as { moods?: unknown }).moods) && (c as { moods: unknown[] }).moods.length > 0,
  );
  d.entries = (input.entries ?? []).filter(
    (e): e is AppData["entries"][number] =>
      !!e && typeof e === "object" && isValidDateStr((e as { date?: string }).date ?? ""),
  );
  d.memories = (input.memories ?? []).filter(
    (m): m is AppData["memories"][number] =>
      !!m && typeof m === "object" && isValidDateStr((m as { date?: string }).date ?? ""),
  );
  d.importantDates = (input.importantDates ?? []).filter(
    (i): i is AppData["importantDates"][number] =>
      !!i && typeof i === "object" && isValidDateStr((i as { date?: string }).date ?? ""),
  );
  d.gratitudes = (input.gratitudes ?? []).filter(
    (g): g is AppData["gratitudes"][number] => !!g && typeof g === "object" && typeof (g as { text?: string }).text === "string",
  );
  d.bucketList = (input.bucketList ?? []).filter(
    (b): b is AppData["bucketList"][number] => !!b && typeof b === "object" && typeof (b as { title?: string }).title === "string",
  );
  d.futureLetters = (input.futureLetters ?? []).filter(
    (l): l is AppData["futureLetters"][number] =>
      !!l && typeof l === "object" && isValidDateStr((l as { openDate?: string }).openDate ?? ""),
  );
  d.dateIdeas = (input.dateIdeas ?? []).filter(
    (i): i is AppData["dateIdeas"][number] => !!i && typeof i === "object" && typeof (i as { title?: string }).title === "string",
  );
  d.checkups = (input.checkups ?? []).filter(
    (c): c is AppData["checkups"][number] =>
      !!c && typeof c === "object" && isValidDateStr((c as { date?: string }).date ?? ""),
  );
  d.growthRatings = (input.growthRatings ?? []).filter(
    (g): g is AppData["growthRatings"][number] =>
      !!g && typeof g === "object" && typeof (g as { weekKey?: string }).weekKey === "string",
  );
  d.favorites = (input.favorites ?? []).filter(
    (f): f is AppData["favorites"][number] =>
      !!f && typeof f === "object" && typeof (f as { text?: string }).text === "string" &&
      ((f as { kind?: string }).kind === "message" || (f as { kind?: string }).kind === "question"),
  );
  return d;
}

export { STORAGE_KEY };
