import { Images, LineChart, NotebookPen, Sparkles, User, Heart, type LucideIcon } from "lucide-react";

const ITEMS: { to: "/" | "/diary" | "/insights" | "/memories" | "/inspiration" | "/profile"; label: string; icon: LucideIcon }[] = [
  { to: "/", label: "Home", icon: Heart },
  { to: "/diary", label: "Diary", icon: NotebookPen },
  { to: "/insights", label: "Insights", icon: LineChart },
  { to: "/memories", label: "Memories", icon: Images },
  { to: "/inspiration", label: "Inspire", icon: Sparkles },
  { to: "/profile", label: "Profile", icon: User },
];

export function BottomNav() {
  return (
    <nav
      aria-label="Main navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur"
    >
      <div className="mx-auto flex w-full max-w-md items-stretch justify-around px-2 pb-[env(safe-area-inset-bottom)]">
        {ITEMS.map((item) => (
          <NavLink key={item.to} to={item.to} label={item.label} Icon={item.icon} />
        ))}
      </div>
    </nav>
  );
}

function NavLink({
  to,
  label,
  Icon,
}: {
  to: "/" | "/diary" | "/insights" | "/memories" | "/inspiration" | "/profile";
  label: string;
  Icon: LucideIcon;
}) {
  const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
  return (
    <Link
      to={to}
      aria-current={active ? "page" : undefined}
      className={`flex min-w-0 flex-1 flex-col items-center gap-0.5 px-1 py-2.5 text-[10px] font-medium transition-colors ${
        active ? "text-primary" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      <Icon className="h-5 w-5" />
      <span className="truncate">{label}</span>
    </Link>
  );
}
