import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

import { BottomNav } from "./BottomNav";

/** Standard page frame: centered mobile column, serif header, bottom nav. */
export function PageShell({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto min-h-screen w-full max-w-md bg-background">
      <header className="flex items-end justify-between gap-3 px-5 pb-4 pt-7">
        <div className="min-w-0">
          <h1 className="font-serif text-[26px] leading-tight font-semibold tracking-tight text-foreground">{title}</h1>
          {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </header>
      <main className="px-5 pb-28">{children}</main>
      <BottomNav />
    </div>
  );
}

/** Full-screen frame for editors: back link instead of bottom nav. */
export function EditorShell({
  title,
  onBack,
  backTo = "/diary",
  action,
  children,
}: {
  title: string;
  onBack?: () => void;
  backTo?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto min-h-screen w-full max-w-md bg-background">
      <header className="flex items-center justify-between gap-3 px-4 pb-3 pt-5">
        {onBack ? (
          <button type="button" onClick={onBack} aria-label="Go back" className="btn-ghost -ml-2 px-3">
            <ArrowLeft className="h-5 w-5" />
          </button>
        ) : (
          <Link to={backTo} aria-label="Go back" className="btn-ghost -ml-2 px-3">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        )}
        <h1 className="font-serif text-lg font-semibold text-foreground">{title}</h1>
        <div className="shrink-0">{action ?? <span className="w-10" />}</div>
      </header>
      <main className="px-5 pb-12">{children}</main>
    </div>
  );
}
