import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ClipboardCheck, Flame, NotebookPen, Sparkles } from "lucide-react";

import { PageShell } from "@/components/PageShell";
import { EmptyState } from "@/components/EmptyState";
import { MoodRow, moodEmoji } from "@/components/MoodPicker";
import { StarRating } from "@/components/StarRating";
import { CheckupSheet } from "@/components/forms";
import { CHECKUP_QUESTIONS, checkupScore } from "@/lib/content";
import { formatDate, isoWeekKey, todayStr } from "@/lib/dates";
import { checkInStreak, moodCounts, recentEntryCount, weeklyPositivity } from "@/lib/stats";
import { GROWTH_AREAS, MOODS, moodDef, type GrowthAreaId } from "@/lib/types";
import { useApp, useData } from "@/store/app-store";

export const Route = createFileRoute("/insights")({
  component: Insights,
  head: () => ({
    meta: [
      { title: "Insights · My Love Diary" },
      { name: "description", content: "See your mood patterns, weekly growth ratings and relationship checkups over time." },
      { property: "og:title", content: "Insights · My Love Diary" },
      { property: "og:description", content: "See your mood patterns, weekly growth ratings and relationship checkups over time." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function Insights() {
  const data = useData();
  const { update } = useApp();
  const [checkupOpen, setCheckupOpen] = useState(false);

  const streak = checkInStreak(data.checkIns);
  const entries30 = recentEntryCount(data.entries, 30);
  const counts = useMemo(() => moodCounts(data, 30), [data]);
  const weeks = useMemo(() => weeklyPositivity(data.checkIns, data.entries, MOODS, 8), [data.checkIns, data.entries]);

  const maxCount = Math.max(1, ...counts.values());
  const topMoods = MOODS.map((m) => ({ ...m, count: counts.get(m.id) ?? 0 }))
    .filter((m) => m.count > 0)
    .sort((a, b) => b.count - a.count);

  const weekKey = isoWeekKey(todayStr());
  const thisWeek = data.growthRatings.find((r) => r.weekKey === weekKey);

  const rate = (area: GrowthAreaId, value: number) => {
    update((d) => {
      let row = d.growthRatings.find((r) => r.weekKey === weekKey);
      if (!row) {
        row = { weekKey, ratings: {} };
        d.growthRatings.push(row);
      }
      row.ratings[area] = value;
    });
  };

  const checkups = [...data.checkups].sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));

  return (
    <PageShell title="Insights" subtitle="Patterns from your check-ins, entries and weekly reflections">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2">
        <StatCard icon={Flame} label="Day streak" value={String(streak)} />
        <StatCard icon={NotebookPen} label="Entries · 30d" value={String(entries30)} />
        <StatCard icon={ClipboardCheck} label="Checkups" value={String(data.checkups.length)} />
      </div>

      {/* Weekly positivity chart */}
      <section className="card mt-4 p-4">
        <h2 className="font-serif text-base font-semibold text-foreground">Weekly mood balance</h2>
        <p className="mt-1 text-xs text-muted-foreground">Share of positive moods across check-ins and entries.</p>
        <div className="mt-4 flex h-28 items-end gap-1.5">
          {weeks.map((w, i) => (
            <div key={w.weekKey} className="flex flex-1 flex-col items-center gap-1">
              <div className="flex h-24 w-full items-end justify-center">
                <div
                  className={`w-full rounded-t-md ${w.avg ? "bg-primary/75" : "bg-muted"}`}
                  style={{ height: w.avg ? `${Math.max(8, w.avg * 100)}%` : "4px" }}
                  title={w.avg !== null ? `${Math.round(w.avg * 100)}% positive` : "No moods recorded"}
                />
              </div>
              <span className="text-[9px] text-muted-foreground">{w.weekKey.split("-W")[1]}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Top moods */}
      <section className="card mt-4 p-4">
        <h2 className="font-serif text-base font-semibold text-foreground">Moods this month</h2>
        {topMoods.length ? (
          <div className="mt-3 space-y-2.5">
            {topMoods.map((m) => (
              <div key={m.id} className="flex items-center gap-3">
                <span className="w-6 text-center text-base" aria-label={moodDef(m.id).label}>
                  {moodEmoji(m.id)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-foreground">{moodDef(m.id).label}</span>
                    <span className="text-[10px] text-muted-foreground">{m.count}×</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full ${m.positive ? "bg-primary" : "bg-destructive/70"}`}
                      style={{ width: `${(m.count / maxCount) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">Check in or write an entry with moods to see patterns here.</p>
        )}
      </section>

      {/* Growth areas */}
      <section className="card mt-4 p-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-serif text-base font-semibold text-foreground">This week's growth</h2>
          <span className="text-[10px] text-muted-foreground">{weekKey.replace(/^\d{4}-/, "")}</span>
        </div>
        <div className="mt-3 space-y-4">
          {GROWTH_AREAS.map((area) => (
            <div key={area.id}>
              <p className="text-xs font-medium text-foreground">{area.label}</p>
              <p className="text-[11px] text-muted-foreground">{area.prompt}</p>
              <div className="mt-1.5">
                <StarRating value={thisWeek?.ratings[area.id]} onChange={(v) => rate(area.id, v)} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Relationship checkups */}
      <section className="mt-6">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg font-semibold text-foreground">Relationship checkups</h2>
          <button type="button" className="btn-secondary px-3 py-1.5 text-xs" onClick={() => setCheckupOpen(true)}>
            <Sparkles className="h-3.5 w-3.5" /> New
          </button>
        </div>
        {checkups.length ? (
          <div className="mt-2 space-y-2">
            {checkups.map((c) => {
              const score = checkupScore(c.answers);
              return (
                <div key={c.id} className="card p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-foreground">{formatDate(c.date)}</p>
                    <span className="chip chip-active shrink-0">{score.toFixed(1)} / 5</span>
                  </div>
                  {c.note ? <p className="mt-2 text-sm text-muted-foreground">{c.note}</p> : null}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mt-2">
            <EmptyState
              icon={ClipboardCheck}
              title="No checkups yet"
              description="Ten gentle questions about how your relationship is doing — a few minutes, once in a while."
            />
          </div>
        )}
      </section>

      <CheckupSheet open={checkupOpen} onClose={() => setCheckupOpen(false)} questions={CHECKUP_QUESTIONS} />
    </PageShell>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: typeof Flame; label: string; value: string }) {
  return (
    <div className="card flex flex-col items-center gap-0.5 px-2 py-3 text-center">
      <Icon className="h-4 w-4 text-primary" />
      <span className="font-serif text-lg font-semibold text-foreground">{value}</span>
      <span className="text-[10px] text-muted-foreground">{label}</span>
    </div>
  );
}

// Keep MoodRow import used for check-in summaries elsewhere if needed later.
void MoodRow;
