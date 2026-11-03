import { useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import {
  BookHeart,
  CalendarHeart,
  CheckCircle2,
  Flame,
  Heart,
  Images,
  NotebookPen,
  Plus,
  Quote,
} from "lucide-react";

import { PageShell } from "@/components/PageShell";
import { EmptyState } from "@/components/EmptyState";
import { MoodRow } from "@/components/MoodPicker";
import { CheckInSheet, GratitudeSheet } from "@/components/forms";
import { dailyPick, INSPIRATION_MESSAGES } from "@/lib/inspiration";
import { durationText, greeting, relationshipDuration, todayStr } from "@/lib/dates";
import { checkInStreak, daysAway } from "@/lib/stats";
import { uid, useApp, useData } from "@/store/app-store";

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [
      { title: "My Love Diary" },
      { name: "description", content: "Your daily check-in, streak and a little inspiration for your relationship — all stored on your device." },
      { property: "og:title", content: "My Love Diary" },
      { property: "og:description", content: "A private, offline diary for your relationship — moods, memories, love letters and little moments." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function Home() {
  const data = useData();
  const { update } = useApp();
  const [checkOpen, setCheckOpen] = useState(false);
  const [gratOpen, setGratOpen] = useState(false);

  const today = todayStr();
  const { myName, partnerName, relationshipStart } = data.profile;
  const name = myName || partnerName || "";
  const dur = relationshipDuration(relationshipStart);
  const streak = checkInStreak(data.checkIns);
  const checkIn = data.checkIns.find((c) => c.date === today);

  const message = dailyPick(INSPIRATION_MESSAGES, today, 0);
  const favorited = data.favorites.some((f) => f.kind === "message" && f.text === message.text);

  const upcoming = data.importantDates
    .map((d) => ({ ...d, days: daysAway(d.date, d.recurring) }))
    .filter((d) => d.days >= 0)
    .sort((a, b) => a.days - b.days)
    .slice(0, 3);

  const recent = [...data.entries]
    .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt)
    .slice(0, 3);

  const gratitudeToday = data.gratitudes.filter((g) => g.date === today).length;

  const toggleFavorite = () => {
    update((d) => {
      const i = d.favorites.findIndex((f) => f.kind === "message" && f.text === message.text);
      if (i >= 0) d.favorites.splice(i, 1);
      else d.favorites.push({ id: uid(), kind: "message", text: message.text, note: "", createdAt: Date.now() });
    });
  };

  return (
    <PageShell
      title={`${greeting(new Date().getHours())}${name ? `, ${name}` : ""}`}
      subtitle={
        dur
          ? `Together for ${durationText(dur)}${partnerName ? ` with ${partnerName}` : ""}`
          : "Set your names and anniversary in Profile to see your time together"
      }
    >
      {/* Check-in card */}
      {checkIn ? (
        <div className="card p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <CheckCircle2 className="h-4 w-4 text-primary" /> Checked in today
          </div>
          <MoodRow moods={checkIn.moods} className="mt-2" />
          {checkIn.note ? <p className="mt-2 text-sm text-muted-foreground">{checkIn.note}</p> : null}
          <button type="button" className="btn-ghost mt-2 -ml-2 text-xs" onClick={() => setCheckOpen(true)}>
            Update check-in
          </button>
        </div>
      ) : (
        <div className="card-elevated p-5">
          <h2 className="font-serif text-lg font-semibold text-foreground">How are you feeling today?</h2>
          <p className="mt-1 text-sm text-muted-foreground">A one-minute check-in keeps your streak alive.</p>
          <button type="button" className="btn-primary mt-4 w-full" onClick={() => setCheckOpen(true)}>
            <Heart className="h-4 w-4" /> Start today's check-in
          </button>
        </div>
      )}

      {/* Stats row */}
      <div className="mt-4 grid grid-cols-3 gap-2">
        <StatCard icon={Flame} label="Day streak" value={String(streak)} />
        <StatCard icon={BookHeart} label="Entries" value={String(data.entries.length)} />
        <StatCard icon={Quote} label="Gratitudes" value={String(data.gratitudes.length)} />
      </div>

      {/* Daily message */}
      <div className="card mt-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Today's note</p>
            <p className="mt-1.5 font-serif text-[15px] leading-relaxed text-foreground">{message.text}</p>
          </div>
          <button
            type="button"
            aria-label={favorited ? "Remove from favorites" : "Save to favorites"}
            aria-pressed={favorited}
            onClick={toggleFavorite}
            className="shrink-0 rounded-full p-1.5 transition-transform active:scale-90"
          >
            <Heart className={`h-5 w-5 ${favorited ? "fill-primary text-primary" : "text-muted-foreground/50"}`} />
          </button>
        </div>
      </div>

      {/* Quick actions */}
      <div className="mt-4 grid grid-cols-4 gap-2">
        <QuickAction to="/diary/new" icon={NotebookPen} label="New entry" />
        <QuickAction to="/memories" icon={Images} label="Memories" />
        <button
          type="button"
          onClick={() => setGratOpen(true)}
          className="card flex flex-col items-center gap-1.5 p-3 text-center transition-colors hover:bg-accent/40"
        >
          <Quote className="h-5 w-5 text-primary" />
          <span className="text-[10px] font-medium text-foreground">Gratitude{gratitudeToday ? " ✓" : ""}</span>
        </button>
        <QuickAction to="/inspiration" icon={Heart} label="Inspire me" />
      </div>

      {/* Upcoming dates */}
      <section className="mt-6">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg font-semibold text-foreground">Coming up</h2>
          <Link to="/memories" className="text-xs text-muted-foreground underline-offset-2 hover:underline">
            All dates
          </Link>
        </div>
        {upcoming.length ? (
          <div className="mt-2 space-y-2">
            {upcoming.map((d) => (
              <div key={d.id} className="card flex items-center justify-between gap-3 p-3.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{d.title}</p>
                  <p className="text-xs text-muted-foreground">{formatDue(d.days)}</p>
                </div>
                <CalendarHeart className="h-5 w-5 shrink-0 text-primary" />
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">No upcoming dates yet — add anniversaries in Memories.</p>
        )}
      </section>

      {/* Recent entries */}
      <section className="mt-6">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg font-semibold text-foreground">Recent entries</h2>
          <Link to="/diary" className="text-xs text-muted-foreground underline-offset-2 hover:underline">
            View all
          </Link>
        </div>
        {recent.length ? (
          <div className="mt-2 space-y-2">
            {recent.map((e) => (
              <Link
                key={e.id}
                to="/diary/$entryId"
                params={{ entryId: e.id }}
                className="card block p-3.5 transition-colors hover:bg-accent/40"
              >
                <p className="truncate text-sm font-medium text-foreground">{e.title}</p>
                <p className="text-xs text-muted-foreground">{e.date}</p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="mt-2">
            <EmptyState
              icon={NotebookPen}
              title="Start your first entry"
              description="Write about today, a happy moment, or something you appreciate."
              action={
                <Link to="/diary/new" className="btn-secondary">
                  <Plus className="h-4 w-4" /> New entry
                </Link>
              }
            />
          </div>
        )}
      </section>

      <CheckInSheet open={checkOpen} onClose={() => setCheckOpen(false)} />
      <GratitudeSheet open={gratOpen} onClose={() => setGratOpen(false)} />
    </PageShell>
  );
}

function formatDue(days: number): string {
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  return `In ${days} days`;
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

function QuickAction({
  to,
  icon: Icon,
  label,
}: {
  to: "/diary/new" | "/memories" | "/inspiration";
  icon: typeof Heart;
  label: string;
}) {
  return (
    <Link to={to} className="card flex flex-col items-center gap-1.5 p-3 text-center transition-colors hover:bg-accent/40">
      <Icon className="h-5 w-5 text-primary" />
      <span className="text-[10px] font-medium text-foreground">{label}</span>
    </Link>
  );
}
