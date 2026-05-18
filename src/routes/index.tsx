import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { ChatView } from "@/components/ChatView";
import { SplitText } from "@/components/SplitText";
import { Magnetic } from "@/components/Magnetic";
import { ArrowRight, Sparkles, Users } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const { state } = useStore();
  const [activeId, setActiveId] = useState<string | null>(
    state.characters[0]?.id ?? null,
  );

  const activeChar = state.characters.find((c) => c.id === activeId);

  if (!activeChar) {
    return <Landing />;
  }

  return (
    <div className="flex h-full">
      <div className="w-[260px] shrink-0 border-r border-border/60 px-3 py-5">
        <div className="px-2 pb-3 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          角色
        </div>
        <div className="flex flex-col gap-1">
          {state.characters.map((c) => {
            const active = c.id === activeId;
            return (
              <button
                key={c.id}
                onClick={() => setActiveId(c.id)}
                className={`group flex items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition ${
                  active ? "bg-secondary/60 text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary/30"
                }`}
              >
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs"
                  style={{
                    background: `linear-gradient(135deg, ${c.color}, oklch(0.5 0.18 280))`,
                    color: "oklch(0.16 0.012 260)",
                  }}
                >
                  {c.emoji}
                </span>
                <span className="truncate">{c.name}</span>
              </button>
            );
          })}
        </div>
        <Link
          to="/characters"
          className="mt-3 flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-border/70 px-3 py-2 text-xs text-muted-foreground transition hover:text-foreground hover:border-primary/40"
        >
          管理角色 <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      <div className="flex-1 overflow-hidden">
        <ChatView character={activeChar} />
      </div>
    </div>
  );
}

function Landing() {
  return (
    <div className="flex h-full items-center justify-center px-10">
      <div className="max-w-xl text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" /> 本地存储 · 硅基流动
        </div>
        <h1 className="font-display text-6xl leading-[1.05]">
          <SplitText text="你的第一个角色，" />
          <br />
          <SplitText text="开启一段对话。" delay={400} className="text-gradient" />
        </h1>
        <p className="mt-6 text-muted-foreground">
          从一个角色开始 —— 给它一段系统提示词、一个名字与气质。
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Magnetic>
            <Link
              to="/characters"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow-[0_14px_40px_-12px_oklch(0.78_0.16_75_/0.7)] transition hover:brightness-110"
            >
              <Sparkles className="h-4 w-4" /> 创建角色
            </Link>
          </Magnetic>
          <Magnetic>
            <Link
              to="/groups"
              className="inline-flex items-center gap-2 rounded-xl glass px-5 py-3 text-sm transition hover:bg-secondary/40"
            >
              <Users className="h-4 w-4" /> AI 群组
            </Link>
          </Magnetic>
        </div>
      </div>
    </div>
  );
}
