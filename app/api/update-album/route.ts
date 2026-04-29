import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";

import { getSanityWriteClient } from "@/sanity/write-client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "You must be signed in." }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const albumId = searchParams.get("id");
  if (!albumId) {
    return NextResponse.json({ error: "Missing album id." }, { status: 400 });
  }

  const client = getSanityWriteClient();
  if (!client) {
    return NextResponse.json({ error: "Sanity not configured." }, { status: 500 });
  }

  const album = await client.fetch<{ _id: string } | null>(
    `*[_type == "album" && _id == $id][0]{ _id }`,
    { id: albumId }
  );
  if (!album) {
    return NextResponse.json({ error: "Album not found." }, { status: 404 });
  }

  let body: { title?: string; description?: string; coverAssetId?: string | null };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const setFields: Record<string, unknown> = {};
  const unsetFields: string[] = [];

  if (typeof body.title === "string" && body.title.trim()) {
    setFields.title = body.title.trim();
  }
  if (typeof body.description === "string") {
    const d = body.description.trim();
    if (d) setFields.description = d;
    else unsetFields.push("description");
  }
  if (body.coverAssetId === null) {
    unsetFields.push("cover");
  } else if (typeof body.coverAssetId === "string" && body.coverAssetId.trim()) {
    setFields.cover = {
      _type: "image",
      asset: { _type: "reference", _ref: body.coverAssetId.trim() },
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let p: any = client.patch(albumId);
  if (Object.keys(setFields).length > 0) p = p.set(setFields);
  if (unsetFields.length > 0) p = p.unset(unsetFields);
  await p.commit();

  revalidatePath("/");
  revalidatePath("/albums");
  revalidatePath(`/albums/${albumId}`, "page");

  return NextResponse.json({ ok: true });
}
