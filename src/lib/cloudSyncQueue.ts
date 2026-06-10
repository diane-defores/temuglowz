const QUEUE_KEY = "temu:cloud-sync-queue-v1";

// Local queue only. It is not proof of identity, entitlement, or cloud access.
function readQueue(): unknown[] {
  const raw = localStorage.getItem(QUEUE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed;
  } catch {
    return [];
  }
}

function writeQueue(queue: unknown[]): void {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export function enqueueCloudSyncJob(payload: unknown): void {
  const queue = readQueue();
  queue.push({
    payload,
    createdAt: Date.now(),
    attempts: 0,
  });
  writeQueue(queue);
}

export function clearCloudSyncQueue(): void {
  localStorage.removeItem(QUEUE_KEY);
}

export function hasPendingCloudSync(): boolean {
  return readQueue().length > 0;
}

export function flushCloudSyncQueue(): void {
  clearCloudSyncQueue();
}
