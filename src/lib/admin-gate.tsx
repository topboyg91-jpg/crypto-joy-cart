import { useEffect, useState } from "react";

/**
 * Shared-password gate for /admin. The site is a static export (no server), so
 * the check happens in the browser against a SHA-256 hash. Change the password
 * by setting VITE_ADMIN_PASSWORD_HASH to the sha256 hex of your new password.
 */
const PASSWORD_HASH =
  (import.meta.env.VITE_ADMIN_PASSWORD_HASH as string | undefined) ??
  "1ebcc9d772d402ac17cd42abe57f0676dbedc8f17c0df34f4bb349019e68abc7"; // "gramory-admin"

const KEY = "gramory:admin-unlocked";

async function sha256(value: string) {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function isAdminUnlocked() {
  if (typeof sessionStorage === "undefined") return false;
  return sessionStorage.getItem(KEY) === PASSWORD_HASH;
}

export function lockAdmin() {
  sessionStorage.removeItem(KEY);
}

export function AdminGate({ children }: { children: React.ReactNode }) {
  const [unlocked, setUnlocked] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    setUnlocked(isAdminUnlocked());
    setReady(true);
  }, []);

  if (!ready) return null;
  if (unlocked) return <>{children}</>;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const value = String(new FormData(e.currentTarget).get("password") ?? "");
    const hash = await sha256(value);
    if (hash === PASSWORD_HASH) {
      sessionStorage.setItem(KEY, hash);
      setUnlocked(true);
    } else {
      setError(true);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <form onSubmit={onSubmit} className="w-full max-w-sm bg-card border border-border rounded p-6 space-y-3">
        <h1 className="text-xl font-semibold text-primary">Store admin</h1>
        <p className="text-sm text-muted-foreground">Enter the admin password to continue.</p>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          autoFocus
          className="w-full px-3 py-2 rounded border border-border bg-background"
        />
        {error && <p className="text-sm text-destructive">Incorrect password.</p>}
        <button type="submit" className="w-full px-3 py-2 rounded bg-primary text-primary-foreground">
          Unlock
        </button>
      </form>
    </main>
  );
}