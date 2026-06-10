import type { ImportDraftSource } from "@/types/domain";

let cachedPayload: string | null = null;

export interface ShareBridgePayload {
  source: ImportDraftSource;
  text: string;
}

export async function consumeSharedDraftFromWebQuery(): Promise<ShareBridgePayload | null> {
  if (typeof window === "undefined") {
    return null;
  }

  const searchParams = new URLSearchParams(window.location.search);
  const importText = searchParams.get("import");
  if (!importText) {
    return null;
  }

  return {
    source: "manual",
    text: decodeURIComponent(importText),
  };
}

export async function consumeShareFromTauriPlugin(): Promise<ShareBridgePayload | null> {
  try {
    const module = await import("@tauri-apps/api/core");
    const { invoke } = module;
    const pending = await invoke<string | null>("consume_pending_share");
    if (!pending) {
      return null;
    }

    return {
      source: "clipboard",
      text: pending,
    };
  } catch {
    return null;
  }
}

export async function consumeShareDraft(): Promise<ShareBridgePayload | null> {
  if (cachedPayload) {
    const payload = cachedPayload;
    cachedPayload = null;
    return { source: "intent", text: payload };
  }

  const fromWeb = await consumeSharedDraftFromWebQuery();
  if (fromWeb) {
    return fromWeb;
  }

  return consumeShareFromTauriPlugin();
}

export function saveSharePayloadForDebug(text: string): void {
  cachedPayload = text;
}
