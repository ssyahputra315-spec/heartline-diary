import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CalendarHeart, CalendarPlus, Images, Lock, MailOpen, MapPin, Pencil, Plus, Repeat, ScrollText, Trash2 } from "lucide-react";

import { PageShell } from "@/components/PageShell";
import { EmptyState } from "@/components/EmptyState";
import { ConfirmDialog } from "@/components/Sheet";
import { PhotoImage } from "@/components/PhotoPicker";
import { BucketSheet, ImportantDateSheet, LetterSheet, MemorySheet } from "@/components/forms";
import { daysAway, formatDate, sameMonthDay, todayStr } from "@/lib/dates";
import { memoryKind } from "@/lib/types";
import { useApp, useData } from "@/store/app-store";

type Tab = "moments" | "dates" | "bucket" | "letters";

const TABS: { id: Tab; label: string }[] = [
  { id: "moments", label: "Memories" },
  { id: "dates", label: "Dates" },
  { id: "bucket", label: "Bucket list" },
  { id: "letters", label: "Letters" },
];

export const Route = createFileRoute("/memories")({
  component: Memories,
  head: () => ({
    meta: [
      { title: "Memories · My Love Diary" },
      { name: "description", content: "Keep your milestones, anniversaries, bucket list and sealed letters to the future." },
      { property: "og:title", content: "Memories · My Love Diary" },
      { property: "og:description", content: "Keep your milestones, anniversaries, bucket list and sealed letters to the future." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function Memories() {
  const data = useData();
  const [tab, setTab] = useState<Tab>("moments");
  const counts: Record<Tab, number> = {
    moments: data.memories.length,
    dates: data.importantDates.length,
    bucket: data.bucketList.length,
    letters: data.futureLetters.length,
  };

  return (
    <PageShell
      title="Memories"
      subtitle="Milestones, important dates, dreams and letters"
      action={<AddButton tab={tab} />}
    >
      <div className="-mx-5 overflow-x-auto px-5 pb-1">
        <div className="flex w-max gap-2">
          {TABS.map((t) => (
            <button key={t.id} type="button" onClick={() => setTab(t.id)} className={`chip ${tab === t.id ? "chip-active" : ""}`}>
              {t.label}
              {counts[t.id] ? <span className="ml-1 opacity-60">{counts[t.id]}</span> : null}
            </button>
          ))}
        </div>
      </div>

      {tab === "moments" ? <MomentsTab /> : null}
      {tab === "dates" ? <DatesTab /> : null}
      {tab === "bucket" ? <BucketTab /> : null}
      {tab === "letters" ? <LettersTab /> : null}
    </PageShell>
  );
}

/* ============ Shared tab frame ============ */
function TabFrame({ empty, children }: { empty: boolean; children: React.ReactNode }) {
  if (empty) return <div className="mt-3">{children}</div>;
  return <div className="mt-3 space-y-2.5">{children}</div>;
}

/* ============ Memories tab ============ */
function MomentsTab() {
  const data = useData();
  const { update, deletePhotoFiles } = useApp();
  const today = todayStr();
  const [editId, setEditId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const memories = useMemo(() => [...data.memories].sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt), [data.memories]);
  const onThisDay = memories.filter((m) => sameMonthDay(m.date, today) && m.date !== today);

  const openNew = () => {
    setEditId(null);
    setSheetOpen(true);
  };
  const openEdit = (id: string) => {
    setEditId(id);
    setSheetOpen(true);
  };

  const remove = (id: string) => {
    const m = data.memories.find((x) => x.id === id);
    if (m?.photoIds.length) deletePhotoFiles(m.photoIds);
    update((d) => {
      d.memories = d.memories.filter((x) => x.id !== id);
    });
  };

  return (
    <div>
      {onThisDay.length ? (
        <section className="mt-3">
          <h2 className="flex items-center gap-1.5 font-serif text-sm font-semibold text-foreground">
            <CalendarHeart className="h-4 w-4 text-primary" /> On this day
          </h2>
          <div className="mt-2 space-y-2">
            {onThisDay.map((m) => (
              <div key={m.id} className="card border-primary/30 p-3.5">
                <p className="truncate text-sm font-medium text-foreground">{m.title}</p>
                <p className="text-xs text-muted-foreground">{formatDate(m.date)} · a year like this one</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {memories.length ? (
        <TabFrame empty={false}>
          {memories.map((m) => (
            <div key={m.id} className="card p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="truncate font-serif text-base font-semibold text-foreground">{m.title}</h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {formatDate(m.date)} · {memoryKind(m.kind).label}
                    {m.location ? (
                      <>
                        {" · "}
                        <MapPin className="inline h-3 w-3" /> {m.location}
                      </>
                    ) : null}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <button type="button" aria-label="Edit memory" className="btn-ghost h-8 w-8 rounded-full p-0" onClick={() => openEdit(m.id)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button type="button" aria-label="Delete memory" className="btn-ghost h-8 w-8 rounded-full p-0 text-destructive" onClick={() => setDeleteId(m.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              {m.description ? <p className="mt-2 text-sm text-muted-foreground">{m.description}</p> : null}
              {m.photoIds.length ? (
                <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                  {m.photoIds.map((id) => (
                    <PhotoImage key={id} id={id} alt={`Photo from ${m.title}`} className="h-20 w-20 shrink-0 rounded-xl border border-border" />
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </TabFrame>
      ) : (
        <div className="mt-3">
          <EmptyState
            icon={Images}
            title="No memories saved yet"
            description="Save first meetings, trips and milestones — with photos, places and the story."
            action={
              <button type="button" className="btn-secondary" onClick={openNew}>
                <Plus className="h-4 w-4" /> Save a memory
              </button>
            }
          />
        </div>
      )}

      <MemorySheet open={sheetOpen} onClose={() => setSheetOpen(false)} editId={editId ?? undefined} />
      <ConfirmDialog
        open={deleteId !== null}
        title="Delete memory?"
        description="The memory and its photos will be removed permanently."
        confirmLabel="Delete"
        danger
        onConfirm={() => {
          if (deleteId) remove(deleteId);
        }}
        onClose={() => setDeleteId(null)}
      />
    </div>
  );
}

/* ============ Important dates tab ============ */
function DatesTab() {
  const data = useData();
  const { update } = useApp();
  const today = todayStr();
  const [editId, setEditId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const dates = useMemo(
    () =>
      data.importantDates
        .map((d) => ({ ...d, days: daysAway(d.date, d.recurring, today) }))
        .sort((a, b) => a.days - b.days),
    [data.importantDates, today],
  );

  const remove = (id: string) => {
    update((d) => {
      d.importantDates = d.importantDates.filter((x) => x.id !== id);
    });
  };

  const when = (days: number) => (days === 0 ? "Today" : days === 1 ? "Tomorrow" : `In ${days} days`);

  return (
    <div>
      {dates.length ? (
        <TabFrame empty={false}>
          {dates.map((d) => (
            <div key={d.id} className={`card flex items-center justify-between gap-3 p-4 ${d.days <= 7 ? "border-primary/40" : ""}`}>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="truncate font-serif text-base font-semibold text-foreground">{d.title}</h3>
                  {d.recurring ? <Repeat className="h-3.5 w-3.5 shrink-0 text-primary" aria-label="Repeats every year" /> : null}
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">{formatDate(d.date, "long")}</p>
                {d.note ? <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{d.note}</p> : null}
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1.5">
                <span className={`chip ${d.days === 0 ? "chip-active" : ""}`}>{when(d.days)}</span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    aria-label="Edit date"
                    className="btn-ghost h-8 w-8 rounded-full p-0"
                    onClick={() => {
                      setEditId(d.id);
                      setSheetOpen(true);
                    }}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button type="button" aria-label="Delete date" className="btn-ghost h-8 w-8 rounded-full p-0 text-destructive" onClick={() => remove(d.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </TabFrame>
      ) : (
        <div className="mt-3">
          <EmptyState
            icon={CalendarPlus}
            title="No important dates yet"
            description="Add anniversaries, birthdays and firsts — recurring ones count down every year."
          />
        </div>
      )}
      <ImportantDateSheet open={sheetOpen} onClose={() => setSheetOpen(false)} editId={editId ?? undefined} />
    </div>
  );
}

/* ============ Bucket list tab ============ */
function BucketTab() {
  const data = useData();
  const { update } = useApp();

  const toggle = (id: string) => {
    update((d) => {
      const item = d.bucketList.find((x) => x.id === id);
      if (!item) return;
      item.done = !item.done;
      item.doneAt = item.done ? Date.now() : null;
    });
  };

  const remove = (id: string) => {
    update((d) => {
      d.bucketList = d.bucketList.filter((x) => x.id !== id);
    });
  };

  const open = data.bucketList.filter((b) => !b.done);
  const done = data.bucketList.filter((b) => b.done);

  return (
    <div>
      {data.bucketList.length ? (
        <>
          <TabFrame empty={false}>
            {open.map((b) => (
              <div key={b.id} className="card flex items-start gap-3 p-4">
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={false}
                  aria-label={`Mark ${b.title} as done`}
                  onClick={() => toggle(b.id)}
                  className="mt-0.5 h-5 w-5 shrink-0 rounded-full border-2 border-primary/60 transition-colors hover:bg-primary/10"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">{b.title}</p>
                  {b.description ? <p className="mt-0.5 text-sm text-muted-foreground">{b.description}</p> : null}
                </div>
                <button type="button" aria-label="Remove" className="btn-ghost h-8 w-8 shrink-0 rounded-full p-0 text-destructive" onClick={() => remove(b.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </TabFrame>
          {done.length ? (
            <section className="mt-5">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Done — {done.length}</h2>
              <div className="mt-2 space-y-2">
                {done.map((b) => (
                  <div key={b.id} className="card flex items-center justify-between gap-3 p-3.5 opacity-70">
                    <div className="flex min-w-0 items-center gap-3">
                      <button
                        type="button"
                        role="checkbox"
                        aria-checked={true}
                        aria-label={`Mark ${b.title} as not done`}
                        onClick={() => toggle(b.id)}
                        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground"
                      >
                        ✓
                      </button>
                      <p className="truncate text-sm text-muted-foreground line-through">{b.title}</p>
                    </div>
                    <button type="button" aria-label="Remove" className="btn-ghost h-8 w-8 shrink-0 rounded-full p-0" onClick={() => remove(b.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </>
      ) : (
        <div className="mt-3">
          <EmptyState
            icon={ScrollText}
            title="Your bucket list is empty"
            description="Dream together: places to visit, things to try, promises to keep."
          />
        </div>
      )}
    </div>
  );
}

/* ============ Future letters tab ============ */
function LettersTab() {
  const data = useData();
  const { update } = useApp();
  const today = todayStr();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const letters = useMemo(() => [...data.futureLetters].sort((a, b) => a.openDate.localeCompare(b.openDate)), [data.futureLetters]);
  const sealed = letters.filter((l) => l.openDate > today);
  const ready = letters.filter((l) => l.openDate <= today && !l.openedAt);
  const opened = letters.filter((l) => l.openedAt !== null).sort((a, b) => (b.openedAt ?? 0) - (a.openedAt ?? 0));

  const open = (id: string) => {
    update((d) => {
      const l = d.futureLetters.find((x) => x.id === id);
      if (l && l.openDate <= today && l.openedAt === null) l.openedAt = Date.now();
    });
  };

  const remove = (id: string) => {
    update((d) => {
      d.futureLetters = d.futureLetters.filter((x) => x.id !== id);
    });
  };

  const countdown = (openDate: string) => {
    const days = daysAway(openDate, false, today);
    return days === 0 ? "opens today" : `opens in ${days} ${days === 1 ? "day" : "days"}`;
  };

  const renderCard = (l: (typeof letters)[number]) => {
    const isOpen = l.openedAt !== null || l.openDate <= today;
    return (
      <div key={l.id} className={`card p-4 ${!isOpen ? "border-dashed" : ""}`}>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate font-serif text-base font-semibold text-foreground">{l.title}</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {l.openedAt ? `Opened ${formatDate(l.openDate, "long")}` : isOpen ? "Ready to open" : countdown(l.openDate)}
            </p>
          </div>
          {!isOpen ? (
            <Lock className="h-4 w-4 shrink-0 text-muted-foreground" />
          ) : (
            <button type="button" aria-label="Delete letter" className="btn-ghost h-8 w-8 shrink-0 rounded-full p-0 text-destructive" onClick={() => setDeleteId(l.id)}>
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        {isOpen && l.openedAt !== null ? (
          <div className="mt-2 rounded-2xl border border-border bg-background/40 p-3.5">
            <MailOpen className="h-4 w-4 text-primary" />
            <p className="mt-2 whitespace-pre-wrap font-serif text-sm leading-relaxed text-foreground">{l.content}</p>
          </div>
        ) : isOpen ? (
          <button type="button" className="btn-primary mt-3 w-full" onClick={() => open(l.id)}>
            <MailOpen className="h-4 w-4" /> Open letter
          </button>
        ) : (
          <p className="mt-2 text-xs text-muted-foreground">Sealed until {formatDate(l.openDate, "long")}</p>
        )}
      </div>
    );
  };

  return (
    <div>
      {letters.length ? (
        <>
          {ready.length ? (
            <section className="mt-3">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-primary">Ready to open</h2>
              <div className="mt-2 space-y-2.5">{ready.map(renderCard)}</div>
            </section>
          ) : null}
          {sealed.length || opened.length ? (
            <TabFrame empty={false}>
              {sealed.map(renderCard)}
              {opened.map(renderCard)}
            </TabFrame>
          ) : null}
        </>
      ) : (
        <div className="mt-3">
          <EmptyState
            icon={MailOpen}
            title="No letters yet"
            description="Write to your future selves and seal the letter until the open date."
          />
        </div>
      )}
      <ConfirmDialog
        open={deleteId !== null}
        title="Delete letter?"
        description="This letter will be removed permanently."
        confirmLabel="Delete"
        danger
        onConfirm={() => {
          if (deleteId) remove(deleteId);
        }}
        onClose={() => setDeleteId(null)}
      />
    </div>
  );
}

/* ============ Add button matching current tab ============ */
function AddButton({ tab }: { tab: Tab }) {
  const [open, setOpen] = useState(false);
  const labels: Record<Tab, string> = {
    moments: "Memory",
    dates: "Date",
    bucket: "Idea",
    letters: "Letter",
  };
  return (
    <>
      <button type="button" className="btn-primary px-3.5 py-2" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" /> <span className="hidden sm:inline">Add {labels[tab]}</span>
        <span className="sm:hidden">{labels[tab]}</span>
      </button>
      {tab === "moments" ? <MemorySheet open={open} onClose={() => setOpen(false)} /> : null}
      {tab === "dates" ? <ImportantDateSheet open={open} onClose={() => setOpen(false)} /> : null}
      {tab === "bucket" ? <BucketSheet open={open} onClose={() => setOpen(false)} /> : null}
      {tab === "letters" ? <LetterSheet open={open} onClose={() => setOpen(false)} /> : null}
    </>
  );
}
