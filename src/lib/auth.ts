const CLIENT_ID = (import.meta.env.VITE_CUSTOMER_AUTH_CLIENT_ID as string) || "";
const AUTH_URL = ((import.meta.env.VITE_CUSTOMER_AUTH_AUTH_URL as string) || "").replace(/[`'"]/g, "");
const TOKEN_URL = ((import.meta.env.VITE_CUSTOMER_AUTH_TOKEN_URL as string) || "").replace(/[`'"]/g, "");
const LOGOUT_URL = ((import.meta.env.VITE_CUSTOMER_AUTH_LOGOUT_URL as string) || "").replace(/[`'"]/g, "");
const REDIRECT_URI = `${typeof window !== "undefined" ? window.location.origin : "http://localhost:8080"}/auth/callback`;
const SCOPES =
  (import.meta.env.VITE_CUSTOMER_AUTH_SCOPES as string || "openid email customer-account-api:full")
    .replace(/[`'"]/g, "")
    .replace(/\(.*\)/g, "")
    .trim() || "openid email customer-account-api:full";

function base64url(input: ArrayBuffer) {
  const bytes = new Uint8Array(input);
  let str = "";
  for (let i = 0; i < bytes.byteLength; i++) str += String.fromCharCode(bytes[i]);
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function generateVerifier(length = 64) {
  const arr = new Uint8Array(length);
  crypto.getRandomValues(arr);
  return base64url(arr.buffer);
}

export async function generateChallenge(verifier: string) {
  const data = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return base64url(digest);
}

export function startLogin() {
  const verifier = generateVerifier();
  sessionStorage.setItem("pkce_verifier", verifier);
  generateChallenge(verifier).then((challenge) => {
    const url = new URL(AUTH_URL);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("client_id", CLIENT_ID);
    url.searchParams.set("redirect_uri", REDIRECT_URI);
    url.searchParams.set("scope", SCOPES);
    url.searchParams.set("code_challenge", challenge);
    url.searchParams.set("code_challenge_method", "S256");
    window.location.assign(url.toString());
  });
}

export async function handleCallback() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");
  const verifier = sessionStorage.getItem("pkce_verifier") || "";
  if (!code || !verifier) return false;

  try {
    const body = new URLSearchParams();
    body.set("grant_type", "authorization_code");
    body.set("code", code);
    body.set("client_id", CLIENT_ID);
    body.set("redirect_uri", REDIRECT_URI);
    body.set("code_verifier", verifier);

    const res = await fetch(TOKEN_URL, {
      method: "POST",
      headers: { 
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json"
      },
      body: body.toString(),
    });

    if (!res.ok) {
      console.error("Token exchange failed:", await res.text());
      return false;
    }

    const token = await res.json();
    const now = Math.floor(Date.now() / 1000);
    const expiresAt = token.expires_in ? now + token.expires_in : now + 3600;

    // Use access_token and id_token provided by Shopify
    localStorage.setItem("customer_access_token", token.access_token || "");
    localStorage.setItem("customer_id_token", token.id_token || "");
    localStorage.setItem("customer_token_expires", String(expiresAt));
    sessionStorage.removeItem("pkce_verifier");
    return true;
  } catch (error) {
    console.error("Error during handleCallback:", error);
    return false;
  }
}

export function isAuthenticated() {
  const exp = Number(localStorage.getItem("customer_token_expires") || "0");
  const token = localStorage.getItem("customer_access_token");
  return !!token && exp > Math.floor(Date.now() / 1000);
}

export function logout(postLogoutRedirect?: string) {
  const idToken = localStorage.getItem("customer_id_token") || "";
  localStorage.removeItem("customer_access_token");
  localStorage.removeItem("customer_id_token");
  localStorage.removeItem("customer_token_expires");
  if (LOGOUT_URL) {
    const url = new URL(LOGOUT_URL);
    if (idToken) url.searchParams.set("id_token_hint", idToken);
    if (postLogoutRedirect) url.searchParams.set("post_logout_redirect_uri", postLogoutRedirect);
    window.location.assign(url.toString());
  } else {
    if (postLogoutRedirect) window.location.assign(postLogoutRedirect);
  }
}

function parseJwt(token: string) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Failed to parse JWT", e);
    return null;
  }
}

export function getIdTokenClaims(): Record<string, unknown> | null {
  const idToken = localStorage.getItem("customer_id_token");
  if (!idToken) return null;
  return parseJwt(idToken);
}
