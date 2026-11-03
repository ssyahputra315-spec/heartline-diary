import { Link, createFileRoute } from "@tanstack/react-router";

import { DiaryEntryEditor } from "@/components/DiaryEntryEditor";
import { useData } from "@/store/app-store";

export const Route = createFileRoute("/diary/$entryId")({
  component: EditEntry,
  head: () => ({
    meta: [
      { title: "Edit entry · My Love Diary" },
      { name: "description", content: "Edit a diary entry in My Love Diary." },
      { property: "og:title", content: "Edit entry · My Love Diary" },
      { property: "og:description", content: "Edit a diary entry in My Love Diary." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function EditEntry() {
  const { entryId } = Route.useParams();
  const data = useData();
  const entry = data.entries.find((e) => e.id === entryId);

  if (!entry) {
    return (
      <div className="mx-auto min-h-screen w-full max-w-md bg-background px-5 pt-28 text-center">
        <p className="text-sm text-muted-foreground">This entry no longer exists.</p>
        <Link to="/diary" className="btn-outline mt-4">
          Back to diary
        </Link>
      </div>
    );
  }

  return <DiaryEntryEditor entry={entry} />;
}
