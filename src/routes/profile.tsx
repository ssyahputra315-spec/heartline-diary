import { useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Download, Lock, MoonStar, Sparkles, Trash2, Upload, UserRound } from "lucide-react";

import { PageShell } from "@/components/PageShell";
import { ConfirmDialog } from "@/components/Sheet";
import { SinglePhotoPicker } from "@/components/PhotoPicker";
import { LOVE_LANGUAGES } from "@/lib/content";
import { todayStr } from "@/lib/dates";
import type { Profile, ThemeSetting } from "@/lib/types";
import { useApp, useData } from "@/store/app-store";

export const Route = createFileRoute("/profile")({
  component: Profile,
  head: () => ({
    meta: [
      { title: "Profile · My Love Diary" },
      { name: "description", content: "Your names, anniversary, theme, reminder, PIN and your data — everything stays on your device." },
      { property: "og:title", content: "Profile · My Love Diary" },
      { property: "og:description", content: "Your names, anniversary, theme, reminder, PIN and your data — everything stays on your device." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function Profile() {
  const data = useData();
  const { update, exportAll, importAll, resetAll } = useApp();
  const profile = data.profile;

  const set = (fn: (p: Profile) => void) => update((d) => fn(d.profile));

  // PIN setup
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState<string | null>(null);
  const [pinSetup, setPinSetup] = useState(false);

  const savePin = () => {
    if (!/^\d{4,8}$/.test(pinInput)) {
      setPinError("Use 4–8 digits.");
      return;
    }
    set((p) => {
      p.pinEnabled = true;
      p.pin = pinInput;
    });
    setPinInput("");
    setPinError(null);
    setPinSetup(false);
  };

  const disablePin = () =>
    set((p) => {
      p.pinEnabled = false;
      p.pin = null;
    });

  // Data management
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [dataMsg, setDataMsg] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const doExport = async () => {
    setBusy(true);
    try {
      const json = await exportAll();
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `my-love-diary-backup-${todayStr()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setDataMsg("Backup downloaded.");
    } catch {
      setDataMsg("Nothing to export yet.");
    } finally {
      setBusy(false);
    }
  };

  const onImport = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const text = await file.text();
      const res = await importAll(text);
      setDataMsg(res.ok ? `Backup restored${res.photosRestored ? ` with ${res.photosRestored} photos` : ""}.` : res.error ?? "Import failed.");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <PageShell title="Profile" subtitle="You, your partner and how the app works">
      {/* Identity */}
      <section className="card p-4">
        <h2 className="flex items-center gap-2 font-serif text-base font-semibold text-foreground">
          <UserRound className="h-4 w-4 text-primary" /> Your names
        </h2>
        <div className="mt-4 flex justify-center gap-8">
          <SinglePhotoPicker id={profile.myPhotoId} onChange={(id) => set((p) => { p.myPhotoId = id; })} label="Me" />
          <SinglePhotoPicker id={profile.partnerPhotoId} onChange={(id) => set((p) => { p.partnerPhotoId = id; })} label="Partner" />
        </div>
        <label className="label mt-5" htmlFor="profile-myname">Your name</label>
        <input id="profile-myname" className="input-field" placeholder="e.g. Sultan" value={profile.myName} onChange={(e) => set((p) => { p.myName = e.target.value; })} />
        <label className="label mt-4" htmlFor="profile-partnername">Partner's name</label>
        <input id="profile-partnername" className="input-field" placeholder="e.g. Aisyah" value={profile.partnerName} onChange={(e) => set((p) => { p.partnerName = e.target.value; })} />
        <label className="label mt-4" htmlFor="profile-start">Relationship start</label>
        <input
          id="profile-start"
          type="date"
          className="input-field"
          max={todayStr()}
          value={profile.relationshipStart}
          onChange={(e) => set((p) => { p.relationshipStart = e.target.value; })}
        />
        <label className="label mt-4" htmlFor="profile-lovelanguage">Your love language</label>
        <select
          id="profile-lovelanguage"
          className="input-field"
          value={profile.loveLanguage}
          onChange={(e) => set((p) => { p.loveLanguage = e.target.value; })}
        >
          <option value="">Not set</option>
          {LOVE_LANGUAGES.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
      </section>

      {/* Appearance */}
      <section className="card mt-4 p-4">
        <h2 className="flex items-center gap-2 font-serif text-base font-semibold text-foreground">
          <MoonStar className="h-4 w-4 text-primary" /> Appearance
        </h2>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {(["light", "dark", "system"] as ThemeSetting[]).map((t) => (
            <button
              key={t}
              type="button"
              aria-pressed={profile.theme === t}
              onClick={() => set((p) => { p.theme = t; })}
              className={`rounded-2xl border px-3 py-2 text-sm font-medium capitalize transition-colors ${
                profile.theme === t ? "border-transparent bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:bg-accent"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </section>

      {/* Reminder */}
      <section className="card mt-4 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 font-serif text-base font-semibold text-foreground">
              <Sparkles className="h-4 w-4 text-primary" /> Daily reminder
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">A gentle nudge to keep your streak alive.</p>
          </div>
          <label className="relative inline-flex shrink-0 cursor-pointer items-center">
            <input
              type="checkbox"
              className="peer sr-only"
              checked={profile.reminderEnabled}
              onChange={(e) => set((p) => { p.reminderEnabled = e.target.checked; })}
            />
            <span className="h-6 w-11 rounded-full bg-muted transition-colors peer-checked:bg-primary peer-focus-visible:ring-2 peer-focus-visible:ring-ring" />
            <span className="absolute left-1 h-4 w-4 rounded-full bg-card shadow transition-all peer-checked:translate-x-5" />
          </label>
        </div>
        {profile.reminderEnabled ? (
          <div className="mt-3">
            <label className="label" htmlFor="profile-remindertime">Remind me at</label>
            <input id="profile-remindertime" type="time" className="input-field" value={profile.reminderTime} onChange={(e) => set((p) => { p.reminderTime = e.target.value; })} />
          </div>
        ) : null}
      </section>

      {/* Security */}
      <section className="card mt-4 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 font-serif text-base font-semibold text-foreground">
              <Lock className="h-4 w-4 text-primary" /> PIN lock
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">{profile.pinEnabled ? "The app asks for your PIN on open." : "Keep this diary private on shared devices."}</p>
          </div>
          {profile.pinEnabled ? (
            <button type="button" className="btn-outline shrink-0 px-3 py-1.5 text-xs" onClick={disablePin}>
              Turn off
            </button>
          ) : pinSetup ? null : (
            <button type="button" className="btn-outline shrink-0 px-3 py-1.5 text-xs" onClick={() => setPinSetup(true)}>
              Turn on
            </button>
          )}
        </div>
        {pinSetup && !profile.pinEnabled ? (
          <div className="mt-3">
            <label className="label" htmlFor="profile-pin">Choose a PIN (4–8 digits)</label>
            <input
              id="profile-pin"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              className="input-field tracking-widest"
              placeholder="••••"
              value={pinInput}
              onChange={(e) => {
                setPinInput(e.target.value.replace(/\D/g, "").slice(0, 8));
                setPinError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") savePin();
              }}
            />
            {pinError ? <p className="mt-1.5 text-xs text-destructive">{pinError}</p> : null}
            <div className="mt-3 flex gap-2">
              <button type="button" className="btn-outline flex-1" onClick={() => { setPinSetup(false); setPinInput(""); setPinError(null); }}>
                Cancel
              </button>
              <button type="button" className="btn-primary flex-1" onClick={savePin}>
                Save PIN
              </button>
            </div>
          </div>
        ) : null}
      </section>

      {/* Data */}
      <section className="card mt-4 p-4">
        <h2 className="font-serif text-base font-semibold text-foreground">Your data</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">Everything is stored on this device. Back it up or move it anytime.</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button type="button" className="btn-outline" disabled={busy} onClick={doExport}>
            <Download className="h-4 w-4" /> Export backup
          </button>
          <button type="button" className="btn-outline" disabled={busy} onClick={() => fileRef.current?.click()}>
            <Upload className="h-4 w-4" /> Import backup
          </button>
        </div>
        <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={(e) => void onImport(e.target.files)} />
        {dataMsg ? <p className="mt-2.5 text-xs text-muted-foreground">{dataMsg}</p> : null}
        <div className="mt-3 border-t border-border pt-3">
          <button type="button" className="btn-destructive w-full" onClick={() => setConfirmReset(true)}>
            <Trash2 className="h-4 w-4" /> Erase everything
          </button>
        </div>
      </section>

      <ConfirmDialog
        open={confirmReset}
        title="Erase everything?"
        description="All entries, memories, photos and settings on this device will be deleted. This cannot be undone."
        confirmLabel="Erase all"
        danger
        onConfirm={() => void resetAll()}
        onClose={() => setConfirmReset(false)}
      />
    </PageShell>
  );
}
