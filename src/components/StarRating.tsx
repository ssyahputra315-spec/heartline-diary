import { Heart } from "lucide-react";

/** 1–5 tap rating used by the relationship checkup and growth areas. */
export function StarRating({
  value,
  onChange,
  max = 5,
}: {
  value: number | undefined;
  onChange: (v: number) => void;
  max?: number;
}) {
  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label={`Rating out of ${max}`}>
      {Array.from({ length: max }, (_, i) => i + 1).map((v) => {
        const filled = (value ?? 0) >= v;
        return (
          <button
            key={v}
            type="button"
            role="radio"
            aria-checked={value === v}
            aria-label={`${v} of ${max}`}
            onClick={() => onChange(v)}
            className="rounded-full p-0.5 transition-transform active:scale-90"
          >
            <Heart
              className={`h-5 w-5 transition-colors ${filled ? "fill-primary text-primary" : "text-muted-foreground/40"}`}
            />
          </button>
        );
      })}
    </div>
  );
}
