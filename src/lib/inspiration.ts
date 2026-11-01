/**
 * Offline inspiration library. Everything here is bundled with the app —
 * no network requests, no remote fonts or images.
 * 8 categories × 14 messages (112 total) and 8 × 13 questions (104 total).
 */

export type InspirationCategoryId =
  | "love"
  | "communication"
  | "trust"
  | "distance"
  | "challenges"
  | "self-love"
  | "appreciation"
  | "boundaries";

export interface InspirationCategoryDef {
  id: InspirationCategoryId;
  label: string;
}

export const INSPIRATION_CATEGORIES: InspirationCategoryDef[] = [
  { id: "love", label: "Love & Affection" },
  { id: "communication", label: "Communication" },
  { id: "trust", label: "Trust & Respect" },
  { id: "distance", label: "Long-Distance Love" },
  { id: "challenges", label: "Relationship Challenges" },
  { id: "self-love", label: "Self-Love" },
  { id: "appreciation", label: "Appreciation" },
  { id: "boundaries", label: "Healthy Boundaries" },
];

const MESSAGES: Record<InspirationCategoryId, string[]> = {
  love: [
    "Love is not about finding the perfect person, but about seeing an imperfect person perfectly.",
    "A strong relationship is built on a thousand small moments of tenderness.",
    "Being deeply loved by someone gives you strength, while loving someone deeply gives you courage.",
    "The best proof of love is trust, and the sweetest is presence.",
    "Love grows strongest when it is watered with attention and honesty.",
    "You do not need a special occasion to tell someone you love them; today is enough.",
    "Real love is choosing the same person again and again, even on the hard days.",
    "Small gestures, repeated daily, build a lifetime of love.",
    "To love and be loved is to feel the sun from both sides.",
    "Love is a habit as much as a feeling — practice it gently.",
    "The heart remembers the little things far longer than the grand ones.",
    "Where love is concerned, too much is not even enough.",
    "A gentle word in a difficult moment is an act of love.",
    "Love does not dominate; it cultivates.",
  ],
  communication: [
    "Speak to be understood, listen to understand.",
    "The most important thing in communication is hearing what isn't said.",
    "A soft answer turns away frustration — pause before you respond.",
    "Say what you mean with kindness; silence often speaks the wrong language.",
    "Ask more, assume less.",
    "When you feel unheard, say so calmly; your voice matters too.",
    "Good conversations begin with curiosity, not accusation.",
    "Timing matters: pick a calm moment for hard conversations.",
    "You can be right, or you can be close — choose carefully.",
    "Listening fully is one of the purest forms of love.",
    "Use 'I feel' instead of 'you always' and watch walls become bridges.",
    "It is okay to take a break from a hard talk — just agree to return to it.",
    "Clarity is kindness; vague hints create quiet hurts.",
    "Share the small stuff — intimacy is built from ordinary details.",
  ],
  trust: [
    "Trust is built in drops and lost in buckets — guard it gently.",
    "Respect is love standing at attention.",
    "Keep your small promises; they are the foundation of the big ones.",
    "Trust means giving your partner room to be themselves.",
    "Honesty may sting for a moment, but secrecy aches for much longer.",
    "A relationship without respect is like a house without a floor.",
    "Be someone your partner never has to double-check.",
    "Respect their time, their feelings, and their dreams equally.",
    "Trust is quiet confidence, not constant surveillance.",
    "When trust cracks, repair begins with patience and truth.",
    "Loyalty is love in its most reliable outfit.",
    "Respect differences — you are teammates, not clones.",
    "Say what you will do, then do what you said.",
    "Trust grows every time honesty costs you something and you choose it anyway.",
  ],
  distance: [
    "Distance means so little when someone means so much.",
    "Miles apart, close at heart.",
    "Write love letters with patience; anticipation is part of the romance.",
    "Plan the next visit — having a date to look forward to changes everything.",
    "Love knows not its own depth until the hour of separation.",
    "Send a voice note today; your tone carries more than your words.",
    "Countdowns are hard, but reunions are sweeter for them.",
    "Time zones are just details when the heart keeps its own clock.",
    "A shared ritual, even over a call, makes distance feel designed.",
    "The waiting is not wasted — it is proof of how much you care.",
    "Talk about the future, not only the past; it keeps hope alive.",
    "Absence sharpens love, presence settles it.",
    "Celebrate small wins together, even through a screen.",
    "Distance tests love, but it also teaches devotion.",
  ],
  challenges: [
    "Every couple argues; strong couples repair well.",
    "You are on the same side of the problem, not opposite sides of the table.",
    "Conflict handled with respect can deepen love, not damage it.",
    "Ask yourself: do I want to win this argument, or do I want us to be okay?",
    "Apologize for the impact even when your intention was innocent.",
    "Hard seasons do not mean wrong love; they mean real love needs work.",
    "Repair quickly — small ruptures left alone become large ones.",
    "It is not you against me; it is us against the problem.",
    "Forgiveness is a gift you give both of you.",
    "When overwhelmed, say so instead of shutting down.",
    "Choose curiosity over criticism when your partner disappoints you.",
    "Some issues need a calendar, not a fight — schedule them calmly.",
    "Growth often feels uncomfortable right before it feels good.",
    "Struggling together is still being together.",
  ],
  "self-love": [
    "You deserve the same kindness you give so freely to others.",
    "A healthy relationship starts with a healthy relationship with yourself.",
    "Rest is not a reward; it is a requirement.",
    "You cannot pour from an empty cup — refill yours first.",
    "Be as gentle with yourself as you would be with your best friend.",
    "Your worth does not depend on how useful you are to others.",
    "Celebrate your own growth, even when no one else notices.",
    "Saying no to what drains you is saying yes to what fills you.",
    "You are allowed to take up space and to take your time.",
    "Treat your body, mind, and heart like they belong to someone you love — because they do.",
    "Comparison steals joy; your path is yours alone.",
    "Self-care is not selfish; it is maintenance for the person everyone loves.",
    "It is brave to ask for help and wiser still to accept it.",
    "Speak to your inner self in the same warm voice you use with your partner.",
  ],
  appreciation: [
    "Feeling appreciated is as important as being loved.",
    "Notice the ordinary efforts — they are the invisible pillars of your home.",
    "Thank your partner for something small today; watch the whole day change.",
    "Appreciation is telling someone their effort landed.",
    "The people who do the most are often thanked the least — be the exception.",
    "Gratitude turns what we have into enough.",
    "Say the compliment out loud; a thought unspoken helps no one.",
    "Keep a note of things your partner does right — reread it on hard days.",
    "Appreciation is love made visible.",
    "A thank-you today prevents a resentment tomorrow.",
    "Catch your partner doing something right, and tell them.",
    "Kind words cost nothing and change everything.",
    "Remember how it felt before you had this — and say so.",
    "Appreciation multiplies: the more you notice, the more appears.",
  ],
  boundaries: [
    "Boundaries are not walls; they are doors with handles you both control.",
    "Healthy limits protect the love, not restrict it.",
    "Saying no to one thing is saying yes to something that matters more.",
    "A boundary stated kindly is a gift of clarity.",
    "You can love someone deeply and still need space — both are true.",
    "Respecting a boundary is one of the clearest ways to show love.",
    "Boundaries teach people how to love you well.",
    "It is okay to need alone time; it makes together-time richer.",
    "Discuss limits when you are calm, not mid-conflict.",
    "Boundaries without consistency are just suggestions.",
    "Your needs are not inconveniences; they are information.",
    "Clear expectations prevent quiet resentments.",
    "A boundary is about your behavior, not controlling theirs.",
    "Love flourishes in the space between closeness and respect.",
  ],
};

