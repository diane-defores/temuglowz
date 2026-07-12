import { computed, reactive, readonly } from "vue";

export type PostAuthSyncStage =
  | "idle"
  | "waitingServer"
  | "dataReceived"
  | "pending"
  | "dataApplied"
  | "ready"
  | "blocked"
  | "error";

type PostAuthSyncMode = "blocking" | "success" | "blocked" | "error";

const READY_NOTICE_MS = 3000;
const MIN_STAGE_MS = 650;

const state = reactive<{
  visible: boolean;
  mode: PostAuthSyncMode;
  stage: PostAuthSyncStage;
  detail: string;
}>({
  visible: false,
  mode: "blocking",
  stage: "idle",
  detail: "",
});

let stageStartedAt = 0;
let readyTimer: ReturnType<typeof globalThis.setTimeout> | null = null;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    globalThis.setTimeout(resolve, ms);
  });
}

function clearReadyTimer(): void {
  if (readyTimer !== null) {
    globalThis.clearTimeout(readyTimer);
    readyTimer = null;
  }
}

function setStage(
  stage: PostAuthSyncStage,
  mode: PostAuthSyncMode,
  detail = "",
): void {
  state.visible = true;
  state.mode = mode;
  state.stage = stage;
  state.detail = detail;
  stageStartedAt = Date.now();
}

function canAdvanceBlockingStage(): boolean {
  return state.visible && state.mode === "blocking" && state.stage !== "idle";
}

export const postAuthSyncFeedback = readonly(state);

export const isPostAuthSyncBlocking = computed(
  () => state.visible && state.mode === "blocking",
);

export function beginPostAuthSyncFeedback(): void {
  if (canAdvanceBlockingStage()) {
    return;
  }
  clearReadyTimer();
  setStage("waitingServer", "blocking");
}

export async function advancePostAuthSyncStage(
  stage: "dataReceived" | "pending" | "dataApplied",
): Promise<void> {
  if (!canAdvanceBlockingStage() || state.stage === stage) {
    return;
  }

  const elapsed = Date.now() - stageStartedAt;
  if (elapsed < MIN_STAGE_MS) {
    await delay(MIN_STAGE_MS - elapsed);
  }

  if (!canAdvanceBlockingStage()) {
    return;
  }
  setStage(stage, "blocking");
}

export function showPostAuthReadyFeedback(): void {
  clearReadyTimer();
  setStage("ready", "success");
  readyTimer = globalThis.setTimeout(() => {
    resetPostAuthSyncFeedback();
  }, READY_NOTICE_MS);
}

export function showPostAuthBlockedFeedback(detail: string): void {
  clearReadyTimer();
  setStage("blocked", "blocked", detail);
}

export function showPostAuthErrorFeedback(detail: string): void {
  clearReadyTimer();
  setStage("error", "error", detail);
}

export function resetPostAuthSyncFeedback(): void {
  clearReadyTimer();
  state.visible = false;
  state.mode = "blocking";
  state.stage = "idle";
  state.detail = "";
  stageStartedAt = 0;
}
