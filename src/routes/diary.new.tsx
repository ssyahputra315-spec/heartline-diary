import { createFileRoute } from "@tanstack/react-router";

import { DiaryEntryEditor } from "@/components/DiaryEntryEditor";

export const Route = createFileRoute("/diary/new")({
  component: NewEntry,
  head: () => ({
    meta: [
      { title: "New entry · My Love Diary" },
      { name: "description", content: "Write a new diary entry about your relationship." },
      { property: "og:title", content: "New entry · My Love Diary" },
      { property: "og:description", content: "Write a new diary entry about your relationship." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function NewEntry() {
  return <DiaryEntryEditor />;
}
