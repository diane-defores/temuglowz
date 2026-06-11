import { computed, reactive, readonly } from "vue";

export type PostAuthSyncStage =
  | "idle"
  | "waitingServer"
  | "dataReceived"
  | "dataApplied"
  | "ready";

type PostAuthSyncMode = "blocking" | "success";

const READY_NOTICE_MS = 3000;
const MIN_STAGE_MS = 650;

const state = reactive<{
  visible: boolean;
  mode: PostAuthSyncMode;
  stage: PostAuthSyncStage;
}>({
  visible: false,
  mode: "blocking",
  stage: "idle",
});

let stageStartedAt = 0;
let readyTimer: number | null = null;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function clearReadyTimer(): void {
  if (readyTimer !== null) {
    window.clearTimeout(readyTimer);
    readyTimer = null;
  }
}

function setStage(stage: PostAuthSyncStage, mode: PostAuthSyncMode): void {
  state.visible = true;
  state.mode = mode;
  state.stage = stage;
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
  stage: Exclude<PostAuthSyncStage, "idle" | "ready">,
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
  readyTimer = window.setTimeout(() => {
    resetPostAuthSyncFeedback();
  }, READY_NOTICE_MS);
}

export function resetPostAuthSyncFeedback(): void {
  clearReadyTimer();
  state.visible = false;
  state.mode = "blocking";
  state.stage = "idle";
  stageStartedAt = 0;
}
