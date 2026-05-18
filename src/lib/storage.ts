// localStorage-backed state. No server.
export type Role = "user" | "assistant" | "system";

export interface Message {
  id: string;
  role: Role;
  content: string;
  // For group messages, which character sent it
  characterId?: string;
  characterName?: string;
  createdAt: number;
}

export interface Character {
  id: string;
  name: string;
  emoji: string;
  systemPrompt: string;
  color: string; // hex/oklch tint
  createdAt: number;
}

export interface Group {
  id: string;
  name: string;
  systemPrompt: string;
  memberIds: string[]; // character ids
  createdAt: number;
}

export interface Settings {
  apiKey: string;
  baseUrl: string;
  model: string;
}

export interface AppState {
  settings: Settings;
  characters: Character[];
  groups: Group[];
  chats: Record<string, Message[]>; // key: char:<id> or group:<id>
}

const KEY = "siliconchat:v1";

const TINTS = [
  "#f4b860",
  "#7cc0ff",
  "#c9a0ff",
  "#9be7c4",
  "#ff9bb7",
  "#ffd166",
  "#8dd7ff",
];

const defaultState = (): AppState => {
  const id1 = crypto.randomUUID();
  const id2 = crypto.randomUUID();
  return {
    settings: {
      apiKey: "",
      baseUrl: "https://api.siliconflow.cn/v1",
      model: "Qwen/Qwen2.5-7B-Instruct",
    },
    characters: [
      {
        id: id1,
        name: "默认助手",
        emoji: "✶",
        systemPrompt: "你是一位简洁、清晰、富有洞察力的智能助手。回答请直奔主题。",
        color: TINTS[0],
        createdAt: Date.now(),
      },
      {
        id: id2,
        name: "诗意作家",
        emoji: "❦",
        systemPrompt: "你是一位富有诗意的中文作家，回答时使用优雅的意象与节奏。",
        color: TINTS[2],
        createdAt: Date.now() + 1,
      },
    ],
    groups: [],
    chats: {},
  };
};

export function loadState(): AppState {
  if (typeof window === "undefined") return defaultState();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw) as AppState;
    // gentle migrations
    return { ...defaultState(), ...parsed, settings: { ...defaultState().settings, ...parsed.settings } };
  } catch {
    return defaultState();
  }
}

export function saveState(s: AppState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(s));
}

export const randomTint = () => TINTS[Math.floor(Math.random() * TINTS.length)];
