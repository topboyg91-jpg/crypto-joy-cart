import { useEffect, useState } from "react";
import { productGradient } from "@/lib/store";
import { supabase } from "@/integrations/supabase/client";

const STORAGE_BUCKET = "product-images";
const LEGACY_PREFIX = "/api/public/product-image/";
const SIGNED_TTL = 60 * 60 * 24 * 7; // one week
const CACHE_KEY = "gramory:img-urls";

/** `storage:<path>` (or the legacy API path) → a path inside the images bucket. */
export function storagePath(raw: string | null | undefined): string | null {
  const url = (raw ?? "").trim();
  if (!url) return null;
  if (url.startsWith("storage:")) return decodeURIComponent(url.slice("storage:".length));
  if (url.startsWith(LEGACY_PREFIX)) return decodeURIComponent(url.slice(LEGACY_PREFIX.length));
  return null;
}

/**
 * Signed-URL cache. The browser can then fetch, cache and decode images itself
 * (in parallel, straight from the CDN) instead of us downloading blobs in JS.
 * URLs survive reloads via sessionStorage, so repeat views are instant.
 */
type CacheEntry = { url: string; expires: number };
const urlCache = new Map<string, CacheEntry>();
const waiters = new Map<string, ((url: string | null) => void)[]>();
let queue: string[] = [];
let flushing = false;

function readPersisted() {
  if (typeof sessionStorage === "undefined" || urlCache.size) return;
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return;
    for (const [path, entry] of Object.entries(JSON.parse(raw) as Record<string, CacheEntry>)) {
      if (entry?.expires > Date.now()) urlCache.set(path, entry);
    }
  } catch {
    /* ignore corrupt cache */
  }
}

function persist() {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(Object.fromEntries(urlCache)));
  } catch {
    /* quota or private mode — cache stays in memory only */
  }
}

function cachedUrl(path: string): string | null {
  readPersisted();
  const hit = urlCache.get(path);
  return hit && hit.expires > Date.now() ? hit.url : null;
}

async function flushQueue() {
  flushing = false;
  const paths = [...new Set(queue)];
  queue = [];
  if (paths.length === 0) return;

  // One round-trip for every image on the page instead of one per image.
  const { data } = await supabase.storage.from(STORAGE_BUCKET).createSignedUrls(paths, SIGNED_TTL);
  const expires = Date.now() + (SIGNED_TTL - 300) * 1000;
  const resolved = new Map<string, string>();
  for (const row of data ?? []) {
    if (row.signedUrl && row.path) resolved.set(row.path, row.signedUrl);
  }
  for (const path of paths) {
    const url = resolved.get(path) ?? null;
    if (url) urlCache.set(path, { url, expires });
    waiters.get(path)?.forEach((fn) => fn(url));
    waiters.delete(path);
  }
  persist();
}

function signedUrl(path: string): Promise<string | null> {
  const hit = cachedUrl(path);
  if (hit) return Promise.resolve(hit);
  return new Promise((resolve) => {
    const list = waiters.get(path) ?? [];
    list.push(resolve);
    waiters.set(path, list);
    queue.push(path);
    if (!flushing) {
      flushing = true;
      queueMicrotask(() => void flushQueue());
    }
  });
}

/**
 * Turns a pasted share link into something an <img> can actually load.
 * Hosts like ibb.co, imgur or Google Drive hand out page links, not files.
 */
export function resolveImageUrl(raw: string | null | undefined): string | null {
  const url = (raw ?? "").trim();
  if (!url) return null;
  if (storagePath(url)) return null; // resolved asynchronously by <ProductImage />
  if (url.startsWith("/") || url.startsWith("data:")) return url;

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  const host = parsed.hostname.replace(/^www\./, "");
  const id = parsed.pathname.split("/").filter(Boolean).pop() ?? "";
  const hasExt = /\.(png|jpe?g|gif|webp|avif|svg)$/i.test(parsed.pathname);

  if (host === "ibb.co" && id && !hasExt) return `https://i.ibb.co/${id}.jpg`;
  if (host === "imgur.com" && id && !hasExt) return `https://i.imgur.com/${id}.jpg`;
  if (host === "drive.google.com") {
    const fileId = parsed.pathname.match(/\/d\/([^/]+)/)?.[1] ?? parsed.searchParams.get("id");
    if (fileId) return `https://drive.google.com/uc?export=view&id=${fileId}`;
  }
  if (host === "dropbox.com") {
    parsed.searchParams.set("raw", "1");
    parsed.searchParams.delete("dl");
    return parsed.toString();
  }
  if (host === "github.com" && parsed.pathname.includes("/blob/")) {
    return `https://raw.githubusercontent.com${parsed.pathname.replace("/blob/", "/")}`;
  }
  return parsed.toString();
}

/** Product image with a gradient fallback when there is no image, or it fails to load. */
export function ProductImage({
  src,
  name,
  className = "",
  priority = false,
}: {
  src: string | null | undefined;
  name: string;
  className?: string;
  /** Set on above-the-fold images so the browser fetches them immediately. */
  priority?: boolean;
}) {
  const path = storagePath(src);
  const direct = resolveImageUrl(src);
  const [failed, setFailed] = useState(false);
  const [remoteUrl, setRemoteUrl] = useState<string | null>(() => (path ? cachedUrl(path) : null));

  useEffect(() => {
    if (!path || cachedUrl(path)) return;
    let active = true;
    void signedUrl(path).then((url) => {
      if (!active) return;
      if (url) setRemoteUrl(url);
      else setFailed(true);
    });
    return () => {
      active = false;
    };
  }, [path]);

  const resolved = path ? (remoteUrl ?? cachedUrl(path)) : direct;

  if (!resolved || failed) {
    return <span className={className} style={{ background: productGradient(name) }} aria-hidden="true" />;
  }

  return (
    <img
      src={resolved}
      alt={name}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={priority ? "high" : "auto"}
      onError={() => setFailed(true)}
      className={`${className} object-cover`}
    />
  );
}