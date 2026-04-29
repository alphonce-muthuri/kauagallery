import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { auth } from "@clerk/nextjs/server";

import { getSanityWriteClient } from "@/sanity/write-client";


export async function DELETE(req: Request) {
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

  const photo = await client.fetch<{ uploaderClerkId: string; assetId: string } | null>(
    `*[_type == "photo" && _id == $id][0]{ uploaderClerkId, "assetId": image.asset._ref }`,
    { id: photoId }
  );

  if (!photo) {
    return NextResponse.json({ error: "Photo not found." }, { status: 404 });
  }

  if (photo.uploaderClerkId !== userId) {
    return NextResponse.json(
      { error: "You can only delete photos you uploaded." },
      { status: 403 }
    );
  }

  await client.delete(photoId);

  if (photo.assetId) {
    try {
      await client.delete(photo.assetId);
    } catch {
      // asset may be referenced elsewhere -ignore
    }
  }

  revalidateTag("photos", "default");
  revalidatePath("/");
  revalidatePath("/gallery");
  revalidatePath("/albums");
  revalidatePath("/favorites");
  revalidatePath("/highlights");

  return NextResponse.json({ ok: true });
}
