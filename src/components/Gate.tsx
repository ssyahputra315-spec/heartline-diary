import { useState, type ReactNode } from "react";
import { Delete, Heart, Lock } from "lucide-react";

import { useApp } from "@/store/app-store";
import { SkeletonPage } from "./EmptyState";

/**
 * Gates every page on data hydration and, when a PIN is set, on unlocking.
 * SSR and the first client paint render the loading skeleton; the lock
 * screen replaces the whole page (bottom nav included) until unlocked.
 */
export function Gate({ children }: { children: ReactNode }) {
  const { data, hydrated, unlocked, unlock } = useApp();

  if (!hydrated || !data) return <SkeletonPage />;
  if (data.profile.pinEnabled && data.profile.pin && !unlocked) {
    return <LockScreen pin={data.profile.pin} onUnlock={unlock} />;
  }
  return <>{children}</>;
}

function LockScreen({ pin, onUnlock }: { pin: string; onUnlock: () => void }) {
  const [entered, setEntered] = useState("");
  const [error, setError] = useState(false);

  const press = (digit: string) => {
    if (entered.length >= 4) return;
    const next = entered + digit;
    setEntered(next);
    setError(false);
    if (next.length === 4) {
      if (next === pin) {
        window.setTimeout(onUnlock, 150);
      } else {
        window.setTimeout(() => {
          setError(true);
          setEntered("");
        }, 200);
      }
    }
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center bg-background px-8">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
        <Lock className="h-7 w-7 text-primary" />
      </div>
      <h1 className="mt-5 font-serif text-2xl font-semibold text-foreground">Our private diary</h1>
      <p className="mt-1 text-sm text-muted-foreground">Enter your 4-digit PIN to continue</p>

      <div className="mt-7 flex gap-3" aria-label="PIN entry">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={`h-4 w-4 rounded-full border transition-colors ${
              error
                ? "border-destructive bg-destructive"
                : entered.length > i
                  ? "border-primary bg-primary"
                  : "border-border bg-card"
            }`}
          />
        ))}
      </div>
      {error ? <p className="mt-3 text-sm text-destructive">Wrong PIN, try again</p> : null}

      <div className="mt-8 grid w-full max-w-[16rem] grid-cols-3 gap-3">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
          <KeypadButton key={d} onClick={() => press(d)}>
            {d}
          </KeypadButton>
        ))}
        <span />
        <KeypadButton onClick={() => press("0")}>0</KeypadButton>
        <KeypadButton onClick={() => setEntered(entered.slice(0, -1))} aria-label="Delete last digit">
          <Delete className="h-5 w-5" />
        </KeypadButton>
      </div>

      <p className="mt-8 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Heart className="h-3.5 w-3.5 text-primary" /> Everything stays on this device
      </p>
    </div>
  );
}

function KeypadButton({
  children,
  onClick,
  ...rest
}: {
  children: ReactNode;
  onClick: () => void;
  "aria-label"?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-16 items-center justify-center rounded-2xl border border-border bg-card font-serif text-2xl font-medium text-foreground transition-colors hover:bg-accent active:bg-secondary"
      {...rest}
    >
      {children}
    </button>
  );
}
