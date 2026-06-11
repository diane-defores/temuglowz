import { beforeEach, describe, expect, it } from "vitest";
import { createPinia, setActivePinia } from "pinia";

import { useNotificationsStore } from "@/stores/notifications";

describe("notifications store", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("publishes and dismisses typed notifications", () => {
    const store = useNotificationsStore();

    const id = store.success("Produit enregistre.");

    expect(store.items).toHaveLength(1);
    expect(store.items[0]).toMatchObject({
      id,
      kind: "success",
      message: "Produit enregistre.",
      persistent: false,
    });

    store.dismiss(id);
    expect(store.items).toHaveLength(0);
  });

  it("caps the number of visible notifications", () => {
    const store = useNotificationsStore();

    for (let index = 0; index < 6; index += 1) {
      store.info(`Message ${index + 1}`);
    }

    expect(store.items).toHaveLength(4);
    expect(store.items[0]?.message).toBe("Message 3");
    expect(store.items.at(-1)?.message).toBe("Message 6");
  });
});
