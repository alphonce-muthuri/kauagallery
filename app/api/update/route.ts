import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { auth } from "@clerk/nextjs/server";

import { getSanityWriteClient } from "@/sanity/write-client";


export async function PATCH(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "You must be signed in." }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const photoId = searchParams.get("id");
  if (!photoId) {
    return NextResponse.json({ error: "Missing photo id." }, { status: 400 });
  }

  const client = getSanityWriteClient();
  if (!client) {
    return NextResponse.json({ error: "Sanity not configured." }, { status: 500 });
  }

  const photo = await client.fetch<{ uploaderClerkId: string } | null>(
    `*[_type == "photo" && _id == $id][0]{ uploaderClerkId }`,
    { id: photoId }
  );

  if (!photo) {
    return NextResponse.json({ error: "Photo not found." }, { status: 404 });
  }

  if (photo.uploaderClerkId !== userId) {
    return NextResponse.json({ error: "You can only edit photos you uploaded." }, { status: 403 });
  }

  let body: { title?: string; caption?: string; tags?: string[]; takenAt?: string };
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
  if (typeof body.caption === "string") {
    const c = body.caption.trim();
    if (c) setFields.caption = c;
    else unsetFields.push("caption");
  }
  if (Array.isArray(body.tags)) {
    const tags = body.tags.map((t) => String(t).trim()).filter(Boolean);
    if (tags.length > 0) setFields.tags = tags;
    else unsetFields.push("tags");
  }
  if (typeof body.takenAt === "string" && body.takenAt) {
    setFields.takenAt = new Date(body.takenAt).toISOString();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let p: any = client.patch(photoId);
  if (Object.keys(setFields).length > 0) p = p.set(setFields);
  if (unsetFields.length > 0) p = p.unset(unsetFields);
  await p.commit();

  revalidateTag("photos");
  revalidatePath("/");
  revalidatePath("/gallery");
  revalidatePath("/albums");
  revalidatePath("/favorites");
  revalidatePath("/highlights");

  return NextResponse.json({ ok: true });
}
