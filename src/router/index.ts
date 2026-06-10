import type { RouteRecordRaw } from "vue-router";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
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
    path: "/import/review",
    name: "import-review",
    component: () => import("@/pages/ImportReviewPage.vue"),
  },
  {
    path: "/product/:snapshotId",
    name: "product-detail",
    component: () => import("@/pages/ProductDetailPage.vue"),
    props: true,
  },
];

export default routes;

