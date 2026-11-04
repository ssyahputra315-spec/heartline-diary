import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Heart, HelpCircle, MessageCircle, RefreshCw, Sparkles } from "lucide-react";

import { PageShell } from "@/components/PageShell";
import { EmptyState } from "@/components/EmptyState";
import { dailyPick, INSPIRATION_CATEGORIES, INSPIRATION_MESSAGES, INSPIRATION_QUESTIONS, type InspirationCategoryId } from "@/lib/inspiration";
import { todayStr } from "@/lib/dates";
import { useApp, useData } from "@/store/app-store";

type Mode = "messages" | "questions";

export const Route = createFileRoute("/inspiration")({
  component: Inspiration,
  head: () => ({
    meta: [
      { title: "Inspiration · My Love Diary" },
      { name: "description", content: "Daily love notes, reflective questions and conversation starters for your relationship." },
      { property: "og:title", content: "Inspiration · My Love Diary" },
      { property: "og:description", content: "Daily love notes, reflective questions and conversation starters for your relationship." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function Inspiration() {
  const data = useData();
  const { update } = useApp();
  const [mode, setMode] = useState<Mode>("messages");
  const [cat, setCat] = useState<InspirationCategoryId | "all">("all");
  const [slot, setSlot] = useState(0);

  const pool = mode === "messages" ? INSPIRATION_MESSAGES : INSPIRATION_QUESTIONS;
  const daily = dailyPick(pool, todayStr(), 0);

  const items = useMemo(() => {
    const filtered = cat === "all" ? pool : pool.filter((x) => x.category === cat);
    const n = filtered.length;
    const offset = n ? slot % n : 0;
    return [...filtered.slice(offset), ...filtered.slice(0, offset)];
  }, [pool, cat, slot]);

  const favorites = useMemo(() => data.favorites.slice().reverse(), [data.favorites]);

  const isFav = (kind: "message" | "question", text: string) =>
    data.favorites.some((f) => f.kind === kind && f.text === text);

  const toggleFav = (kind: "message" | "question", text: string) => {
    update((d) => {
      const i = d.favorites.findIndex((f) => f.kind === kind && f.text === text);
      if (i >= 0) d.favorites.splice(i, 1);
      else d.favorites.push({ id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`, kind, text, note: "", createdAt: Date.now() });
    });
  };

  return (
    <PageShell
      title="Inspiration"
      subtitle="Love notes, questions and starters — all offline"
      action={
        <button
          type="button"
          className="btn-ghost h-9 w-9 rounded-full p-0"
          aria-label="Shuffle"
          onClick={() => setSlot((s) => s + 1)}
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      }
    >
      {/* Daily pick */}
      <div className="card-elevated relative p-5">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Today's {daily === dailyPick(INSPIRATION_MESSAGES, todayStr(), 0) ? "note" : "question"}</p>
        <p className="mt-2 font-serif text-[17px] leading-relaxed text-foreground">{daily.text}</p>
        <button
          type="button"
          aria-label={isFav(daily.category === undefined ? "message" : daily.category && mode === "messages" ? "message" : "question", daily.text) ? "Remove from favorites" : "Save to favorites"}
          aria-pressed={isFav(mode === "messages" ? "message" : "question", daily.text)}
          onClick={() => toggleFav(mode === "messages" ? "message" : "question", daily.text)}
          className="absolute right-4 top-4 rounded-full p-1.5 transition-transform active:scale-90"
        >
          <Heart className={`h-5 w-5 ${isFav(mode === "messages" ? "message" : "question", daily.text) ? "fill-primary text-primary" : "text-muted-foreground/50"}`} />
        </button>
      </div>

      {/* Mode switch */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setMode("messages")}
          aria-pressed={mode === "messages"}
          className={`flex items-center justify-center gap-2 rounded-2xl border px-3 py-2.5 text-sm font-medium transition-colors ${
            mode === "messages" ? "border-transparent bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:bg-accent"
          }`}
        >
          <MessageCircle className="h-4 w-4" /> Love notes
        </button>
        <button
          type="button"
          onClick={() => setMode("questions")}
          aria-pressed={mode === "questions"}
          className={`flex items-center justify-center gap-2 rounded-2xl border px-3 py-2.5 text-sm font-medium transition-colors ${
            mode === "questions" ? "border-transparent bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:bg-accent"
          }`}
        >
          <HelpCircle className="h-4 w-4" /> Questions
        </button>
      </div>

      {/* Categories */}
      <div className="mt-3 -mx-5 overflow-x-auto px-5 pb-1">
        <div className="flex w-max gap-2">
          <button type="button" onClick={() => setCat("all")} className={`chip ${cat === "all" ? "chip-active" : ""}`}>
            All
          </button>
          {INSPIRATION_CATEGORIES.map((c) => (
            <button key={c.id} type="button" onClick={() => setCat(c.id)} className={`chip ${cat === c.id ? "chip-active" : ""}`}>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {items.length ? (
        <div className="mt-3 space-y-2.5">
          {items.map((item) => {
            const kind: "message" | "question" = mode === "messages" ? "message" : "question";
            const fav = isFav(kind, item.text);
            return (
              <div key={item.id} className="card p-4">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {INSPIRATION_CATEGORIES.find((c) => c.id === item.category)?.label ?? "Inspiration"}
                </p>
                <p className={`mt-1.5 ${mode === "messages" ? "font-serif text-[15px] leading-relaxed" : "text-sm leading-relaxed"} text-foreground`}>{item.text}</p>
                <div className="mt-2 flex justify-end">
                  <button
                    type="button"
                    aria-label={fav ? "Remove from favorites" : "Save to favorites"}
                    aria-pressed={fav}
                    onClick={() => toggleFav(kind, item.text)}
                    className="rounded-full p-1.5 transition-transform active:scale-90"
                  >
                    <Heart className={`h-4.5 w-4.5 ${fav ? "fill-primary text-primary" : "text-muted-foreground/50"}`} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="mt-3">
          <EmptyState icon={Sparkles} title="Nothing here" description="Try a different category." />
        </div>
      )}

      {/* Favorites */}
      {favorites.length ? (
        <section className="mt-7">
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4 fill-primary text-primary" />
            <h2 className="font-serif text-lg font-semibold text-foreground">Favorites</h2>
            <span className="text-xs text-muted-foreground">({favorites.length})</span>
          </div>
          <div className="mt-2 space-y-2">
            {favorites.map((f) => (
              <div key={f.id} className="card flex items-start justify-between gap-3 p-3.5">
                <p className="min-w-0 text-sm leading-relaxed text-foreground">
                  <span className="mr-1.5 text-[10px] uppercase tracking-wide text-muted-foreground">{f.kind === "message" ? "Note" : "Question"}</span>
                  {f.text}
                </p>
                <button
                  type="button"
                  aria-label="Remove from favorites"
                  onClick={() => toggleFav(f.kind, f.text)}
                  className="btn-ghost h-8 w-8 shrink-0 rounded-full p-0"
                >
                  <Heart className="h-4 w-4 fill-primary text-primary" />
                </button>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </PageShell>
  );
}
