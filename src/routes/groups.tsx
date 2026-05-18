import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { ChatView } from "@/components/ChatView";
import type { Group } from "@/lib/storage";
import { Plus, Trash2, Save, Users } from "lucide-react";
import { SplitText } from "@/components/SplitText";

export const Route = createFileRoute("/groups")({
  component: GroupsPage,
});

function GroupsPage() {
  const store = useStore();
  const [activeId, setActiveId] = useState<string | null>(
    store.state.groups[0]?.id ?? null,
  );
  const [editing, setEditing] = useState(false);
  const active = store.state.groups.find((g) => g.id === activeId);

  const create = () => {
    const g = store.addGroup({
      name: "新群组",
      systemPrompt: "这是一个 AI 圆桌，参与者之间互相回应，简洁、轮流发言。",
      memberIds: store.state.characters.slice(0, 2).map((c) => c.id),
    });
    setActiveId(g.id);
    setEditing(true);
  };

  return (
    <div className="flex h-full">
      <div className="w-[260px] shrink-0 border-r border-border/60 px-4 py-6">
        <div className="mb-4 flex items-center justify-between px-1">
          <h2 className="font-display text-2xl">
            <SplitText text="群组" />
          </h2>
          <button
            onClick={create}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground transition hover:brightness-110"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <div className="flex flex-col gap-1">
          {store.state.groups.map((g) => {
            const a = g.id === activeId;
            return (
              <button
                key={g.id}
                onClick={() => {
                  setActiveId(g.id);
                  setEditing(false);
                }}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${
                  a ? "bg-secondary/60" : "hover:bg-secondary/30"
                }`}
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-primary/60 text-primary-foreground">
                  <Users className="h-4 w-4" />
                </span>
                <span className="flex-1 truncate">{g.name}</span>
                <span className="text-[10px] text-muted-foreground">{g.memberIds.length}</span>
              </button>
            );
          })}
          {store.state.groups.length === 0 && (
            <div className="rounded-xl border border-dashed border-border/60 p-4 text-center text-sm text-muted-foreground">
              还没有群组
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {!active ? (
          <div className="flex h-full items-center justify-center">
            <div className="max-w-md text-center">
              <p className="text-muted-foreground">
                创建一个群组，让两位 AI 在同一空间里轮流对谈。
              </p>
              {store.state.characters.length < 2 && (
                <Link to="/characters" className="mt-3 inline-block text-xs text-primary underline-offset-4 hover:underline">
                  → 至少需要 2 个角色
                </Link>
              )}
            </div>
          </div>
        ) : editing ? (
          <GroupEditor key={active.id} group={active} onDone={() => setEditing(false)} />
        ) : (
          <div className="flex h-full flex-col">
            <div className="px-6 pt-4">
              <button
                onClick={() => setEditing(true)}
                className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                编辑群组设置
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <ChatView group={active} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function GroupEditor({ group, onDone }: { group: Group; onDone: () => void }) {
  const store = useStore();
  const [draft, setDraft] = useState(group);

  const toggleMember = (id: string) => {
    setDraft((d) => ({
      ...d,
      memberIds: d.memberIds.includes(id)
        ? d.memberIds.filter((x) => x !== id)
        : [...d.memberIds, id],
    }));
  };

  return (
    <div className="mx-auto max-w-2xl px-10 py-10">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">群组</div>
          <h1 className="font-display text-3xl">{draft.name || "未命名"}</h1>
        </div>
        <button
          onClick={() => {
            if (confirm(`删除群组「${group.name}」？`)) {
              store.removeGroup(group.id);
              onDone();
            }
          }}
          className="rounded-lg border border-border/60 p-2 text-muted-foreground transition hover:text-destructive hover:border-destructive/40"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-5">
        <label className="block">
          <div className="mb-1.5 text-xs uppercase tracking-[0.18em] text-muted-foreground">名称</div>
          <input
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            className="w-full rounded-xl glass px-4 py-2.5 text-sm outline-none ring-1 ring-transparent transition focus:ring-primary/40"
          />
        </label>

        <label className="block">
          <div className="mb-1.5 flex items-baseline justify-between">
            <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">群组系统提示词</span>
            <span className="text-[11px] text-muted-foreground/70">作用于群组中所有成员</span>
          </div>
          <textarea
            value={draft.systemPrompt}
            onChange={(e) => setDraft({ ...draft, systemPrompt: e.target.value })}
            rows={5}
            className="w-full resize-y rounded-xl glass px-4 py-3 text-sm outline-none ring-1 ring-transparent transition focus:ring-primary/40"
          />
        </label>

        <div>
          <div className="mb-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">成员</div>
          <div className="grid grid-cols-2 gap-2">
            {store.state.characters.map((c) => {
              const checked = draft.memberIds.includes(c.id);
              return (
                <button
                  key={c.id}
                  onClick={() => toggleMember(c.id)}
                  className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm transition ${
                    checked
                      ? "border-primary/60 bg-primary/10"
                      : "border-border/60 hover:border-border"
                  }`}
                >
                  <span
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-xs"
                    style={{
                      background: `linear-gradient(135deg, ${c.color}, oklch(0.5 0.18 280))`,
                      color: "oklch(0.16 0.012 260)",
                    }}
                  >
                    {c.emoji}
                  </span>
                  <span className="flex-1 truncate">{c.name}</span>
                  {checked && <span className="text-xs text-primary">✓</span>}
                </button>
              );
            })}
          </div>
          {store.state.characters.length === 0 && (
            <Link to="/characters" className="mt-2 inline-block text-xs text-primary">
              先去创建角色 →
            </Link>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onDone}
            className="rounded-xl px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
          >
            取消
          </button>
          <button
            onClick={() => {
              store.updateGroup(group.id, draft);
              onDone();
            }}
            disabled={draft.memberIds.length < 1}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition hover:brightness-110 disabled:opacity-40"
          >
            <Save className="h-4 w-4" /> 保存并打开
          </button>
        </div>
      </div>
    </div>
  );
}
