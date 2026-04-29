import { getSanityClient } from "@/sanity/client";
import {
  albumBySlugQuery,
  albumsQuery,
  familyMembersQuery,
  photosQuery,
  type Album,
  type FamilyMember,
  type Photo,
} from "@/sanity/queries";

export async function getPhotos(): Promise<Photo[]> {
  const client = getSanityClient();
  if (!client) return [];
  try {
    const photos = await client.fetch<Photo[]>(photosQuery);
    return photos ?? [];
  } catch {
    return [];
  }
}

export async function getAlbums(): Promise<Album[]> {
  const client = getSanityClient();
  if (!client) return [];
  try {
    const albums = await client.fetch<Album[]>(albumsQuery);
    return albums ?? [];
  } catch {
    return [];
  }
}

export async function getAlbumBySlug(slug: string): Promise<Album | null> {
  const client = getSanityClient();
  if (!client) return null;
  try {
    const album = await client.fetch<Album | null>(albumBySlugQuery, { slug });
    return album;
  } catch {
    return null;
  }
}

export async function getFamilyMembers(): Promise<FamilyMember[]> {
  const client = getSanityClient();
  if (!client) return [];
  try {
    const members = await client.fetch<FamilyMember[]>(familyMembersQuery);
    return members ?? [];
  } catch {
    return [];
  }
}
