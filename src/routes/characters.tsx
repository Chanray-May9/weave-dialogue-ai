import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useStore } from "@/lib/store";
import type { Character } from "@/lib/storage";
import { Plus, Trash2, Save, Sparkles } from "lucide-react";
import { SplitText } from "@/components/SplitText";

export const Route = createFileRoute("/characters")({
  component: CharactersPage,
});

const EMOJIS = ["✶", "❦", "✦", "❋", "✺", "❖", "⌘", "✧", "☄", "❂"];

function CharactersPage() {
  const store = useStore();
  const [editingId, setEditingId] = useState<string | null>(
    store.state.characters[0]?.id ?? null,
  );
  const editing = store.state.characters.find((c) => c.id === editingId);

  const create = () => {
    const c = store.addCharacter({
      name: "新角色",
      emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
      systemPrompt: "",
      color: store.newTint(),
    });
    setEditingId(c.id);
  };

  return (
    <div className="flex h-full">
      <div className="w-[300px] shrink-0 border-r border-border/60 px-4 py-6">
        <div className="mb-4 flex items-center justify-between px-1">
          <h2 className="font-display text-2xl">
            <SplitText text="角色" />
          </h2>
          <button
            onClick={create}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground transition hover:brightness-110"
            title="新建角色"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-col gap-1">
          {store.state.characters.map((c) => {
            const active = c.id === editingId;
            return (
              <button
                key={c.id}
                onClick={() => setEditingId(c.id)}
                className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${
                  active ? "bg-secondary/60" : "hover:bg-secondary/30"
                }`}
              >
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                  style={{
                    background: `linear-gradient(135deg, ${c.color}, oklch(0.5 0.18 280))`,
                    color: "oklch(0.16 0.012 260)",
                  }}
                >
                  {c.emoji}
                </span>
                <span className="flex-1 truncate">{c.name}</span>
              </button>
            );
          })}
          {store.state.characters.length === 0 && (
            <div className="rounded-xl border border-dashed border-border/60 p-4 text-center text-sm text-muted-foreground">
              还没有角色
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {editing ? (
          <Editor key={editing.id} character={editing} />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <button onClick={create} className="flex items-center gap-2 rounded-xl glass px-4 py-3 text-sm">
              <Sparkles className="h-4 w-4" /> 创建第一个角色
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Editor({ character }: { character: Character }) {
  const store = useStore();
  const [draft, setDraft] = useState(character);
  const dirty = JSON.stringify(draft) !== JSON.stringify(character);

  return (
    <div className="mx-auto max-w-2xl px-10 py-10">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-2xl text-3xl"
            style={{
              background: `linear-gradient(135deg, ${draft.color}, oklch(0.5 0.18 280))`,
              color: "oklch(0.16 0.012 260)",
              boxShadow: "var(--shadow-glow)",
            }}
          >
            {draft.emoji}
          </div>
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">角色</div>
            <h1 className="font-display text-3xl">{draft.name || "未命名"}</h1>
          </div>
        </div>
        <button
          onClick={() => {
            if (confirm(`删除角色「${character.name}」？此操作不可撤销。`)) {
              store.removeCharacter(character.id);
            }
          }}
          className="rounded-lg border border-border/60 p-2 text-muted-foreground transition hover:text-destructive hover:border-destructive/40"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-5">
        <Field label="名称">
          <input
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            className="w-full rounded-xl glass px-4 py-2.5 text-sm outline-none ring-1 ring-transparent transition focus:ring-primary/40"
          />
        </Field>

        <Field label="标志">
          <div className="flex flex-wrap gap-2">
            {EMOJIS.map((e) => (
              <button
                key={e}
                onClick={() => setDraft({ ...draft, emoji: e })}
                className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg transition ${
                  draft.emoji === e ? "bg-primary text-primary-foreground" : "glass hover:bg-secondary/40"
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        </Field>

        <Field label="系统提示词" hint="为这个角色设定身份、语气、行为规则。">
          <textarea
            value={draft.systemPrompt}
            onChange={(e) => setDraft({ ...draft, systemPrompt: e.target.value })}
            rows={8}
            placeholder="例如：你是一位耐心、严谨的物理老师，使用类比帮助学生理解抽象概念……"
            className="w-full resize-y rounded-xl glass px-4 py-3 text-sm leading-relaxed outline-none ring-1 ring-transparent transition focus:ring-primary/40"
          />
        </Field>

        <div className="flex justify-end gap-2 pt-2">
          <button
            disabled={!dirty}
            onClick={() => setDraft(character)}
            className="rounded-xl px-4 py-2 text-sm text-muted-foreground transition hover:text-foreground disabled:opacity-40"
          >
            重置
          </button>
          <button
            disabled={!dirty}
            onClick={() => store.updateCharacter(character.id, draft)}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition hover:brightness-110 disabled:opacity-40"
          >
            <Save className="h-4 w-4" /> 保存
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="mb-1.5 flex items-baseline justify-between">
        <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</span>
        {hint && <span className="text-[11px] text-muted-foreground/70">{hint}</span>}
      </div>
      {children}
    </label>
  );
}
