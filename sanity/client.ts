import { createClient, type SanityClient } from "next-sanity";
import imageUrlBuilder from "@sanity/image-url";

import {
  apiVersion,
  dataset,
  hasSanityCredentials,
  projectId,
  useCdn,
} from "./env";

type SanityImageSource = Parameters<
  ReturnType<typeof imageUrlBuilder>["image"]
>[0];

let _client: SanityClient | null = null;

export function getSanityClient(): SanityClient | null {
  if (!hasSanityCredentials) return null;
  if (_client) return _client;
  _client = createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn,
    perspective: "published",
  });
  return _client;
}

export function urlFor(source: SanityImageSource) {
  if (!hasSanityCredentials) return { url: () => "" };
  const builder = imageUrlBuilder({ projectId, dataset });
  return builder.image(source);
}
