import { useState } from "react";
import { DATE_IDEA_CATEGORIES } from "@/lib/content";
import { todayStr } from "@/lib/dates";
import type { DateIdeaCategory, MemoryKind, MoodId, CheckIn } from "@/lib/types";
import { MEMORY_KINDS } from "@/lib/types";
import { useApp, uid } from "@/store/app-store";

import { Sheet } from "./Sheet";
import { MoodPicker } from "./MoodPicker";
import { PhotoPicker } from "./PhotoPicker";

/* ============ Daily check-in (one per day) ============ */
export function CheckInSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data, update } = useApp();
  const existing = data?.checkIns.find((c) => c.date === todayStr());
  const [moods, setMoods] = useState<import("@/lib/types").MoodId[]>(existing?.moods ?? []);
  const [note, setNote] = useState(existing?.note ?? "");

  const save = () => {
    if (!moods.length) return;
    update((d) => {
      const date = todayStr();
      const i = d.checkIns.findIndex((c) => c.date === date);
      const row: import("@/lib/types").CheckIn = {
        id: existing?.id ?? uid(),
        date,
        moods,
        note: note.trim(),
      };
      if (i >= 0) d.checkIns[i] = row;
      else d.checkIns.push(row);
    });
    onClose();
  };

  return (
    <Sheet open={open} onClose={onClose} title="How are you feeling today?">
      <MoodPicker selected={moods} onToggle={(id) => setMoods((m) => (m.includes(id) ? m.filter((x) => x !== id) : [...m, id]))} />
      <label className="label mt-5" htmlFor="checkin-note">A note for today (optional)</label>
      <textarea
        id="checkin-note"
        className="input-field min-h-24"
        placeholder="Anything on your mind…"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      <button type="button" className="btn-primary mt-5 w-full" disabled={!moods.length} onClick={save}>
        {existing ? "Update check-in" : "Save check-in"}
      </button>
    </Sheet>
  );
}

/* ============ Gratitude note ============ */
export function GratitudeSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [text, setText] = useState("");
  const { update } = useApp();

  const save = () => {
    const t = text.trim();
    if (!t) return;
    update((d) => {
      d.gratitudes.push({ id: uid(), date: todayStr(), text: t, createdAt: Date.now() });
    });
    setText("");
    onClose();
  };

  return (
    <Sheet open={open} onClose={onClose} title="A moment of gratitude">
      <label className="label" htmlFor="gratitude-text">What are you grateful for today?</label>
      <textarea
        id="gratitude-text"
        className="input-field min-h-28"
        placeholder="Even the smallest thing counts…"
        value={text}
        onChange={(e) => setText(e.target.value)}
        autoFocus
      />
      <button type="button" className="btn-primary mt-4 w-full" disabled={!text.trim()} onClick={save}>
        Save to gratitude jar
      </button>
    </Sheet>
  );
}

/* ============ Memory ============ */
export function MemorySheet({
  open,
  onClose,
  editId,
}: {
  open: boolean;
  onClose: () => void;
  editId?: string | undefined;
}) {
  const { data, update } = useApp();
  const existing = editId ? data?.memories.find((m) => m.id === editId) : undefined;
  const [title, setTitle] = useState(existing?.title ?? "");
  const [date, setDate] = useState(existing?.date ?? todayStr());
  const [kind, setKind] = useState<MemoryKind>(existing?.kind ?? "custom");
  const [location, setLocation] = useState(existing?.location ?? "");
  const [description, setDescription] = useState(existing?.description ?? "");
  const [photoIds, setPhotoIds] = useState<string[]>(existing?.photoIds ?? []);

  const save = () => {
    const t = title.trim();
    if (!t) return;
    update((d) => {
      if (existing) {
        const m = d.memories.find((x) => x.id === existing.id);
        if (m) Object.assign(m, { title: t, date, kind, location: location.trim(), description, photoIds });
      } else {
        d.memories.push({ id: uid(), title: t, date, kind, location: location.trim(), description, photoIds, createdAt: Date.now() });
      }
    });
    onClose();
  };

  return (
    <Sheet open={open} onClose={onClose} title={existing ? "Edit memory" : "Save a memory"}>
      <label className="label" htmlFor="memory-title">Title</label>
      <input id="memory-title" className="input-field" placeholder="Our first trip to the coast" value={title} onChange={(e) => setTitle(e.target.value)} />
      <label className="label mt-4" htmlFor="memory-date">When was it?</label>
      <input id="memory-date" type="date" className="input-field" value={date} onChange={(e) => setDate(e.target.value)} />
      <p className="label mt-4">Kind of moment</p>
      <div className="flex flex-wrap gap-2">
        {MEMORY_KINDS.map((k) => (
          <button
            key={k.id}
            type="button"
            onClick={() => setKind(k.id)}
            className={`chip ${kind === k.id ? "chip-active" : ""}`}
          >
            {k.label}
          </button>
        ))}
      </div>
      <label className="label mt-4" htmlFor="memory-location">Where (optional)</label>
      <input id="memory-location" className="input-field" placeholder="Bali, Indonesia" value={location} onChange={(e) => setLocation(e.target.value)} />
      <label className="label mt-4" htmlFor="memory-desc">What happened?</label>
      <textarea id="memory-desc" className="input-field min-h-24" placeholder="Tell the story…" value={description} onChange={(e) => setDescription(e.target.value)} />
      <p className="label mt-4">Photos</p>
      <PhotoPicker ids={photoIds} onChange={setPhotoIds} />
      <button type="button" className="btn-primary mt-5 w-full" disabled={!title.trim()} onClick={save}>
        {existing ? "Save changes" : "Save memory"}
      </button>
    </Sheet>
  );
}

