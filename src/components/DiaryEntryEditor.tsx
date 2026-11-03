import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";

import { EditorShell } from "./PageShell";
import { MoodPicker } from "./MoodPicker";
import { PhotoPicker } from "./PhotoPicker";
import { ConfirmDialog } from "./Sheet";
import { DIARY_CATEGORIES, type DiaryCategoryId, type DiaryEntry, type MoodId } from "@/lib/types";
import { todayStr } from "@/lib/dates";
import { uid, useApp } from "@/store/app-store";

/** Full-screen diary entry editor used by /diary/new and /diary/$entryId. */
export function DiaryEntryEditor({ entry }: { entry?: DiaryEntry }) {
  const navigate = useNavigate();
  const { update, deletePhotoFiles } = useApp();
  const [title, setTitle] = useState(entry?.title ?? "");
  const [date, setDate] = useState(entry?.date ?? todayStr());
  const [category, setCategory] = useState<DiaryCategoryId>(entry?.category ?? "daily");
  const [moods, setMoods] = useState<MoodId[]>(entry?.moods ?? []);
  const [content, setContent] = useState(entry?.content ?? "");
  const [photoIds, setPhotoIds] = useState<string[]>(entry?.photoIds ?? []);
  const [tagsText, setTagsText] = useState(entry?.tags.join(", ") ?? "");
  const [bookmarked, setBookmarked] = useState(entry?.bookmarked ?? false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const save = () => {
    const t = title.trim();
    if (!t) return;
    const tags = tagsText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const now = Date.now();
    update((d) => {
      if (entry) {
        const e = d.entries.find((x) => x.id === entry.id);
        if (e) Object.assign(e, { title: t, date, category, moods, content, photoIds, tags, bookmarked, updatedAt: now });
      } else {
        d.entries.push({
          id: uid(),
          title: t,
          date,
          category,
          moods,
          content,
          photoIds,
          tags,
          bookmarked,
          createdAt: now,
          updatedAt: now,
        });
      }
    });
    void navigate({ to: "/diary" });
  };

  const remove = () => {
    if (!entry) return;
    deletePhotoFiles(entry.photoIds);
    update((d) => {
      d.entries = d.entries.filter((x) => x.id !== entry.id);
    });
    void navigate({ to: "/diary" });
  };

  return (
    <>
      <EditorShell
        title={entry ? "Edit entry" : "New entry"}
        action={
          <button type="button" className="btn-primary px-4 py-2" onClick={save} disabled={!title.trim()}>
            Save
          </button>
        }
      >
        <label className="label" htmlFor="entry-title">
          Title
        </label>
        <input
          id="entry-title"
          className="input-field"
          placeholder="A quiet Sunday together"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
        />

        <label className="label mt-4" htmlFor="entry-date">
          Date
        </label>
        <input id="entry-date" type="date" className="input-field" value={date} onChange={(e) => setDate(e.target.value)} />

        <p className="label mt-4">Category</p>
        <div className="flex flex-wrap gap-2">
          {DIARY_CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCategory(c.id)}
              className={`chip ${category === c.id ? "chip-active" : ""}`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <p className="label mt-4">Moods</p>
        <MoodPicker
          selected={moods}
          onToggle={(id) => setMoods((m) => (m.includes(id) ? m.filter((x) => x !== id) : [...m, id]))}
        />

        <label className="label mt-4" htmlFor="entry-content">
          What happened?
        </label>
        <textarea
          id="entry-content"
          className="input-field min-h-48"
          placeholder="Write it all down — the big things and the small ones…"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <label className="label mt-4" htmlFor="entry-tags">
          Tags (comma separated)
        </label>
        <input
          id="entry-tags"
          className="input-field"
          placeholder="cozy, weekend, family"
          value={tagsText}
          onChange={(e) => setTagsText(e.target.value)}
        />

        <p className="label mt-4">Photos</p>
        <PhotoPicker ids={photoIds} onChange={setPhotoIds} />

        <label className="mt-5 flex items-center justify-between gap-3">
          <span className="text-sm font-medium text-foreground">Bookmark this entry</span>
          <input
            type="checkbox"
            checked={bookmarked}
            onChange={(e) => setBookmarked(e.target.checked)}
            className="h-5 w-5 accent-primary"
          />
        </label>

        {entry ? (
          <button type="button" className="btn-destructive mt-6 w-full" onClick={() => setConfirmDelete(true)}>
            <Trash2 className="h-4 w-4" /> Delete entry
          </button>
        ) : null}
      </EditorShell>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete this entry?"
        description="The entry and its photos will be removed from this device. This cannot be undone."
        confirmLabel="Delete"
        danger
        onConfirm={remove}
        onClose={() => setConfirmDelete(false)}
      />
    </>
  );
}
