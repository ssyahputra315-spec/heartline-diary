import { useEffect, useState } from "react";
import { ImagePlus, Trash2 } from "lucide-react";

import { photoUrl } from "@/lib/db";
import { useApp } from "@/store/app-store";

/** Renders a stored photo by id (loads an object URL from IndexedDB). */
export function PhotoImage({ id, className = "", alt = "Photo" }: { id: string; className?: string; alt?: string }) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    photoUrl(id).then((u) => {
      if (alive) setUrl(u);
    });
    return () => {
      alive = false;
    };
  }, [id]);

  if (!url) return <div className={`animate-pulse bg-muted ${className}`} />;
  return <img src={url} alt={alt} className={`object-cover ${className}`} />;
}

/** File input styled as a tile; stores picked images in IndexedDB. */
export function PhotoPicker({ ids, onChange, max = 6 }: { ids: string[]; onChange: (ids: string[]) => void; max?: number }) {
  const { addPhotoFiles, deletePhotoFiles } = useApp();
  const [busy, setBusy] = useState(false);

  const pick = async (files: FileList | null) => {
    if (!files?.length || busy) return;
    setBusy(true);
    try {
      const room = Math.max(0, max - ids.length);
      const added = await addPhotoFiles(Array.from(files).slice(0, room));
      if (added.length) onChange([...ids, ...added]);
    } finally {
      setBusy(false);
    }
  };

  const remove = (id: string) => {
    deletePhotoFiles([id]);
    onChange(ids.filter((i) => i !== id));
  };

  return (
    <div className="flex flex-wrap gap-2">
      {ids.map((id) => (
        <div key={id} className="group relative h-20 w-20 overflow-hidden rounded-xl border border-border">
          <PhotoImage id={id} className="h-full w-full" />
          <button
            type="button"
            aria-label="Remove photo"
            onClick={() => remove(id)}
            className="absolute right-1 top-1 rounded-full bg-background/80 p-1 text-foreground transition-colors hover:bg-destructive hover:text-destructive-foreground"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
      {ids.length < max ? (
        <label
          className={`flex h-20 w-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border bg-secondary/50 text-muted-foreground transition-colors hover:bg-secondary ${busy ? "opacity-50" : ""}`}
        >
          <ImagePlus className="h-5 w-5" />
          <span className="text-[10px] font-medium">{busy ? "Adding…" : "Add"}</span>
          <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => pick(e.target.files)} />
        </label>
      ) : null}
    </div>
  );
}

/** Single round photo (profile avatars). */
export function SinglePhotoPicker({
  id,
  onChange,
  label,
}: {
  id: string | null;
  onChange: (id: string | null) => void;
  label: string;
}) {
  const { addPhotoFiles, deletePhotoFiles } = useApp();
  const [busy, setBusy] = useState(false);

  const pick = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file || busy) return;
    setBusy(true);
    try {
      const added = await addPhotoFiles([file]);
      if (added[0]) {
        if (id) deletePhotoFiles([id]);
        onChange(added[0]);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <label className="relative block h-24 w-24 cursor-pointer overflow-hidden rounded-full border border-border bg-secondary">
        {id ? <PhotoImage id={id} className="h-full w-full" alt={label} /> : null}
        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-medium text-muted-foreground">
          {id ? "" : `+ ${label}`}
        </span>
        <input type="file" accept="image/*" className="hidden" onChange={(e) => pick(e.target.files)} />
      </label>
      {id ? (
        <button
          type="button"
          className="text-xs text-muted-foreground underline-offset-2 hover:underline"
          onClick={() => {
            deletePhotoFiles([id]);
            onChange(null);
          }}
        >
          Remove
        </button>
      ) : null}
    </div>
  );
}
