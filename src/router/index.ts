import type { RouteRecordRaw } from "vue-router";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "shopping-shell",
    component: () => import("@/ui/temu-shell/App.vue"),
  },
  {
    path: "/lists",
    name: "lists",
    component: () => import("@/pages/ListsPage.vue"),
  },
  {
    path: "/list/:listId",
    name: "list-detail",
    component: () => import("@/pages/ListDetailPage.vue"),
    props: true,
  },
  {
    path: "/import/manual",
    name: "manual-import",
    component: () => import("@/pages/ManualImportPage.vue"),
  },
  {
    path: "/shopping",
    redirect: { name: "shopping-shell" },
  },
  {
    path: "/import/review",
    name: "import-review",
    component: () => import("@/pages/ImportReviewPage.vue"),
  },
  {
    path: "/sync",
    name: "sync",
    component: () => import("@/pages/SyncPage.vue"),
  },
  {
    path: "/product/:snapshotId",
    name: "product-detail",
    component: () => import("@/pages/ProductDetailPage.vue"),
    props: true,
  },
];

export default routes;
