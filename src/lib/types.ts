export type MoodId =
  | "happy"
  | "loved"
  | "grateful"
  | "calm"
  | "excited"
  | "playful"
  | "sad"
  | "anxious"
  | "angry"
  | "tired"
  | "lonely"
  | "confused";

export interface MoodDef {
  id: MoodId;
  label: string;
  positive: boolean;
}

export const MOODS: MoodDef[] = [
  { id: "happy", label: "Happy", positive: true },
  { id: "loved", label: "Loved", positive: true },
  { id: "grateful", label: "Grateful", positive: true },
  { id: "calm", label: "Calm", positive: true },
  { id: "excited", label: "Excited", positive: true },
  { id: "playful", label: "Playful", positive: true },
  { id: "sad", label: "Sad", positive: false },
  { id: "anxious", label: "Anxious", positive: false },
  { id: "angry", label: "Angry", positive: false },
  { id: "tired", label: "Tired", positive: false },
  { id: "lonely", label: "Lonely", positive: false },
  { id: "confused", label: "Confused", positive: false },
];

export const moodDef = (id: MoodId): MoodDef => MOODS.find((m) => m.id === id) ?? MOODS[0]!;

export type DiaryCategoryId =
  | "daily"
  | "happy"
  | "problems"
  | "appreciate"
  | "miss"
  | "unspoken"
  | "letters"
  | "dreams";

export interface DiaryCategoryDef {
  id: DiaryCategoryId;
  label: string;
}

export const DIARY_CATEGORIES: DiaryCategoryDef[] = [
  { id: "daily", label: "Daily Journal" },
  { id: "happy", label: "Happy Moments" },
  { id: "problems", label: "Relationship Problems" },
  { id: "appreciate", label: "Things I Appreciate" },
  { id: "miss", label: "Things I Miss" },
  { id: "unspoken", label: "Unspoken Feelings" },
  { id: "letters", label: "Love Letters" },
  { id: "dreams", label: "Future Dreams" },
];

export const diaryCategory = (id: DiaryCategoryId): DiaryCategoryDef =>
  DIARY_CATEGORIES.find((c) => c.id === id) ?? DIARY_CATEGORIES[0]!;

export type MemoryKind = "first-meeting" | "first-date" | "anniversary" | "trip" | "milestone" | "custom";

export interface MemoryKindDef {
  id: MemoryKind;
  label: string;
}

export const MEMORY_KINDS: MemoryKindDef[] = [
  { id: "first-meeting", label: "First Meeting" },
  { id: "first-date", label: "First Date" },
  { id: "anniversary", label: "Anniversary" },
  { id: "trip", label: "Trip" },
  { id: "milestone", label: "Milestone" },
  { id: "custom", label: "Custom Moment" },
];

export const memoryKind = (id: MemoryKind): MemoryKindDef =>
  MEMORY_KINDS.find((k) => k.id === id) ?? MEMORY_KINDS[5]!;

export type ThemeSetting = "light" | "dark" | "system";

export interface Profile {
  myName: string;
  partnerName: string;
  relationshipStart: string; // YYYY-MM-DD
  myPhotoId: string | null;
  partnerPhotoId: string | null;
  theme: ThemeSetting;
  reminderEnabled: boolean;
  reminderTime: string; // HH:mm
  pinEnabled: boolean;
  pin: string | null;
  loveLanguage: string;
}

export interface DiaryEntry {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  category: DiaryCategoryId;
  moods: MoodId[];
  content: string;
  photoIds: string[];
  tags: string[];
  bookmarked: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface Memory {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  kind: MemoryKind;
  description: string;
  location: string;
  photoIds: string[];
  createdAt: number;
}

export interface ImportantDate {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  recurring: boolean; // repeats every year (anniversary-style)
  note: string;
}

export interface GratitudeNote {
  id: string;
  date: string;
  text: string;
  createdAt: number;
}

export interface BucketItem {
  id: string;
  title: string;
  description: string;
  done: boolean;
  doneAt: number | null;
}

export interface FutureLetter {
  id: string;
  title: string;
  content: string;
  openDate: string; // YYYY-MM-DD
  createdAt: number;
  openedAt: number | null;
}

export type DateIdeaCategory = "at-home" | "outdoors" | "creative" | "cozy" | "adventure";

export interface DateIdea {
  id: string;
  title: string;
  description: string;
  category: DateIdeaCategory;
  custom: boolean;
}

export interface CheckIn {
  id: string;
  date: string; // YYYY-MM-DD, one per day
  moods: MoodId[];
  note: string;
}

export interface CheckupResult {
  id: string;
  date: string;
  answers: Record<string, number>; // question id -> 1..5
  note: string;
}

export interface GrowthRating {
  weekKey: string; // ISO week key, e.g. 2026-W44
  ratings: Partial<Record<GrowthAreaId, number>>; // 1..5
}

export type GrowthAreaId = "communication" | "patience" | "appreciation" | "boundaries" | "quality-time";

export interface GrowthAreaDef {
  id: GrowthAreaId;
  label: string;
  prompt: string;
}

export const GROWTH_AREAS: GrowthAreaDef[] = [
  { id: "communication", label: "Communication", prompt: "How openly did we talk and listen to each other this week?" },
  { id: "patience", label: "Patience", prompt: "How patient did I stay when things felt difficult?" },
  { id: "appreciation", label: "Appreciation", prompt: "How well did I show appreciation for my partner?" },
  { id: "boundaries", label: "Boundaries", prompt: "How well did I respect my own and my partner's boundaries?" },
  { id: "quality-time", label: "Quality Time", prompt: "How present were we during the time we spent together?" },
];

export interface FavoriteItem {
  id: string;
  kind: "message" | "question";
  text: string;
  note: string;
  createdAt: number;
}

export interface AppData {
  version: number;
  profile: Profile;
  checkIns: CheckIn[];
  entries: DiaryEntry[];
  memories: Memory[];
  importantDates: ImportantDate[];
  gratitudes: GratitudeNote[];
  bucketList: BucketItem[];
  futureLetters: FutureLetter[];
  dateIdeas: DateIdea[];
  checkups: CheckupResult[];
  growthRatings: GrowthRating[];
  favorites: FavoriteItem[];
}

export const DEFAULT_PROFILE: Profile = {
  myName: "",
  partnerName: "",
  relationshipStart: "",
  myPhotoId: null,
  partnerPhotoId: null,
  theme: "system",
  reminderEnabled: false,
  reminderTime: "20:00",
  pinEnabled: false,
  pin: null,
  loveLanguage: "",
};

export const emptyData = (): AppData => ({
  version: 1,
  profile: { ...DEFAULT_PROFILE },
  checkIns: [],
  entries: [],
  memories: [],
  importantDates: [],
  gratitudes: [],
  bucketList: [],
  futureLetters: [],
  dateIdeas: [],
  checkups: [],
  growthRatings: [],
  favorites: [],
});
