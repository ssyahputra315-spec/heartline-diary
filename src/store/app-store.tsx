import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import { allPhotos, deletePhotos, forgetPhotoUrls, restorePhotos, savePhoto } from "@/lib/db";
import { clearData, loadData, normalize, saveData } from "@/lib/storage";
import { emptyData, type AppData } from "@/lib/types";

export function uid(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return `id_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

interface AppStore {
  data: AppData | null;
  hydrated: boolean;
  unlocked: boolean;
  unlock: () => void;
  /** Immutably update the data: the recipe receives a draft copy to mutate. */
  update: (recipe: (draft: AppData) => void) => void;
  addPhotoFiles: (files: File[]) => Promise<string[]>;
  /** Remove photos from IndexedDB once nothing references them anymore. */
  deletePhotoFiles: (ids: string[]) => void;
  replaceAll: (data: AppData) => void;
  resetAll: () => Promise<void>;
  exportAll: () => Promise<string>;
  importAll: (json: string) => Promise<{ ok: boolean; error?: string; photosRestored?: number }>;
}

const StoreContext = createContext<AppStore | null>(null);

/** Every photo id referenced anywhere in the data. */
export function collectPhotoIds(d: AppData): string[] {
  const ids: string[] = [];
  if (d.profile.myPhotoId) ids.push(d.profile.myPhotoId);
  if (d.profile.partnerPhotoId) ids.push(d.profile.partnerPhotoId);
  d.entries.forEach((e) => ids.push(...e.photoIds));
  d.memories.forEach((m) => ids.push(...m.photoIds));
  return ids;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const saveTimer = useRef<number | null>(null);

  // Load persisted data on the client only (SSR renders the empty skeleton).
  useEffect(() => {
    setData(loadData() ?? emptyData());
    setHydrated(true);
  }, []);

  // Persist (debounced) whenever data changes after hydration.
  useEffect(() => {
    if (!hydrated || !data) return;
    if (saveTimer.current !== null) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => saveData(data), 250);
    return () => {
      if (saveTimer.current !== null) window.clearTimeout(saveTimer.current);
    };
  }, [data, hydrated]);

  const update = useCallback((recipe: (draft: AppData) => void) => {
    setData((prev) => {
      if (!prev) return prev;
      const draft = structuredClone(prev);
      recipe(draft);
      return draft;
    });
  }, []);

  const addPhotoFiles = useCallback(async (files: File[]): Promise<string[]> => {
    const ids: string[] = [];
    for (const file of files) {
      if (!file.type.startsWith("image/")) continue;
      ids.push(await savePhoto(file));
    }
    return ids;
  }, []);

  const deletePhotoFiles = useCallback((ids: string[]) => {
    void deletePhotos(ids).then(() => forgetPhotoUrls(ids));
  }, []);

  const replaceAll = useCallback((next: AppData) => {
    setData(next);
    saveData(next);
  }, []);

  const resetAll = useCallback(async () => {
    const stale = data ? collectPhotoIds(data) : [];
    clearData();
    forgetPhotoUrls(stale);
    await deletePhotos(stale);
    const fresh = emptyData();
    setData(fresh);
    saveData(fresh);
  }, [data]);

  const exportAll = useCallback(async (): Promise<string> => {
    if (!data) throw new Error("Nothing to export yet");
    const photos = await allPhotos();
    const payload: Record<string, unknown> = { ...data, app: "my-love-diary", exportedAt: new Date().toISOString() };
    payload["photos"] = await Promise.all(
      photos.map(async ([id, blob]) => [id, await blobToBase64(blob)] as [string, string]),
    );
    return JSON.stringify(payload);
  }, [data]);

  const importAll = useCallback(async (json: string) => {
    let parsed: unknown;
    try {
      parsed = JSON.parse(json);
    } catch {
      return { ok: false, error: "That file could not be read as a My Love Diary backup." };
    }
    if (!parsed || typeof parsed !== "object") return { ok: false, error: "That file is not a valid backup." };
    const next = normalize(parsed as Partial<AppData>);
    const photoPairs = Array.isArray((parsed as { photos?: unknown }).photos)
      ? ((parsed as { photos: unknown[] }).photos.filter(
          (p): p is [string, string] => Array.isArray(p) && typeof p[0] === "string" && typeof p[1] === "string",
        ))
      : [];
    let restored = 0;
    try {
      await restorePhotos(
        await Promise.all(
          photoPairs.map(async ([id, b64]) => [id, await base64ToBlob(b64)] as [string, Blob]),
        ),
      );
      restored = photoPairs.length;
    } catch {
      // Photos may fail to restore on some devices; entries still import.
    }
    replaceAll(next);
    return { ok: true, photosRestored: restored };
  }, [replaceAll]);

  // Apply the theme preference to <html> for both the app and the lock screen.
  useEffect(() => {
    if (!data) return;
    const theme = data.profile.theme;
    const dark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", dark);
  }, [data?.profile.theme]);

  const value = useMemo<AppStore>(
    () => ({
      data,
      hydrated,
      unlocked,
      unlock: () => setUnlocked(true),
      update,
      addPhotoFiles,
      deletePhotoFiles,
      replaceAll,
      resetAll,
      exportAll,
      importAll,
    }),
    [data, hydrated, unlocked, update, addPhotoFiles, deletePhotoFiles, replaceAll, resetAll, exportAll, importAll],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useApp(): AppStore {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}

/** Typed accessor that pages use once rendering is gated on hydration. */
export function useData(): AppData {
  const { data } = useApp();
  if (!data) throw new Error("Data not ready");
  return data;
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error("Could not read photo"));
    reader.readAsDataURL(blob);
  });
}

function base64ToBlob(b64: string): Promise<Blob> {
  return fetch(b64).then((r) => r.blob());
}
