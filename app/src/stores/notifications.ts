import { defineStore } from "pinia";

import { createId } from "@/utils/id";

export type NotificationKind = "info" | "success" | "warning" | "error";

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  message: string;
  persistent: boolean;
  durationMs: number;
}

interface NotificationState {
  items: AppNotification[];
}

const DEFAULT_DURATION_MS = 3200;
const ERROR_DURATION_MS = 4200;
const MAX_NOTIFICATIONS = 4;

export const useNotificationsStore = defineStore("notifications", {
  state: (): NotificationState => ({
    items: [],
  }),

  actions: {
    publish(params: {
      kind?: NotificationKind;
      message: string;
      persistent?: boolean;
      durationMs?: number;
    }): string {
      const message = params.message.trim();
      if (!message) {
        return "";
      }

      const kind = params.kind ?? "info";
      const item: AppNotification = {
        id: createId("notif"),
        kind,
        message,
        persistent: Boolean(params.persistent),
        durationMs: params.durationMs
          ?? (kind === "error" ? ERROR_DURATION_MS : DEFAULT_DURATION_MS),
      };

      this.items.push(item);
      if (this.items.length > MAX_NOTIFICATIONS) {
        this.items.shift();
      }

      return item.id;
    },

    info(message: string, options: Partial<Pick<AppNotification, "persistent" | "durationMs">> = {}): string {
      return this.publish({ kind: "info", message, ...options });
    },

    success(message: string, options: Partial<Pick<AppNotification, "persistent" | "durationMs">> = {}): string {
      return this.publish({ kind: "success", message, ...options });
    },

    warning(message: string, options: Partial<Pick<AppNotification, "persistent" | "durationMs">> = {}): string {
      return this.publish({ kind: "warning", message, ...options });
    },

    error(message: string, options: Partial<Pick<AppNotification, "persistent" | "durationMs">> = {}): string {
      return this.publish({ kind: "error", message, ...options });
    },

    dismiss(id: string): void {
      this.items = this.items.filter((item) => item.id !== id);
    },

    clear(): void {
      this.items = [];
    },
  },
});
