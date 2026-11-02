import type { MoodId } from "@/lib/types";
import { MOODS, moodDef } from "@/lib/types";

export const MOOD_EMOJI: Record<MoodId, string> = {
  happy: "😊",
  loved: "🥰",
  grateful: "🙏",
  calm: "😌",
  excited: "🤩",
  playful: "😜",
  sad: "😢",
  anxious: "😟",
  angry: "😠",
  tired: "😴",
  lonely: "🥺",
  confused: "🤔",
};

export const moodEmoji = (id: MoodId) => MOOD_EMOJI[id] ?? "💜";

/** Row of tappable mood chips. */
export function MoodPicker({
  selected,
  onToggle,
}: {
  selected: MoodId[];
  onToggle: (id: MoodId) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {MOODS.map((m) => {
        const active = selected.includes(m.id);
        return (
          <button
            key={m.id}
            type="button"
            aria-pressed={active}
            onClick={() => onToggle(m.id)}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              active
                ? m.positive
                  ? "border-transparent bg-primary text-primary-foreground"
                  : "border-transparent bg-destructive text-destructive-foreground"
                : "border-border bg-card text-muted-foreground hover:bg-accent"
            }`}
          >
            <span aria-hidden>{MOOD_EMOJI[m.id]}</span>
            {m.label}
          </button>
        );
      })}
    </div>
  );
}

/** Read-only row of mood emojis with the label on hover/sr. */
export function MoodRow({ moods, className = "" }: { moods: MoodId[]; className?: string }) {
  return (
    <span className={`inline-flex flex-wrap items-center gap-1 ${className}`}>
      {moods.map((id) => (
        <span key={id} title={moodDef(id).label} aria-label={moodDef(id).label} className="text-sm">
          {moodEmoji(id)}
        </span>
      ))}
    </span>
  );
}