/* ============ Important date ============ */
export function ImportantDateSheet({
  open,
  onClose,
  editId,
}: {
  open: boolean;
  onClose: () => void;
  editId?: string | undefined;
}) {
  const { data, update } = useApp();
  const existing = editId ? data?.importantDates.find((i) => i.id === editId) : undefined;
  const [title, setTitle] = useState(existing?.title ?? "");
  const [date, setDate] = useState(existing?.date ?? todayStr());
  const [recurring, setRecurring] = useState(existing?.recurring ?? true);
  const [note, setNote] = useState(existing?.note ?? "");

  const save = () => {
    const t = title.trim();
    if (!t) return;
    update((d) => {
      if (existing) {
        const row = d.importantDates.find((x) => x.id === existing.id);
        if (row) Object.assign(row, { title: t, date, recurring, note: note.trim() });
      } else {
        d.importantDates.push({ id: uid(), title: t, date, recurring, note: note.trim() });
      }
    });
    onClose();
  };

  return (
    <Sheet open={open} onClose={onClose} title={existing ? "Edit date" : "Add an important date"}>
      <label className="label" htmlFor="date-title">What is it?</label>
      <input id="date-title" className="input-field" placeholder="Anniversary, first date, birthday…" value={title} onChange={(e) => setTitle(e.target.value)} />
      <label className="label mt-4" htmlFor="date-date">Date</label>
      <input id="date-date" type="date" className="input-field" value={date} onChange={(e) => setDate(e.target.value)} />
      <label className="mt-4 flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-foreground">Repeats every year</span>
        <input type="checkbox" checked={recurring} onChange={(e) => setRecurring(e.target.checked)} className="h-5 w-5 accent-primary" />
      </label>
      <label className="label mt-4" htmlFor="date-note">Note (optional)</label>
      <input id="date-note" className="input-field" placeholder="Where we went, what we promised…" value={note} onChange={(e) => setNote(e.target.value)} />
      <button type="button" className="btn-primary mt-5 w-full" disabled={!title.trim()} onClick={save}>
        {existing ? "Save changes" : "Add date"}
      </button>
    </Sheet>
  );
}

/* ============ Bucket list item ============ */
export function BucketSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const { update } = useApp();

  const save = () => {
    const t = title.trim();
    if (!t) return;
    update((d) => {
      d.bucketList.push({ id: uid(), title: t, description: description.trim(), done: false, doneAt: null });
    });
    setTitle("");
    setDescription("");
    onClose();
  };

  return (
    <Sheet open={open} onClose={onClose} title="Add to our bucket list">
      <label className="label" htmlFor="bucket-title">Dream or goal</label>
      <input id="bucket-title" className="input-field" placeholder="Watch the northern lights together" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
      <label className="label mt-4" htmlFor="bucket-desc">Details (optional)</label>
      <textarea id="bucket-desc" className="input-field min-h-20" placeholder="Any plans, places, timing…" value={description} onChange={(e) => setDescription(e.target.value)} />
      <button type="button" className="btn-primary mt-4 w-full" disabled={!title.trim()} onClick={save}>
        Add to list
      </button>
    </Sheet>
  );
}

