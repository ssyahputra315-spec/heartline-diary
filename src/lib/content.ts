import type { DateIdea } from "./types";

/** Relationship checkup: reflective questions answered on a 1–5 scale. */
export interface CheckupQuestionDef {
  id: string;
  text: string;
}

export const CHECKUP_QUESTIONS: CheckupQuestionDef[] = [
  { id: "c1", text: "How connected do we feel this week?" },
  { id: "c2", text: "How well are we handling conflict when it appears?" },
  { id: "c3", text: "How much fun are we having together lately?" },
  { id: "c4", text: "How supported do I feel by my partner?" },
  { id: "c5", text: "How well do we make decisions together?" },
  { id: "c6", text: "How satisfied am I with our physical affection?" },
  { id: "c7", text: "How well do we balance togetherness and independence?" },
  { id: "c8", text: "How hopeful do I feel about our future?" },
  { id: "c9", text: "How safe do I feel sharing difficult feelings?" },
  { id: "c10", text: "How fairly do we share everyday responsibilities?" },
];

export const checkupScore = (answers: Record<string, number>): number => {
  const values = CHECKUP_QUESTIONS.map((q) => answers[q.id]).filter(
    (v): v is number => typeof v === "number" && v >= 1 && v <= 5,
  );
  if (!values.length) return 0;
  return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10; // 0–5, one decimal
};

/** Starter date ideas (bundled); users can add their own. */
export const STARTER_DATE_IDEAS: Omit<DateIdea, "id" | "custom">[] = [
  { title: "Cook a new recipe together", description: "Pick something neither of you has made before.", category: "at-home" },
  { title: "Picnic in the park", description: "Blanket, snacks, and no phones.", category: "outdoors" },
  { title: "Recreate your first date", description: "Same place, same order, if you can.", category: "cozy" },
  { title: "Stargazing night", description: "Drive out of the city lights and lie under the sky.", category: "adventure" },
  { title: "Home movie marathon", description: "Take turns picking the films.", category: "at-home" },
  { title: "Sunrise breakfast", description: "Wake up early and watch the sun come up together.", category: "adventure" },
  { title: "Paint each other", description: "Terrible portraits encouraged.", category: "creative" },
  { title: "Bookstore date", description: "Pick a book for each other.", category: "cozy" },
  { title: "Long walk with a question jar", description: "Draw a question every ten minutes.", category: "outdoors" },
  { title: "Bake something sweet", description: "Share it with a neighbor too.", category: "at-home" },
  { title: "Photo scavenger hunt", description: "Find ten things on a list around town.", category: "adventure" },
  { title: "Write letters to your future selves", description: "Open them in one year.", category: "creative" },
  { title: "Dance in the living room", description: "Make a playlist of 'your' songs.", category: "cozy" },
  { title: "Visit a museum or gallery", description: "Argue playfully about your favorite piece.", category: "creative" },
  { title: "Sunset picnic on a hill", description: "Bring something warm to drink.", category: "outdoors" },
  { title: "Couples cooking competition", description: "Two teams if you have friends over; one if not.", category: "at-home" },
  { title: "Day trip to a nearby town", description: "Somewhere neither of you has been.", category: "adventure" },
  { title: "Spa night at home", description: "Masks, music, and early bedtime.", category: "cozy" },
  { title: "Learn something together", description: "A language, an instrument, a dance — one lesson.", category: "creative" },
  { title: "Volunteer together", description: "Spend a morning helping somewhere you both care about.", category: "outdoors" },
  { title: "Board game tournament", description: "Best of five, loser makes dinner.", category: "at-home" },
  { title: "Coffee shop hopping", description: "Rate three cafés in one afternoon.", category: "cozy" },
  { title: "Build a fort and watch a film inside", description: "Blankets and fairy lights required.", category: "cozy" },
  { title: "Make a scrapbook page", description: "Print a few photos and build a memory page together.", category: "creative" },
];

export const DATE_IDEA_CATEGORIES: { id: DateIdea["category"]; label: string }[] = [
  { id: "at-home", label: "At Home" },
  { id: "outdoors", label: "Outdoors" },
  { id: "creative", label: "Creative" },
  { id: "cozy", label: "Cozy" },
  { id: "adventure", label: "Adventure" },
];

export const LOVE_LANGUAGES = [
  "Words of Affirmation",
  "Quality Time",
  "Physical Touch",
  "Acts of Service",
  "Receiving Gifts",
];
