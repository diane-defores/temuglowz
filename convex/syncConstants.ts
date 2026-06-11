export const TEMU_SHOPPING_LISTS_PRODUCT_ID = "temu_shopping_lists" as const;

export const SYNC_ENVIRONMENTS = [
  "local",
  "preview",
  "staging",
  "production",
] as const;

export const SYNC_DOMAINS = [
  "shopping_list",
  "shopping_list_item",
  "product_snapshot",
  "product_observation",
] as const;
