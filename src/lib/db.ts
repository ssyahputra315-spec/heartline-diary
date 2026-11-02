/**
 * IndexedDB photo storage. Photos are stored as Blobs under generated ids;
 * diary entries, memories and the profile only reference those ids.
 */

const DB_NAME = "mylovediary";
const DB_VERSION = 1;
const PHOTO_STORE = "photos";

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (typeof indexedDB === "undefined") {
    return Promise.reject(new Error("IndexedDB is not available"));
  }
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(PHOTO_STORE)) db.createObjectStore(PHOTO_STORE);
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error ?? new Error("Failed to open photo storage"));
    });
  }
  return dbPromise;
}

function withStore<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T> | void): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(PHOTO_STORE, mode);
        const store = tx.objectStore(PHOTO_STORE);
        let request: IDBRequest<T> | void;
        try {
          request = run(store);
        } catch (err) {
          reject(err instanceof Error ? err : new Error(String(err)));
          return;
        }
        tx.oncomplete = () => resolve(request !== undefined && "result" in request ? (request.result as T) : (undefined as T));
        tx.onerror = () => reject(tx.error ?? new Error("Photo storage error"));
        tx.onabort = () => reject(tx.error ?? new Error("Photo storage aborted"));
      }),
  );
}

export async function savePhoto(blob: Blob): Promise<string> {
  const id = `p_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
  await withStore("readwrite", (store) => store.put(blob, id));
  return id;
}

export function getPhotoBlob(id: string): Promise<Blob | undefined> {
  return withStore<Blob | undefined>("readonly", (store) => store.get(id) as IDBRequest<Blob | undefined>);
}

export function deletePhotos(ids: string[]): Promise<void> {
  if (!ids.length) return Promise.resolve();
  return withStore("readwrite", (store) => {
    ids.forEach((id) => store.delete(id));
  });
}

export function allPhotos(): Promise<[string, Blob][]> {
  return withStore<IDBValidKey[]>("readonly", (store) => store.getAllKeys()).then((keys) =>
    Promise.all(
      keys.map((key) =>
        getPhotoBlob(String(key)).then((blob) => [String(key), blob as Blob] as [string, Blob]),
      ),
    ),
  );
}

export async function restorePhotos(entries: [string, Blob][]): Promise<void> {
  await withStore("readwrite", (store) => {
    entries.forEach(([id, blob]) => store.put(blob, id));
  });
}

/** Object-URL cache for rendering photos. */
const urlCache = new Map<string, string>();

export async function photoUrl(id: string): Promise<string | null> {
  const cached = urlCache.get(id);
  if (cached) return cached;
  try {
    const blob = await getPhotoBlob(id);
    if (!blob) return null;
    const url = URL.createObjectURL(blob);
    urlCache.set(id, url);
    return url;
  } catch {
    return null;
  }
}

export function forgetPhotoUrls(ids: string[]) {
  ids.forEach((id) => {
    const url = urlCache.get(id);
    if (url) URL.revokeObjectURL(url);
    urlCache.delete(id);
  });
}

/** Photo ids that would be orphaned if `usedIds` were removed from the data set. */
export function orphansOf(allIds: string[], usedIds: Set<string>): string[] {
  return allIds.filter((id) => !usedIds.has(id));
}
