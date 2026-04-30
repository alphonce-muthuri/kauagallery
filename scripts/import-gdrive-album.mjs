/**
 * Import all images from a public Google Drive folder into Sanity as an album.
 *
 * Prerequisites:
 *  1. Enable the Google Drive API in Google Cloud Console.
 *  2. Create an API key (no OAuth needed for public folders).
 *  3. Add to .env.local:
 *       GOOGLE_API_KEY=your_key_here
 *       SANITY_API_TOKEN=your_editor_token_here
 *
 * Usage:
 *   node scripts/import-gdrive-album.mjs <folder-url> <album-title> [description]
 *
 * Example:
 *   node scripts/import-gdrive-album.mjs \
 *     "https://drive.google.com/drive/folders/1ge_jvRngeGVA48DFdXhCWxx6iO3Om2i-" \
 *     "Summer 2024" \
 *     "Family trip photos"
 */

import { createClient } from "@sanity/client";
import { readFileSync } from "fs";
import { join } from "path";

// ---------------------------------------------------------------------------
// Load .env.local (Next.js doesn't run here so we do it manually)
// ---------------------------------------------------------------------------
function loadEnvFile(filePath) {
  try {
    const lines = readFileSync(filePath, "utf-8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx < 1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
      if (key && !(key in process.env)) process.env[key] = val;
    }
  } catch {
    // file not found — skip
  }
}

function loadEnv() {
  const cwd = process.cwd();
  loadEnvFile(join(cwd, ".env"));
  loadEnvFile(join(cwd, ".env.local")); // .env.local overrides .env
}
loadEnv();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function extractFolderId(url) {
  const m = url.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  if (!m) throw new Error("Cannot parse folder ID from URL. Expected: .../folders/FOLDER_ID");
  return m[1];
}

function driveDirectUrl(fileId) {
  return `https://drive.google.com/uc?export=view&id=${fileId}`;
}

function toSlug(text) {
  return text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

async function listImages(folderId, apiKey) {
  const all = [];
  let pageToken = undefined;

  do {
    const params = new URLSearchParams({
      q: `'${folderId}' in parents and mimeType contains 'image/' and trashed = false`,
      fields: "nextPageToken,files(id,name,createdTime)",
      orderBy: "createdTime",
      pageSize: "1000",
      key: apiKey,
      ...(pageToken ? { pageToken } : {}),
    });

    const res = await fetch(`https://www.googleapis.com/drive/v3/files?${params}`);
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Google Drive API error (${res.status}): ${body}`);
    }
    const data = await res.json();
    all.push(...(data.files ?? []));
    pageToken = data.nextPageToken;
  } while (pageToken);

  return all;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  const [folderUrl, albumTitle, albumDescription = ""] = process.argv.slice(2);

  if (!folderUrl || !albumTitle) {
    console.error("Usage: node scripts/import-gdrive-album.mjs <folder-url> <album-title> [description]");
    process.exit(1);
  }

  const apiKey = process.env.GOOGLE_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
  const sanityToken = process.env.SANITY_API_TOKEN || process.env.SANITY_API_WRITE_TOKEN;
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

  if (!apiKey) {
    console.error("Missing GOOGLE_API_KEY or NEXT_PUBLIC_GOOGLE_API_KEY in .env");
    console.error("  → https://console.cloud.google.com → APIs & Services → Credentials");
    console.error("  → Also enable: Google Drive API");
    process.exit(1);
  }
  if (!sanityToken) {
    console.error("Missing SANITY_API_TOKEN or SANITY_API_WRITE_TOKEN in .env");
    console.error("  → https://sanity.io/manage → your project → API → Tokens (Editor role)");
    process.exit(1);
  }
  if (!projectId) {
    console.error("Missing NEXT_PUBLIC_SANITY_PROJECT_ID in .env.local");
    process.exit(1);
  }

  const client = createClient({
    projectId,
    dataset,
    token: sanityToken,
    apiVersion: "2024-01-01",
    useCdn: false,
  });

  const folderId = extractFolderId(folderUrl);
  console.log(`\nFetching images from folder: ${folderId} …`);

  const files = await listImages(folderId, apiKey);
  if (!files.length) {
    console.error("No images found. Make sure the folder is shared publicly (Anyone with the link → Viewer).");
    process.exit(1);
  }
  console.log(`Found ${files.length} image(s)`);

  // Create album
  const slug = toSlug(albumTitle);
  console.log(`\nCreating album "${albumTitle}" (slug: ${slug}) …`);
  const album = await client.create({
    _type: "album",
    title: albumTitle,
    ...(albumDescription ? { description: albumDescription } : {}),
    slug: { current: slug },
  });
  console.log(`Album created → ${album._id}`);

  // Create one photo document per image
  console.log("\nImporting photos…");
  let count = 0;
  for (const file of files) {
    const title = file.name.replace(/\.[^/.]+$/, ""); // strip extension
    await client.create({
      _type: "photo",
      title,
      externalImageUrl: driveDirectUrl(file.id),
      album: { _type: "reference", _ref: album._id },
      ...(file.createdTime ? { takenAt: file.createdTime } : {}),
    });
    console.log(`  [${++count}/${files.length}] ${title}`);
  }

  console.log(`\n✓ Done! ${files.length} photos imported into album "${albumTitle}".`);
  console.log(`  View at: /albums/${slug}`);
}

main().catch((err) => {
  console.error("\nFailed:", err.message);
  process.exit(1);
});
