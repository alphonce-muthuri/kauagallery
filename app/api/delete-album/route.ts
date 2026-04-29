import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { auth } from "@clerk/nextjs/server";

import { getSanityWriteClient } from "@/sanity/write-client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function DELETE(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "You must be signed in." }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const albumId = searchParams.get("id");
  const albumSlug = searchParams.get("slug");

  if (!albumId) {
    return NextResponse.json({ error: "Missing album id." }, { status: 400 });
  }

  const client = getSanityWriteClient();
  if (!client) {
    return NextResponse.json({ error: "Sanity not configured." }, { status: 500 });
  }

  const album = await client.fetch<{ _id: string; slug?: string } | null>(
    `*[_type == "album" && _id == $id][0]{ _id, "slug": slug.current }`,
    { id: albumId }
  );
  if (!album) {
    return NextResponse.json({ error: "Album not found." }, { status: 404 });
  }

  // Keep photos intact: unset album reference before deleting album doc.
  const photoIds = await client.fetch<string[]>(
    `*[_type == "photo" && references($albumId)]._id`,
    { albumId }
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let tx: any = client.transaction();
  for (const photoId of photoIds) {
    tx = tx.patch(photoId, (p: { unset: (fields: string[]) => unknown }) =>
      p.unset(["album"])
    );
  }
  tx = tx.delete(albumId);
  await tx.commit();

  revalidateTag("albums");
  revalidateTag("photos");
  if (album.slug) revalidateTag(`album-${album.slug}`);
  revalidatePath("/");
  revalidatePath("/gallery");
  revalidatePath("/albums");
  if (albumSlug) revalidatePath(`/albums/${albumSlug}`);
  if (album.slug) revalidatePath(`/albums/${album.slug}`);

  return NextResponse.json({ ok: true, affectedPhotos: photoIds.length });
}

