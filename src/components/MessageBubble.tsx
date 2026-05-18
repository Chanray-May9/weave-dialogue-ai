import { useEffect, useRef } from "react";
import { animate } from "animejs";
import type { Message } from "@/lib/storage";

export function MessageBubble({
  m,
  tint,
}: {
  m: Message;
  tint?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mountedRef = useRef(false);

  useEffect(() => {
    if (!ref.current || mountedRef.current) return;
    mountedRef.current = true;
    animate(ref.current, {
      opacity: [0, 1],
      translateY: [12, 0],
      filter: ["blur(6px)", "blur(0px)"],
      duration: 500,
      ease: "out(3)",
    });
  }, []);

  const isUser = m.role === "user";

  return (
    <div
      ref={ref}
      className={`flex w-full gap-3 ${isUser ? "flex-row-reverse" : ""}`}
      style={{ opacity: 0 }}
    >
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-medium"
        style={{
          background: isUser
            ? "linear-gradient(135deg, oklch(0.78 0.16 75), oklch(0.7 0.18 50))"
            : `linear-gradient(135deg, ${tint ?? "#7cc0ff"}, oklch(0.55 0.18 280))`,
          color: "oklch(0.16 0.012 260)",
          boxShadow: "0 4px 14px -4px oklch(0 0 0 / 0.5)",
        }}
      >
        {isUser ? "你" : (m.characterName?.[0] ?? "AI")}
      </div>
      <div className={`flex max-w-[78%] flex-col gap-1 ${isUser ? "items-end" : "items-start"}`}>
        {!isUser && m.characterName && (
          <div className="px-1 text-[11px] uppercase tracking-wider text-muted-foreground">
            {m.characterName}
          </div>
        )}
        <div
          className={`relative whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-[14.5px] leading-relaxed ${
            isUser
              ? "bg-primary text-primary-foreground"
              : "glass-strong text-foreground"
          }`}
          style={
            isUser
              ? { boxShadow: "0 10px 30px -12px oklch(0.78 0.16 75 / 0.55)" }
              : undefined
          }
        >
          {m.content || (
            <span className="inline-flex items-center gap-1 text-muted-foreground">
              <span className="dot-1 h-1.5 w-1.5 rounded-full bg-current" />
              <span className="dot-2 h-1.5 w-1.5 rounded-full bg-current" />
              <span className="dot-3 h-1.5 w-1.5 rounded-full bg-current" />
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