const QUESTIONS: Record<InspirationCategoryId, string[]> = {
  love: [
    "What made you fall for your partner — and which of those qualities still shines today?",
    "When did you last feel genuinely adored? What caused it?",
    "What is one small ritual you would love the two of you to start?",
    "How do you like to be loved, and have you told your partner lately?",
    "What does romance mean to you outside of special occasions?",
    "Which memory together makes you smile the fastest?",
    "What song, smell, or place instantly reminds you of your partner?",
    "What is something loving your partner does that they may not realize you notice?",
    "How has your way of loving changed since the relationship began?",
    "What would a perfect ordinary day together look like?",
    "What love story — real or fictional — inspires how you love?",
    "Where is the best place to show more affection in your daily routine?",
    "What do you hope love between you looks like in ten years?",
  ],
  communication: [
    "What is something you have been avoiding saying, and what makes it hard?",
    "When do you feel most heard by your partner?",
    "What topic do the two of you circle around without resolving?",
    "How do you usually react when a conversation gets tense?",
    "What could your partner say that would instantly make you feel safe in a hard talk?",
    "What is a question you wish someone would ask you?",
    "How well do you understand your partner's stress signals?",
    "What small misunderstanding happened recently, and what would have prevented it?",
    "Do you share good news as enthusiastically as you share worries?",
    "What does 'listening well' look like in your relationship right now?",
    "How do you each prefer to bring up sensitive topics — directly, gently, in writing?",
    "What is one thing you could stop saying that hurts more than it helps?",
    "When was the last deep conversation you had, and what made it possible?",
  ],
  trust: [
    "What does trust look like in your daily life together?",
    "Is there a small promise you could make this week — and keep?",
    "Where do you feel completely safe with your partner, and where less so?",
    "What has your partner done that strengthened your trust the most?",
    "Do you give your partner the benefit of the doubt as often as you would like?",
    "How do you respond when you feel uncertain instead of trusting?",
    "What boundary of privacy and honesty feels right for you both?",
    "Have you fully repaired an old hurt, or does it still echo?",
    "What does respect mean to you beyond politeness?",
    "When was the last time you admited a mistake without excuses?",
    "Do your actions this week match the partner you want to be?",
    "What makes you feel proud of how dependable you are?",
    "How do the two of you handle disagreement over decisions that matter?",
  ],
  distance: [
    "What ritual keeps you feeling connected despite the distance?",
    "What are you most looking forward to sharing at your next reunion?",
    "How do you turn waiting time into something meaningful?",
    "What has distance taught you about your love?",
    "How can you make ordinary days feel shared, even apart?",
    "What is the hardest part of the distance, and what would soften it?",
    "What plan for the future excites you both the most?",
    "How do you keep reassurance flowing when doubts creep in?",
    "What surprising thing have you learned about your partner from long conversations?",
    "How do you celebrate milestones when you cannot be together?",
    "What small surprise could you send this week?",
    "How do you balance missing them with living fully today?",
    "What would you want your partner to know on a lonely evening?",
  ],
  challenges: [
    "What is the current challenge in your relationship, stated in one calm sentence?",
    "What part of this challenge is yours to own?",
    "What have past arguments taught you about what actually helps?",
    "What do you need — really need — during a conflict: space, reassurance, time?",
    "Which recurring argument could be solved with a system instead of a talk?",
    "How do you repair after a hard moment, and does it work for both of you?",
    "What stress outside the relationship is spilling into it right now?",
    "What would 'moving forward' look like this week, in one small step?",
    "Where might you be keeping score — and is it helping?",
    "What has your partner taught you about handling difficulty?",
    "What difficult conversation, once had, would lift the most weight?",
    "How do you want to be supported when you are at your worst?",
    "What are you grateful for even inside this hard season?",
  ],
  "self-love": [
    "What do you need right now that you have not let yourself want?",
    "When did you last do something purely because it made you happy?",
    "What self-critical thought keeps repeating, and is it actually true?",
    "How do you recharge, and are you making time for it?",
    "What would you tell a friend in your exact situation?",
    "What are you quietly proud of this month?",
    "Where in your life do you need to set a kinder pace?",
    "What part of yourself are you still learning to accept?",
    "What boundary with others would protect your energy best?",
    "How does taking care of yourself change how you love your partner?",
    "What tiny daily kindness toward yourself could you start today?",
    "What dream of yours deserves more of your attention?",
    "How will you celebrate yourself this week?",
  ],
  appreciation: [
    "What is one thing your partner did this week that you have not yet thanked them for?",
    "What quality of theirs do you most admire — and have you said so recently?",
    "What everyday effort of theirs would be missed most if it stopped?",
    "What sacrifice, big or small, have they made for you this year?",
    "How does your partner make your ordinary life better?",
    "What did they believe in you for before you believed in yourself?",
    "What is the kindest thing a partner has ever done for you?",
    "Who else in your life deserves more appreciation from you?",
    "What about yourself are you grateful for in this relationship?",
    "What habit of theirs turns out to be a quiet gift?",
    "What moment from this month would you thank them for if you rewound the tape?",
    "How can you make appreciation a habit instead of an afterthought?",
    "What would you want thanked about yourself more often?",
  ],
  boundaries: [
    "Where in your relationship do you need more space or more closeness?",
    "What request have you been accepting that quietly drains you?",
    "Which of your boundaries have you never clearly spoken out loud?",
    "How do you respond when your partner sets a boundary with you?",
    "What does a healthy balance of together-time and apart-time look like for you?",
    "What family or social expectation do you need to renegotiate together?",
    "What personal habit or hobby do you want protected time for?",
    "When do you say yes while meaning no — and why?",
    "What conversation about limits would bring you two closer?",
    "What boundary would make you feel most respected this month?",
    "How do you and your partner handle digital privacy and shared accounts?",
    "What does emotional safety require of each of you?",
    "What is one gentle 'no' you could practice this week?",
  ],
};

export const INSPIRATION_MESSAGES: { id: string; category: InspirationCategoryId; text: string }[] = Object.entries(
  MESSAGES,
).flatMap(([category, texts]) =>
  texts.map((text, i) => ({ id: `m_${category}_${i}`, category: category as InspirationCategoryId, text })),
);

export const INSPIRATION_QUESTIONS: { id: string; category: InspirationCategoryId; text: string }[] = Object.entries(
  QUESTIONS,
).flatMap(([category, texts]) =>
  texts.map((text, i) => ({ id: `q_${category}_${i}`, category: category as InspirationCategoryId, text })),
);

/** Deterministic pick for a given date key, offset by slot, across a category pool or the whole pool. */
export function dailyPick<T>(pool: T[], dateKey: string, slot: number): T {
  const seed = dateKey.split("-").reduce((acc, part) => acc * 31 + Number(part), 7) + slot * 13;
  const idx = Math.abs(seed) % pool.length;
  return pool[idx] ?? pool[0]!;
}
