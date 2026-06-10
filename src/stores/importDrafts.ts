import { defineStore } from "pinia";

import { createId } from "@/utils/id";
import { parseSharedImportText } from "@/lib/importParser";
import type { ImportDraft, ImportDraftSource } from "@/types/domain";

interface ImportDraftState {
  draft: ImportDraft | null;
}

function now(): number {
  return Date.now();
}

export const useImportDraftsStore = defineStore("importDrafts", {
  state: (): ImportDraftState => ({
    draft: null,
  }),

  getters: {
    hasDraft: (state): boolean => state.draft !== null,
  },

  actions: {
    useSharedText(rawText: string): ImportDraft {
      const parsed = parseSharedImportText(rawText);
      if (!parsed) {
        throw new Error("no valid Temu product URL found");
      }

      const draft = this.createDraftFromParsed("intent", parsed.rawText, parsed);
      this.draft = draft;
      return draft;
    },

    useManualUrl(rawUrl: string): ImportDraft {
      const parsed = parseSharedImportText(rawUrl);
      if (!parsed) {
        throw new Error("invalid Temu URL");
      }

      const draft = this.createDraftFromParsed("manual", rawUrl, parsed);
      this.draft = draft;
      return draft;
    },

    useWebviewUrl(rawUrl: string): ImportDraft {
      const parsed = parseSharedImportText(rawUrl);
      if (!parsed) {
        throw new Error("invalid Temu product URL from WebView");
      }

      const draft = this.createDraftFromParsed("webview", rawUrl, parsed);
      this.draft = draft;
      return draft;
    },

    useClipboardText(rawText: string): ImportDraft {
      return this.useSharedText(rawText);
    },

    createDraftFromParsed(
      source: ImportDraftSource,
      rawText: string,
      parsed: {
        rawText: string;
        rawUrl: string;
        canonicalUrl: string;
        normalizedTitle: string;
        status: "ok" | "needs_review";
      },
    ): ImportDraft {
      return {
        id: createId("draft"),
        source,
        rawText,
        candidateUrl: parsed.rawUrl,
        canonicalUrl: parsed.canonicalUrl,
        parsedTitle: parsed.normalizedTitle,
        parsedPrice: undefined,
        status: parsed.status === "needs_review" ? "manual_required" : "ok",
        createdAt: now(),
        updatedAt: now(),
      };
    },

    clearDraft(): void {
      this.draft = null;
    },

    applyTitle(draftId: string, title: string): void {
      if (!this.draft || this.draft.id !== draftId) {
        return;
      }

      this.draft.parsedTitle = title.trim();
      this.draft.updatedAt = now();
    },

    updateDraftStatus(draftId: string, status: ImportDraft["status"]): void {
      if (!this.draft || this.draft.id !== draftId) {
        return;
      }

      this.draft.status = status;
      this.draft.updatedAt = now();
    },
  },

  persist: {
    key: "temu:import-drafts",
  },
});
