const ANON_KEY = "speak_anonymous_user_id";

export function getOrCreateAnonymousUserId(): string {
  if (typeof window === "undefined") return "";
  const existing = localStorage.getItem(ANON_KEY);
  if (existing) return existing;
  const id = crypto.randomUUID();
  localStorage.setItem(ANON_KEY, id);
  return id;
}

export function getAnonymousUserId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ANON_KEY);
}
