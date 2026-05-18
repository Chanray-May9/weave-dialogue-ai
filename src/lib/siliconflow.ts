import type { Message } from "./storage";

export interface ChatOptions {
  apiKey: string;
  baseUrl: string;
  model: string;
  messages: { role: "system" | "user" | "assistant"; content: string }[];
  signal?: AbortSignal;
  onToken?: (text: string) => void;
}

/**
 * Stream chat completion from SiliconFlow (OpenAI-compatible).
 */
export async function streamChat(opts: ChatOptions): Promise<string> {
  if (!opts.apiKey) throw new Error("请先在「设置」中填写硅基流动 API Key");

  const res = await fetch(`${opts.baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${opts.apiKey}`,
    },
    body: JSON.stringify({
      model: opts.model,
      messages: opts.messages,
      stream: true,
      temperature: 0.7,
    }),
    signal: opts.signal,
  });

  if (!res.ok || !res.body) {
    const text = await res.text().catch(() => "");
    throw new Error(`请求失败 (${res.status}): ${text.slice(0, 200)}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  let full = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const lines = buf.split("\n");
    buf = lines.pop() ?? "";
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith("data:")) continue;
      const payload = trimmed.slice(5).trim();
      if (payload === "[DONE]") return full;
      try {
        const json = JSON.parse(payload);
        const delta = json.choices?.[0]?.delta?.content ?? "";
        if (delta) {
          full += delta;
          opts.onToken?.(delta);
        }
      } catch {
        // ignore
      }
    }
  }
  return full;
}

export function toApiMessages(
  systemPrompt: string,
  history: Message[],
): { role: "system" | "user" | "assistant"; content: string }[] {
  const out: { role: "system" | "user" | "assistant"; content: string }[] = [];
  if (systemPrompt.trim()) out.push({ role: "system", content: systemPrompt });
  for (const m of history) {
    out.push({ role: m.role === "system" ? "system" : m.role, content: m.content });
  }
  return out;
}
