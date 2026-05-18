import { Link, useLocation } from "@tanstack/react-router";
import { MessageSquare, Users, Settings as SettingsIcon, Sparkles } from "lucide-react";
import { useEffect, useRef } from "react";
import { animate } from "animejs";

const items = [
  { to: "/", label: "对话", icon: MessageSquare },
  { to: "/characters", label: "角色", icon: Sparkles },
  { to: "/groups", label: "群组", icon: Users },
  { to: "/settings", label: "设置", icon: SettingsIcon },
];

export function Sidebar() {
  const loc = useLocation();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    animate(ref.current.querySelectorAll("[data-nav]"), {
      opacity: [0, 1],
      translateX: [-12, 0],
      duration: 600,
      delay: (_el, i) => 80 + i * 70,
      ease: "out(3)",
    });
  }, []);

  return (
    <aside className="flex h-full w-[260px] shrink-0 flex-col gap-2 border-r border-border/60 px-4 py-6 glass">
      <Link to="/" className="mb-6 flex items-center gap-3 px-2">
        <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-[0_8px_24px_-8px_oklch(0.78_0.16_75_/0.6)]">
          <span className="font-display text-lg leading-none">∮</span>
        </div>
        <div className="leading-tight">
          <div className="font-display text-xl tracking-tight">Silicon</div>
          <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            chat studio
          </div>
        </div>
      </Link>

      <nav ref={ref} className="flex flex-col gap-1">
        {items.map(({ to, label, icon: Icon }) => {
          const active =
            to === "/" ? loc.pathname === "/" : loc.pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              data-nav
              className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                active
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {active && (
                <span
                  className="absolute inset-0 -z-10 rounded-xl border border-border/60"
                  style={{
                    background:
                      "linear-gradient(180deg, oklch(1 0 0 / 0.06), oklch(1 0 0 / 0.02))",
                    boxShadow: "var(--shadow-soft)",
                  }}
                />
              )}
              <Icon className="h-4 w-4" />
              <span>{label}</span>
              {active && (
                <span
                  className="ml-auto h-1.5 w-1.5 rounded-full bg-primary"
                  style={{ boxShadow: "0 0 12px oklch(0.82 0.18 70 / 0.8)" }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-xl border border-border/60 p-3 text-xs text-muted-foreground glass">
        <div className="mb-1 flex items-center gap-1.5 text-foreground/80">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_oklch(0.78_0.18_150)]" />
          本地存储 · 隐私优先
        </div>
        所有数据仅保存在你的浏览器
      </div>
    </aside>
  );
}
