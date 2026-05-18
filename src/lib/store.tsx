import { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  type AppState,
  type Character,
  type Group,
  type Message,
  type Settings,
  loadState,
  saveState,
  randomTint,
} from "./storage";

interface StoreCtx {
  state: AppState;
  setSettings: (s: Partial<Settings>) => void;
  addCharacter: (c: Omit<Character, "id" | "createdAt"> & { id?: string }) => Character;
  updateCharacter: (id: string, patch: Partial<Character>) => void;
  removeCharacter: (id: string) => void;
  addGroup: (g: Omit<Group, "id" | "createdAt">) => Group;
  updateGroup: (id: string, patch: Partial<Group>) => void;
  removeGroup: (id: string) => void;
  getMessages: (chatKey: string) => Message[];
  appendMessage: (chatKey: string, m: Message) => void;
  updateLastMessage: (chatKey: string, patch: Partial<Message>) => void;
  clearChat: (chatKey: string) => void;
  newTint: () => string;
}

const Ctx = createContext<StoreCtx | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(() => loadState());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(loadState());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveState(state);
  }, [state, hydrated]);

  const setSettings = useCallback((s: Partial<Settings>) => {
    setState((prev) => ({ ...prev, settings: { ...prev.settings, ...s } }));
  }, []);

  const addCharacter: StoreCtx["addCharacter"] = useCallback((c) => {
    const created: Character = {
      id: c.id ?? crypto.randomUUID(),
      createdAt: Date.now(),
      name: c.name,
      emoji: c.emoji,
      systemPrompt: c.systemPrompt,
      color: c.color,
    };
    setState((p) => ({ ...p, characters: [...p.characters, created] }));
    return created;
  }, []);

  const updateCharacter: StoreCtx["updateCharacter"] = useCallback((id, patch) => {
    setState((p) => ({
      ...p,
      characters: p.characters.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    }));
  }, []);

  const removeCharacter: StoreCtx["removeCharacter"] = useCallback((id) => {
    setState((p) => {
      const chats = { ...p.chats };
      delete chats[`char:${id}`];
      return {
        ...p,
        characters: p.characters.filter((c) => c.id !== id),
        groups: p.groups.map((g) => ({ ...g, memberIds: g.memberIds.filter((m) => m !== id) })),
        chats,
      };
    });
  }, []);

  const addGroup: StoreCtx["addGroup"] = useCallback((g) => {
    const created: Group = { ...g, id: crypto.randomUUID(), createdAt: Date.now() };
    setState((p) => ({ ...p, groups: [...p.groups, created] }));
    return created;
  }, []);

  const updateGroup: StoreCtx["updateGroup"] = useCallback((id, patch) => {
    setState((p) => ({
      ...p,
      groups: p.groups.map((g) => (g.id === id ? { ...g, ...patch } : g)),
    }));
  }, []);

  const removeGroup: StoreCtx["removeGroup"] = useCallback((id) => {
    setState((p) => {
      const chats = { ...p.chats };
      delete chats[`group:${id}`];
      return { ...p, groups: p.groups.filter((g) => g.id !== id), chats };
    });
  }, []);

  const getMessages = useCallback(
    (k: string) => state.chats[k] ?? [],
    [state.chats],
  );

  const appendMessage: StoreCtx["appendMessage"] = useCallback((k, m) => {
    setState((p) => ({ ...p, chats: { ...p.chats, [k]: [...(p.chats[k] ?? []), m] } }));
  }, []);

  const updateLastMessage: StoreCtx["updateLastMessage"] = useCallback((k, patch) => {
    setState((p) => {
      const arr = p.chats[k] ?? [];
      if (arr.length === 0) return p;
      const last = { ...arr[arr.length - 1], ...patch };
      return { ...p, chats: { ...p.chats, [k]: [...arr.slice(0, -1), last] } };
    });
  }, []);

  const clearChat: StoreCtx["clearChat"] = useCallback((k) => {
    setState((p) => ({ ...p, chats: { ...p.chats, [k]: [] } }));
  }, []);

  return (
    <Ctx.Provider
      value={{
        state,
        setSettings,
        addCharacter,
        updateCharacter,
        removeCharacter,
        addGroup,
        updateGroup,
        removeGroup,
        getMessages,
        appendMessage,
        updateLastMessage,
        clearChat,
        newTint: randomTint,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useStore() {
  const v = useContext(Ctx);
  if (!v) throw new Error("StoreProvider missing");
  return v;
}
