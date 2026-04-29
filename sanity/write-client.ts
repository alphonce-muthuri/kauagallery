import "server-only";

import { createClient, type SanityClient } from "next-sanity";

import { apiVersion, dataset, projectId } from "./env";

let _client: SanityClient | null = null;

/**
 * Server-only Sanity client with write permissions.
 * Requires SANITY_API_WRITE_TOKEN (Editor or Write role) from Sanity Manage.
 * Returns `null` when the token or project config is missing so callers can
 * fail gracefully with a clear error.
 */
export function getSanityWriteClient(): SanityClient | null {
  const token = process.env.SANITY_API_WRITE_TOKEN;
  if (!token || !projectId || !dataset) return null;
  if (_client) return _client;

  _client = createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: false,
    token,
    perspective: "published",
  });

  return _client;
}