/* ============ Future letter (time capsule) ============ */
export function LetterSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [openDate, setOpenDate] = useState("");
  const { update } = useApp();

  const save = () => {
    const t = title.trim();
    if (!t || !openDate) return;
    update((d) => {
      d.futureLetters.push({ id: uid(), title: t, content, openDate, createdAt: Date.now(), openedAt: null });
    });
    setTitle("");
    setContent("");
    setOpenDate("");
    onClose();
  };

  return (
    <Sheet open={open} onClose={onClose} title="Write a letter to the future">
      <label className="label" htmlFor="letter-title">Title</label>
      <input id="letter-title" className="input-field" placeholder="To us, one year from now" value={title} onChange={(e) => setTitle(e.target.value)} />
      <label className="label mt-4" htmlFor="letter-date">Open on</label>
      <input id="letter-date" type="date" className="input-field" value={openDate} min={todayStr()} onChange={(e) => setOpenDate(e.target.value)} />
      <label className="label mt-4" htmlFor="letter-content">Letter</label>
      <textarea id="letter-content" className="input-field min-h-40" placeholder="Dear future us…" value={content} onChange={(e) => setContent(e.target.value)} />
      <p className="mt-2 text-xs text-muted-foreground">The letter stays sealed until the open date.</p>
      <button type="button" className="btn-primary mt-4 w-full" disabled={!title.trim() || !openDate} onClick={save}>
        Seal letter
      </button>
    </Sheet>
  );
}

/* ============ Custom date idea ============ */
export function DateIdeaSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<DateIdeaCategory>("at-home");
  const { update } = useApp();

  const save = () => {
    const t = title.trim();
    if (!t) return;
    update((d) => {
      d.dateIdeas.push({ id: uid(), title: t, description: description.trim(), category, custom: true });
    });
    setTitle("");
    setDescription("");
    onClose();
  };

  return (
    <Sheet open={open} onClose={onClose} title="Add your own date idea">
      <label className="label" htmlFor="idea-title">Idea</label>
      <input id="idea-title" className="input-field" placeholder="Recreate our wedding playlist" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
      <label className="label mt-4" htmlFor="idea-desc">Details (optional)</label>
      <textarea id="idea-desc" className="input-field min-h-20" placeholder="How would it go?" value={description} onChange={(e) => setDescription(e.target.value)} />
      <p className="label mt-4">Category</p>
      <div className="flex flex-wrap gap-2">
        {DATE_IDEA_CATEGORIES.map((c) => (
          <button key={c.id} type="button" onClick={() => setCategory(c.id)} className={`chip ${category === c.id ? "chip-active" : ""}`}>
            {c.label}
          </button>
        ))}
      </div>
      <button type="button" className="btn-primary mt-5 w-full" disabled={!title.trim()} onClick={save}>
        Add idea
      </button>
    </Sheet>
  );
}

/* ============ Relationship checkup ============ */
export function CheckupSheet({
  open,
  onClose,
  questions,
}: {
  open: boolean;
  onClose: () => void;
  questions: { id: string; text: string }[];
}) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [note, setNote] = useState("");
  const { update } = useApp();

  const answered = questions.filter((q) => answers[q.id]).length;

  const save = () => {
    update((d) => {
      d.checkups.push({ id: uid(), date: todayStr(), answers, note: note.trim() });
    });
    onClose();
  };

  return (
    <Sheet open={open} onClose={onClose} title="Relationship checkup">
      <p className="text-sm text-muted-foreground">Answer honestly — this stays between you and the app.</p>
      <div className="mt-4 space-y-4">
        {questions.map((q, i) => (
          <div key={q.id} className="rounded-2xl border border-border bg-background/40 p-4">
            <p className="text-sm font-medium text-foreground">
              {i + 1}. {q.text}
            </p>
            <div className="mt-2">
              <StarRatingRow value={answers[q.id]} onChange={(v) => setAnswers((a) => ({ ...a, [q.id]: v }))} />
            </div>
          </div>
        ))}
      </div>
      <label className="label mt-4" htmlFor="checkup-note">Anything you want to add?</label>
      <textarea id="checkup-note" className="input-field min-h-20" placeholder="Notes for this week…" value={note} onChange={(e) => setNote(e.target.value)} />
      <button type="button" className="btn-primary mt-4 w-full" disabled={answered === 0} onClick={save}>
        Save checkup {answered > 0 ? `(${answered}/${questions.length})` : ""}
      </button>
    </Sheet>
  );
}

function StarRatingRow({ value, onChange }: { value: number | undefined; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((v) => (
        <button
          key={v}
          type="button"
          aria-label={`${v} of 5`}
          onClick={() => onChange(v)}
          className={`h-8 w-8 rounded-full border text-xs font-semibold transition-colors ${
            (value ?? 0) >= v ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground"
          }`}
        >
          {v}
        </button>
      ))}
    </div>
  );
}
