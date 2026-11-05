import { useMemo, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Bookmark, Plus, Search } from "lucide-react";

import { PageShell } from "@/components/PageShell";
import { EmptyState } from "@/components/EmptyState";
import { MoodRow } from "@/components/MoodPicker";
import { formatDate } from "@/lib/dates";
import { DIARY_CATEGORIES, diaryCategory, type DiaryCategoryId } from "@/lib/types";
import { useData } from "@/store/app-store";

export const Route = createFileRoute("/diary/")({
  component: Diary,
  head: () => ({
    meta: [
      { title: "Diary · My Love Diary" },
      { name: "description", content: "Browse and write your relationship diary — daily journals, happy moments, letters and more." },
      { property: "og:title", content: "Diary · My Love Diary" },
      { property: "og:description", content: "Browse and write your relationship diary — daily journals, happy moments, letters and more." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function Diary() {
  const data = useData();
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<DiaryCategoryId | "all">("all");
  const [starredOnly, setStarredOnly] = useState(false);

  const entries = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...data.entries]
      .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt)
      .filter((e) => (cat === "all" || e.category === cat) && (!starredOnly || e.bookmarked))
      .filter(
        (e) =>
          !q ||
          e.title.toLowerCase().includes(q) ||
          e.content.toLowerCase().includes(q) ||
          e.tags.some((t) => t.toLowerCase().includes(q)),
      );
  }, [data.entries, query, cat, starredOnly]);

  return (
    <PageShell
      title="Diary"
      subtitle={`${data.entries.length} ${data.entries.length === 1 ? "entry" : "entries"} written`}
      action={
        <Link to="/diary/new" className="btn-primary px-3.5 py-2" aria-label="New entry">
          <Plus className="h-4 w-4" /> New
        </Link>
      }
    >
      {/* Search */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          className="input-field pl-10"
          placeholder="Search title, text or tags…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search entries"
        />
      </div>

      {/* Filters */}
      <div className="mt-3 -mx-5 overflow-x-auto px-5 pb-1">
        <div className="flex w-max gap-2">
          <FilterChip active={cat === "all" && !starredOnly} onClick={() => { setCat("all"); setStarredOnly(false); }}>
            All
          </FilterChip>
          {DIARY_CATEGORIES.map((c) => (
            <FilterChip key={c.id} active={cat === c.id && !starredOnly} onClick={() => { setCat(c.id); setStarredOnly(false); }}>
              {c.label}
            </FilterChip>
          ))}
          <FilterChip active={starredOnly} onClick={() => setStarredOnly((s) => !s)}>
            <Bookmark className={`h-3.5 w-3.5 ${starredOnly ? "fill-current" : ""}`} /> Bookmarked
          </FilterChip>
        </div>
      </div>

      {/* Entries */}
      {entries.length ? (
        <div className="mt-3 space-y-2.5">
          {entries.map((e) => (
            <Link
              key={e.id}
              to="/diary/$entryId"
              params={{ entryId: e.id }}
              className="card block p-4 transition-colors hover:bg-accent/40"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h2 className="truncate font-serif text-base font-semibold text-foreground">{e.title}</h2>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {formatDate(e.date)} · {diaryCategory(e.category).label}
                  </p>
                </div>
                {e.bookmarked ? <Bookmark className="h-4 w-4 shrink-0 fill-primary text-primary" /> : null}
              </div>
              {e.content ? <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{e.content}</p> : null}
              <div className="mt-2 flex items-center justify-between gap-2">
                <MoodRow moods={e.moods} />
                {e.photoIds.length ? (
                  <span className="shrink-0 text-[10px] text-muted-foreground">
                    {e.photoIds.length} {e.photoIds.length === 1 ? "photo" : "photos"}
                  </span>
                ) : null}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-4">
          <EmptyState
            icon={Bookmark}
            title={data.entries.length ? "Nothing matches" : "Your diary is empty"}
            description={
              data.entries.length
                ? "Try a different search or category filter."
                : "Write about today, a happy moment, or something you appreciate."
            }
            action={
              <Link to="/diary/new" className="btn-secondary">
                <Plus className="h-4 w-4" /> New entry
              </Link>
            }
          />
        </div>
      )}
    </PageShell>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} className={`chip ${active ? "chip-active" : ""}`}>
      {children}
    </button>
  );
}
