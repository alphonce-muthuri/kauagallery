import { cacheLife, cacheTag } from "next/cache";

import { getSanityClient } from "@/sanity/client";
import {
  albumBySlugQuery,
  albumsCountQuery,
  albumsQuery,
  familyMembersQuery,
  paginatedAlbumsQuery,
  paginatedPhotosQuery,
  photosCountQuery,
  photosQuery,
  type Album,
  type FamilyMember,
  type Photo,
} from "@/sanity/queries";

type PaginatedResult<T> = {
  items: T[];
  total: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
};

function normalizePagination(page: number, pageSize: number) {
  const safePageSize = Math.max(1, Math.trunc(pageSize));
  const safePage = Math.max(1, Math.trunc(page));
  const start = (safePage - 1) * safePageSize;
  const end = start + safePageSize;
  return { safePage, safePageSize, start, end };
}

export async function getPhotos(): Promise<Photo[]> {
  "use cache";
  cacheTag("photos");
  cacheLife("hours");

  const client = getSanityClient();
  if (!client) return [];
  try {
    const photos = await client.fetch<Photo[]>(photosQuery);
    return photos ?? [];
  } catch {
    return [];
  }
}

export async function getPhotosPaginated(
  page: number,
  pageSize: number
): Promise<PaginatedResult<Photo>> {
  "use cache";
  cacheTag("photos");
  cacheLife("hours");

  const { safePage, safePageSize, start, end } = normalizePagination(page, pageSize);

  const client = getSanityClient();
  if (!client) {
    return {
      items: [],
      total: 0,
      currentPage: safePage,
      pageSize: safePageSize,
      totalPages: 1,
    };
  }

  try {
    const [items, total] = await Promise.all([
      client.fetch<Photo[]>(paginatedPhotosQuery, { start, end }),
      client.fetch<number>(photosCountQuery),
    ]);
    const totalPages = Math.max(1, Math.ceil((total ?? 0) / safePageSize));
    return {
      items: items ?? [],
      total: total ?? 0,
      currentPage: Math.min(safePage, totalPages),
      pageSize: safePageSize,
      totalPages,
    };
  } catch {
    try {
      const allPhotos = (await client.fetch<Photo[]>(photosQuery)) ?? [];
      const total = allPhotos.length;
      const totalPages = Math.max(1, Math.ceil(total / safePageSize));
      const boundedPage = Math.min(safePage, totalPages);
      const boundedStart = (boundedPage - 1) * safePageSize;
      const items = allPhotos.slice(boundedStart, boundedStart + safePageSize);
      return {
        items,
        total,
        currentPage: boundedPage,
        pageSize: safePageSize,
        totalPages,
      };
    } catch {
      return {
        items: [],
        total: 0,
        currentPage: safePage,
        pageSize: safePageSize,
        totalPages: 1,
      };
    }
  }
}

export async function getAlbums(): Promise<Album[]> {
  "use cache";
  cacheTag("albums");
  cacheLife("hours");

  const client = getSanityClient();
  if (!client) return [];
  try {
    const albums = await client.fetch<Album[]>(albumsQuery);
    return albums ?? [];
  } catch {
    return [];
  }
}

export async function getAlbumsPaginated(
  page: number,
  pageSize: number
): Promise<PaginatedResult<Album>> {
  "use cache";
  cacheTag("albums");
  cacheLife("hours");

  const { safePage, safePageSize, start, end } = normalizePagination(page, pageSize);

  const client = getSanityClient();
  if (!client) {
    return {
      items: [],
      total: 0,
      currentPage: safePage,
      pageSize: safePageSize,
      totalPages: 1,
    };
  }

  try {
    const [items, total] = await Promise.all([
      client.fetch<Album[]>(paginatedAlbumsQuery, { start, end }),
      client.fetch<number>(albumsCountQuery),
    ]);
    const totalPages = Math.max(1, Math.ceil((total ?? 0) / safePageSize));
    return {
      items: items ?? [],
      total: total ?? 0,
      currentPage: Math.min(safePage, totalPages),
      pageSize: safePageSize,
      totalPages,
    };
  } catch {
    try {
      const allAlbums = (await client.fetch<Album[]>(albumsQuery)) ?? [];
      const total = allAlbums.length;
      const totalPages = Math.max(1, Math.ceil(total / safePageSize));
      const boundedPage = Math.min(safePage, totalPages);
      const boundedStart = (boundedPage - 1) * safePageSize;
      const items = allAlbums.slice(boundedStart, boundedStart + safePageSize);
      return {
        items,
        total,
        currentPage: boundedPage,
        pageSize: safePageSize,
        totalPages,
      };
    } catch {
      return {
        items: [],
        total: 0,
        currentPage: safePage,
        pageSize: safePageSize,
        totalPages: 1,
      };
    }
  }
}

export async function getAlbumBySlug(slug: string): Promise<Album | null> {
  "use cache";
  cacheTag("albums", `album-${slug}`);
  cacheLife("hours");

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
  "use cache";
  cacheTag("family-members");
  cacheLife("days");

  const client = getSanityClient();
  if (!client) return [];
  try {
    const members = await client.fetch<FamilyMember[]>(familyMembersQuery);
    return members ?? [];
  } catch {
    return [];
  }
}
