/**
 * Convex Auth client for the TemuGlowz Vue application.
 *
 * Manages JWT + refresh token with an injectable storage abstraction and
 * wires into ConvexClient.setAuth() for automatic token refresh.
 */
import { ConvexClient, ConvexHttpClient } from "convex/browser";
import { ref } from "vue";
import { getAuthTokenStore } from "@/lib/authTokenStore";

const JWT_KEY = "__convexAuthJWT";
const REFRESH_TOKEN_KEY = "__convexAuthRefreshToken";
const LEGACY_JWT_KEYS = ["__convexAuthJWT", "sf_jwt"];
const LEGACY_REFRESH_KEYS = ["__convexAuthRefreshToken", "sf_refresh"];

function storageKey(key: string, namespace: string): string {
  return `${key}_${namespace.replace(/[^a-zA-Z0-9]/g, "")}`;
}

export const isAuthenticated = ref(false);
export const isAuthLoading = ref(true);
export const isConvexConfigured = ref(false);
export const authBootstrapError = ref<string | null>(null);

interface AuthTokens {
  token: string;
  refreshToken: string;
}

interface AuthResult {
  tokens?: AuthTokens;
}

type ConvexActionRef = Parameters<ConvexHttpClient["action"]>[0];

let clientRef: ConvexClient | null = null;
let namespace = "";
let currentToken: string | null = null;
let tokenStore: ReturnType<typeof getAuthTokenStore> | null = null;

const AUTH_SIGN_IN = "auth:signIn" as unknown as ConvexActionRef;
const AUTH_SIGN_OUT = "auth:signOut" as unknown as ConvexActionRef;

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function getHttpClient(): ConvexHttpClient {
  if (!namespace) {
    throw new Error(
      "Account sync is unavailable because this build was not configured with a Convex backend.",
    );
  }
  return new ConvexHttpClient(namespace);
}

/**
 * Call once at app startup.
 * Restores a previous session and does not auto-create anonymous sessions
 * when no token exists.
 */
export async function setupConvexAuth(
  client: ConvexClient,
  convexUrl: string,
): Promise<void> {
  clientRef = client;
  namespace = convexUrl;
  isConvexConfigured.value = true;
  authBootstrapError.value = null;
  isAuthLoading.value = true;
  const storePromise = getAuthTokenStore();
  tokenStore = storePromise;
  purgeLegacyTokenKeys();

  const jwtK = storageKey(JWT_KEY, namespace);
  const refreshK = storageKey(REFRESH_TOKEN_KEY, namespace);

  client.setAuth(
    async ({ forceRefreshToken }) => {
      const store = await storePromise;
      if (forceRefreshToken) {
        const refreshToken = await store.getItem(refreshK);
        if (!refreshToken) {
          await clearTokens();
          return null;
        }

        try {
          const httpClient = new ConvexHttpClient(convexUrl);
          const result = (await httpClient.action(AUTH_SIGN_IN, {
            refreshToken,
          })) as AuthResult | null;
          if (result?.tokens) {
            await persistTokens(result.tokens);
            return result.tokens.token;
          }
        } catch {
          // Refresh failed: clear local auth state and let the app continue local-first.
        }

        await clearTokens();
        return null;
      }

      return currentToken;
    },
    (authenticated) => {
      isAuthenticated.value = authenticated;
    },
  );

  const store = await storePromise;
  const storedToken = await store.getItem(jwtK);
  const storedRefreshToken = await store.getItem(refreshK);
  if (storedToken && storedRefreshToken) {
    currentToken = storedToken;
    isAuthenticated.value = true;
    isAuthLoading.value = false;
    return;
  }

  await clearTokens();
  isAuthLoading.value = false;
}

export async function signIn(
  provider: string,
  params?: Record<string, string>,
): Promise<AuthResult | null> {
  if (!clientRef) {
    throw new Error(
      "Account sync is unavailable because this build was not configured with a Convex backend.",
    );
  }

  const httpClient = getHttpClient();
  const result = (await httpClient.action(AUTH_SIGN_IN, {
    provider,
    params: params ?? {},
  })) as AuthResult | null;

  if (result?.tokens) {
    await persistTokens(result.tokens);
  }

  return result;
}

export async function signOut(): Promise<void> {
  if (!clientRef) {
    return;
  }

  try {
    const httpClient = getHttpClient();
    await httpClient.action(AUTH_SIGN_OUT, {});
  } catch (error) {
    console.warn("[ConvexAuth] Sign-out failed; clearing local session.", error);
  }

  await clearTokens();
}

async function persistTokens(tokens: AuthTokens): Promise<void> {
  currentToken = tokens.token;
  if (!tokenStore) {
    return;
  }

  const store = await tokenStore;
  await Promise.all([
    store.setItem(storageKey(JWT_KEY, namespace), tokens.token),
    store.setItem(storageKey(REFRESH_TOKEN_KEY, namespace), tokens.refreshToken),
  ]);
  isAuthenticated.value = true;
}

async function clearTokens(): Promise<void> {
  currentToken = null;
  if (!tokenStore) {
    isAuthenticated.value = false;
    return;
  }

  const store = await tokenStore;
  await Promise.all([
    store.removeItem(storageKey(JWT_KEY, namespace)),
    store.removeItem(storageKey(REFRESH_TOKEN_KEY, namespace)),
  ]);
  isAuthenticated.value = false;
}

function purgeLegacyTokenKeys(): void {
  if (!canUseStorage()) {
    return;
  }

  for (const key of LEGACY_JWT_KEYS) {
    localStorage.removeItem(key);
  }
  for (const key of LEGACY_REFRESH_KEYS) {
    localStorage.removeItem(key);
  }
}

export function markAuthBootstrapError(message: string): void {
  authBootstrapError.value = message;
  isAuthLoading.value = false;
}

export function markConvexAuthUnavailable(message: string): void {
  isConvexConfigured.value = false;
  authBootstrapError.value = message;
  isAuthLoading.value = false;
}
