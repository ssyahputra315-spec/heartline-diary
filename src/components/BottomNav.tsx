import { Link, useLocation } from "@tanstack/react-router";
import { Heart, Images, LineChart, NotebookPen, Sparkles, User } from "lucide-react";

const ITEMS = [
  { to: "/", label: "Home", icon: Home },
  { to: "/diary", label: "Diary", icon: NotebookPen },
  { to: "/insights", label: "Insights", icon: LineChart },
  { to: "/memories", label: "Memories", icon: Images },
  { to: "/inspiration", label: "Inspire", icon: Sparkles },
  { to: "/profile", label: "Profile", icon: User },
] as const;

function Icon({ kind }: { kind: "Home" | "Diary" | "Insights" | "Memories" | "Inspire" | "Profile" }) {
  const cls = "h-5 w-5";
  switch (kind) {
    case "Home":
      return <Heart className={cls} />;
    case "Diary":
      return <NotebookPen className={cls} />;
    case "Insights":
      return <LineChart className={cls} />;
    case "Memories":
      return <Images className={cls} />;
    case "Inspire":
      return <Sparkles className={cls} />;
    case "Profile":
      return <User className={cls} />;
  }
}

export function BottomNav() {
  const location = useLocation();
  return (
    <nav
      aria-label="Main navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur"
    >
      <div className="mx-auto flex w-full max-w-md items-stretch justify-around px-2 pb-[env(safe-area-inset-bottom)]">
        {ITEMS.map((item) => {
          const active = item.to === "/" ? location.pathname === "/" : location.pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              aria-current={active ? "page" : undefined}
              className={`flex min-w-0 flex-1 flex-col items-center gap-0.5 px-1 py-2.5 text-[10px] font-medium transition-colors ${
                active ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon kind={item.label === "Inspire" ? "Inspire" : (item.label as never)} />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
