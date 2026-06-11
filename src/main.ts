import "./styles.css";

import { createApp } from "vue";
import PrimeVue from "primevue/config";
import { createRouter, createWebHashHistory } from "vue-router";

import { pinia } from "@/utils/pinia";
import App from "@/App.vue";
import { useImportDraftsStore } from "@/stores/importDrafts";
import { useShoppingListsStore } from "@/stores/shoppingLists";
import { consumeShareDraft } from "@/lib/shareBridge";
import {
  markAuthBootstrapError,
  markConvexAuthUnavailable,
  setupConvexAuth,
} from "@/lib/convexAuth";
import { getConvexClient } from "@/lib/convex";
import routes from "@/router";

import "primeicons/primeicons.css";
import "primeflex/primeflex.css";

const app = createApp(App);

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

app.use(pinia);
app.use(PrimeVue);
app.use(router);

const shoppingStore = useShoppingListsStore(pinia);
shoppingStore.initializeDefaults();

const convexUrl = import.meta.env.VITE_CONVEX_URL;
if (convexUrl) {
  setupConvexAuth(getConvexClient(), convexUrl).catch((error: unknown) => {
    const reason = error instanceof Error ? error.message : "unknown error";
    markAuthBootstrapError(
      `Account sync is unavailable (${reason}). Local lists still work.`,
    );
  });
} else {
  markConvexAuthUnavailable(
    "Account sync is unavailable because VITE_CONVEX_URL is not set.",
  );
}

app.mount("#app");

consumeShareDraft()
  .then((payload) => {
    if (!payload) {
      return;
    }

    const draftStore = useImportDraftsStore(pinia);
    try {
      draftStore.useSharedText(payload.text);
      router.replace({ name: "import-review" }).catch(() => {
        // already in review route or navigation issue; stay on current route
      });
    } catch {
      // no-op: keep current flow
    }
  })
  .catch(() => {
    // no-op
  });
