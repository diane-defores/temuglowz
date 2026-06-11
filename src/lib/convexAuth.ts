/**
 * Convex Auth client for Vue, adapted from SocialGlowz.
 *
 * Manages JWT + refresh token in localStorage, wires into ConvexClient.setAuth()
 * for automatic token refresh, and exposes signIn / signOut helpers.
 */
import { ConvexClient, ConvexHttpClient } from "convex/browser";
import { ref } from "vue";

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
 * Restores a previous session from localStorage and does not auto-create
 * anonymous sessions when no token exists.
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
  purgeLegacyTokenKeys();

  const jwtK = storageKey(JWT_KEY, namespace);
  const refreshK = storageKey(REFRESH_TOKEN_KEY, namespace);

  client.setAuth(
    async ({ forceRefreshToken }) => {
      if (forceRefreshToken) {
        const refreshToken = localStorage.getItem(refreshK);
        if (!refreshToken) {
          clearTokens();
          return null;
        }

        try {
          const httpClient = new ConvexHttpClient(convexUrl);
          const result = (await httpClient.action(AUTH_SIGN_IN, {
            refreshToken,
          })) as AuthResult | null;
          if (result?.tokens) {
            persistTokens(result.tokens);
            return result.tokens.token;
          }
        } catch {
          // Refresh failed: clear local auth state and let the app continue local-first.
        }

        clearTokens();
        return null;
      }

      return currentToken;
    },
    (authenticated) => {
      isAuthenticated.value = authenticated;
    },
  );

  const storedToken = localStorage.getItem(jwtK);
  const storedRefreshToken = localStorage.getItem(refreshK);
  if (storedToken && storedRefreshToken) {
    currentToken = storedToken;
    isAuthenticated.value = true;
    isAuthLoading.value = false;
    return;
  }

  clearTokens();
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
    persistTokens(result.tokens);
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

  clearTokens();
}

function persistTokens(tokens: AuthTokens): void {
  currentToken = tokens.token;
  localStorage.setItem(storageKey(JWT_KEY, namespace), tokens.token);
  localStorage.setItem(storageKey(REFRESH_TOKEN_KEY, namespace), tokens.refreshToken);
  isAuthenticated.value = true;
}

function clearTokens(): void {
  currentToken = null;
  if (canUseStorage()) {
    localStorage.removeItem(storageKey(JWT_KEY, namespace));
    localStorage.removeItem(storageKey(REFRESH_TOKEN_KEY, namespace));
  }
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
