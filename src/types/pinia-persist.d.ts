import "pinia-plugin-persistedstate";

declare module "pinia" {
  export interface DefineStoreOptionsBase {
    persist?: boolean | PersistedStateOptions;
  }
}
