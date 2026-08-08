/**
 * Downloads every product image out of the storage bucket at build time and
 * writes it into public/product-images/, plus a manifest the app imports.
 * Result: images are plain static files — no signed-URL round trip, no loading.
 */
import { readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { resolve } from "node:path";

const BUCKET = "product-images";
const OUT_DIR = resolve("public/product-images");
const MANIFEST = resolve("src/generated/image-manifest.json");

function envValue(name) {
  if (process.env[name]) return process.env[name];
  try {
    const line = readFileSync(".env", "utf8").split("\n").find((l) => l.startsWith(`${name}=`));
    return line?.slice(name.length + 1).trim().replace(/^["']|["']$/g, "");
  } catch {
    return undefined;
  }
}

const url = envValue("VITE_SUPABASE_URL");
const key = envValue("VITE_SUPABASE_PUBLISHABLE_KEY");

function storagePath(raw) {
  const v = (raw ?? "").trim();
  if (v.startsWith("storage:")) return decodeURIComponent(v.slice(8));
  if (v.startsWith("/api/public/product-image/")) return decodeURIComponent(v.slice(26));
  return null;
}

async function main() {
  mkdirSync(resolve("src/generated"), { recursive: true });
  if (!url || !key) {
    writeFileSync(MANIFEST, "{}\n");
    console.warn("[bake-images] no backend credentials — skipping");
    return;
  }

  const headers = { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" };
  const res = await fetch(`${url}/rest/v1/products?select=image_url`, { headers });
  if (!res.ok) throw new Error(`products fetch failed: ${res.status}`);
  const paths = [...new Set((await res.json()).map((r) => storagePath(r.image_url)).filter(Boolean))];

  rmSync(OUT_DIR, { recursive: true, force: true });
  mkdirSync(OUT_DIR, { recursive: true });

  const manifest = {};
  if (paths.length) {
    const signed = await fetch(`${url}/storage/v1/object/sign/${BUCKET}`, {
      method: "POST",
      headers,
      body: JSON.stringify({ expiresIn: 600, paths }),
    });
    if (!signed.ok) throw new Error(`sign failed: ${signed.status} ${await signed.text()}`);
    for (const row of await signed.json()) {
      if (!row.signedURL || row.error) continue;
      const path = row.path ?? decodeURIComponent(row.signedURL.split("?")[0].split(`/${BUCKET}/`)[1] ?? "");
      const file = await fetch(`${url}/storage/v1${row.signedURL}`);
      if (!file.ok) continue;
      const buf = Buffer.from(await file.arrayBuffer());
      const name = path.replace(/[^A-Za-z0-9._-]/g, "_");
      writeFileSync(resolve(OUT_DIR, name), buf);
      manifest[path] = `/product-images/${name}`;
    }
  }
  writeFileSync(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`[bake-images] baked ${Object.keys(manifest).length} image(s)`);
}

await main();
