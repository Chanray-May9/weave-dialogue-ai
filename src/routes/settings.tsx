import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { SplitText } from "@/components/SplitText";
import { Eye, EyeOff, Check, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

const MODELS = [
  "Qwen/Qwen2.5-7B-Instruct",
  "Qwen/Qwen2.5-72B-Instruct",
  "deepseek-ai/DeepSeek-V3",
  "deepseek-ai/DeepSeek-V2.5",
  "meta-llama/Meta-Llama-3.1-8B-Instruct",
  "THUDM/glm-4-9b-chat",
];

function SettingsPage() {
  const { state, setSettings } = useStore();
  const [draft, setDraft] = useState(state.settings);
  const [show, setShow] = useState(false);
  const [saved, setSaved] = useState(false);

  const save = () => {
    setSettings(draft);
    setSaved(true);
    setTimeout(() => setSaved(false), 1600);
  };

  return (
    <div className="mx-auto max-w-2xl px-10 py-12">
      <div className="mb-2 text-xs uppercase tracking-[0.22em] text-muted-foreground">设置</div>
      <h1 className="font-display text-4xl">
        <SplitText text="连接你的硅基流动账户" />
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        所有凭据仅存储在本地浏览器中 · 不会上传至任何服务器。
      </p>

      <div className="mt-10 space-y-6">
        <Field label="API Key" hint="以 sk- 开头">
          <div className="relative">
            <input
              type={show ? "text" : "password"}
              value={draft.apiKey}
              onChange={(e) => setDraft({ ...draft, apiKey: e.target.value })}
              placeholder="sk-xxxxxxxxxxxxxxxx"
              className="w-full rounded-xl glass px-4 py-3 pr-12 font-mono text-sm outline-none ring-1 ring-transparent transition focus:ring-primary/40"
              autoComplete="off"
            />
            <button
              onClick={() => setShow(!show)}
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-muted-foreground transition hover:text-foreground"
            >
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <a
            href="https://cloud.siliconflow.cn/account/ak"
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground transition hover:text-primary"
          >
            前往硅基流动获取 API Key <ExternalLink className="h-3 w-3" />
          </a>
        </Field>

        <Field label="模型">
          <div className="relative">
            <input
              list="model-list"
              value={draft.model}
              onChange={(e) => setDraft({ ...draft, model: e.target.value })}
              className="w-full rounded-xl glass px-4 py-2.5 font-mono text-sm outline-none ring-1 ring-transparent transition focus:ring-primary/40"
            />
            <datalist id="model-list">
              {MODELS.map((m) => (
                <option key={m} value={m} />
              ))}
            </datalist>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {MODELS.map((m) => (
              <button
                key={m}
                onClick={() => setDraft({ ...draft, model: m })}
                className={`rounded-full border px-2.5 py-1 text-[11px] font-mono transition ${
                  draft.model === m
                    ? "border-primary/60 bg-primary/10 text-foreground"
                    : "border-border/60 text-muted-foreground hover:text-foreground"
                }`}
              >
                {m.split("/").pop()}
              </button>
            ))}
          </div>
        </Field>

        <Field label="API Base URL" hint="默认即可，除非你使用代理">
          <input
            value={draft.baseUrl}
            onChange={(e) => setDraft({ ...draft, baseUrl: e.target.value })}
            className="w-full rounded-xl glass px-4 py-2.5 font-mono text-sm outline-none ring-1 ring-transparent transition focus:ring-primary/40"
          />
        </Field>

        <div className="flex items-center justify-end gap-3 pt-4">
          {saved && (
            <span className="inline-flex items-center gap-1.5 text-sm text-emerald-400">
              <Check className="h-4 w-4" /> 已保存
            </span>
          )}
          <button
            onClick={save}
            className="rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition hover:brightness-110"
            style={{ boxShadow: "0 14px 36px -14px oklch(0.78 0.16 75 / 0.7)" }}
          >
            保存设置
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
    <div>
      <div className="mb-1.5 flex items-baseline justify-between">
        <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</span>
        {hint && <span className="text-[11px] text-muted-foreground/70">{hint}</span>}
      </div>
      {children}
    </div>
  );
}
