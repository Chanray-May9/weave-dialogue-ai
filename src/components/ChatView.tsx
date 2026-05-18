import { useEffect, useRef, useState } from "react";
import { useStore } from "@/lib/store";
import { streamChat, toApiMessages } from "@/lib/siliconflow";
import type { Character, Group, Message } from "@/lib/storage";
import { MessageBubble } from "./MessageBubble";
import { Send, Square, Trash2, Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";

interface Props {
  character?: Character;
  group?: Group;
}

export function ChatView({ character, group }: Props) {
  const store = useStore();
  const chatKey = character ? `char:${character.id}` : `group:${group!.id}`;
  const messages = store.getMessages(chatKey);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  useEffect(() => {
    taRef.current?.focus();
  }, [chatKey]);

  const membersById = new Map(store.state.characters.map((c) => [c.id, c]));
  const groupMembers: Character[] =
    group?.memberIds.map((id) => membersById.get(id)).filter(Boolean) as Character[] ?? [];

  const tintFor = (m: Message): string => {
    if (character) return character.color;
    if (m.characterId) return membersById.get(m.characterId)?.color ?? "#7cc0ff";
    return "#7cc0ff";
  };

  const send = async () => {
    const text = input.trim();
    if (!text || busy) return;
    const { settings } = store.state;
    if (!settings.apiKey) {
      store.appendMessage(chatKey, {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "⚠️ 请先在「设置」中填写硅基流动 API Key。",
        createdAt: Date.now(),
      });
      return;
    }

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      createdAt: Date.now(),
    };
    store.appendMessage(chatKey, userMsg);
    setInput("");
    setBusy(true);

    try {
      if (character) {
        await runOne(character, [...messages, userMsg]);
      } else if (group) {
        // Round-robin: each member responds once, in order, seeing prior turns.
        // User can interrupt by clicking stop.
        const order = groupMembers;
        let history: Message[] = [...messages, userMsg];
        for (const member of order) {
          const ac = new AbortController();
          abortRef.current = ac;
          if (ac.signal.aborted) break;
          const placeholder: Message = {
            id: crypto.randomUUID(),
            role: "assistant",
            content: "",
            characterId: member.id,
            characterName: member.name,
            createdAt: Date.now(),
          };
          store.appendMessage(chatKey, placeholder);
          const sys = [group.systemPrompt, `你是「${member.name}」。${member.systemPrompt}`, `当前是多 AI 群组对话，参与者：${order.map((o) => o.name).join("、")}。请简洁地回应他人，避免重复。`]
            .filter(Boolean)
            .join("\n\n");
          const apiMsgs = toApiMessages(sys, history);
          let acc = "";
          try {
            await streamChat({
              apiKey: settings.apiKey,
              baseUrl: settings.baseUrl,
              model: settings.model,
              messages: apiMsgs,
              signal: ac.signal,
              onToken: (t) => {
                acc += t;
                store.updateLastMessage(chatKey, { content: acc });
              },
            });
          } catch (e) {
            if ((e as Error).name === "AbortError") {
              store.updateLastMessage(chatKey, { content: acc || "（已停止）" });
              break;
            }
            store.updateLastMessage(chatKey, { content: `❌ ${(e as Error).message}` });
            break;
          }
          history = [...history, { ...placeholder, content: acc }];
        }
      }
    } finally {
      abortRef.current = null;
      setBusy(false);
    }
  };

  const runOne = async (char: Character, history: Message[]) => {
    const ac = new AbortController();
    abortRef.current = ac;
    const placeholder: Message = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "",
      characterId: char.id,
      characterName: char.name,
      createdAt: Date.now(),
    };
    store.appendMessage(chatKey, placeholder);
    let acc = "";
    const { settings } = store.state;
    try {
      await streamChat({
        apiKey: settings.apiKey,
        baseUrl: settings.baseUrl,
        model: settings.model,
        messages: toApiMessages(char.systemPrompt, history),
        signal: ac.signal,
        onToken: (t) => {
          acc += t;
          store.updateLastMessage(chatKey, { content: acc });
        },
      });
    } catch (e) {
      if ((e as Error).name === "AbortError") {
        store.updateLastMessage(chatKey, { content: acc || "（已停止）" });
        return;
      }
      store.updateLastMessage(chatKey, { content: `❌ ${(e as Error).message}` });
    }
  };

  const stop = () => abortRef.current?.abort();

  const title = character ? character.name : group?.name ?? "";
  const subtitle = character
    ? character.systemPrompt.slice(0, 80) + (character.systemPrompt.length > 80 ? "…" : "")
    : `${groupMembers.length} 位 AI · 轮流发言`;

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between border-b border-border/60 px-8 py-5">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl text-lg"
            style={{
              background: character
                ? `linear-gradient(135deg, ${character.color}, oklch(0.5 0.18 280))`
                : "linear-gradient(135deg, oklch(0.72 0.14 230), oklch(0.55 0.2 320))",
              color: "oklch(0.16 0.012 260)",
            }}
          >
            {character?.emoji ?? "⌘"}
          </div>
          <div>
            <h1 className="font-display text-xl leading-tight">{title}</h1>
            <p className="text-xs text-muted-foreground line-clamp-1 max-w-md">{subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => store.clearChat(chatKey)}
            className="rounded-lg border border-border/60 p-2 text-muted-foreground transition hover:text-foreground hover:bg-secondary"
            title="清空对话"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-8 py-8">
        <div className="mx-auto flex max-w-3xl flex-col gap-5">
          {messages.length === 0 && (
            <EmptyState character={character} group={group} />
          )}
          {messages.map((m) => (
            <MessageBubble key={m.id} m={m} tint={tintFor(m)} />
          ))}
        </div>
      </div>

      <footer className="border-t border-border/60 px-8 py-5">
        <div className="mx-auto max-w-3xl">
          <div className="glass-strong group flex items-end gap-2 rounded-2xl p-2.5 ring-1 ring-transparent transition focus-within:ring-primary/40">
            <textarea
              ref={taRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              rows={1}
              placeholder={
                busy && group
                  ? "AI 正在轮流发言，可随时停止后插入新消息…"
                  : "和 AI 说点什么 · Enter 发送 · Shift+Enter 换行"
              }
              className="max-h-48 min-h-[40px] flex-1 resize-none bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground/70"
              style={{
                height: Math.min(192, Math.max(40, input.split("\n").length * 22 + 18)),
              }}
            />
            {busy ? (
              <button
                onClick={stop}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive text-destructive-foreground transition hover:brightness-110"
                title="停止"
              >
                <Square className="h-4 w-4" fill="currentColor" />
              </button>
            ) : (
              <button
                onClick={send}
                disabled={!input.trim()}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground transition hover:brightness-110 disabled:opacity-40"
                title="发送"
                style={{ boxShadow: "0 8px 22px -10px oklch(0.78 0.16 75 / 0.7)" }}
              >
                <Send className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}

function EmptyState({ character, group }: { character?: Character; group?: Group }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl glass">
        <Sparkles className="h-6 w-6 text-primary" />
      </div>
      <h2 className="font-display text-2xl text-gradient">
        {character ? `与「${character.name}」开始对话` : `群组「${group?.name}」准备就绪`}
      </h2>
      <p className="text-sm text-muted-foreground">
        {character
          ? "试着提一个问题、寻求一段灵感，或交付一段你正在打磨的文字。"
          : "你写下的第一句话，将开启 AI 们的轮流回应。"}
      </p>
      {!useStore().state.settings.apiKey && (
        <Link
          to="/settings"
          className="mt-2 text-xs text-primary underline-offset-4 hover:underline"
        >
          → 先到设置填写 API Key
        </Link>
      )}
    </div>
  );
}
