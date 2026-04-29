import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { auth, currentUser } from "@clerk/nextjs/server";

import { getSanityWriteClient } from "@/sanity/write-client";


const MAX_BYTES = 25 * 1024 * 1024; // 25 MB
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "image/gif",
]);

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 64);
}

export async function POST(req: Request) {
  /* 1 -Gate with Clerk. Only signed-in family members can upload. */
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json(
      { error: "You must be signed in to upload." },
      { status: 401 }
    );
  }

  /* 2 -Sanity client with write token. */
  const client = getSanityWriteClient();
  if (!client) {
    return NextResponse.json(
      {
        error:
          "Sanity isn't fully configured. Check NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET and SANITY_API_WRITE_TOKEN.",
      },
      { status: 500 }
    );
  }

  /* 3 -Parse multipart form. */
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json(
      { error: "Expected multipart/form-data." },
      { status: 400 }
    );
  }

  const file = form.get("file");
  const title = String(form.get("title") ?? "").trim();
  const caption = String(form.get("caption") ?? "").trim();
  const albumTitle = String(form.get("album") ?? "").trim();
  const takenAtInput = String(form.get("takenAt") ?? "").trim();

  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "A photo file is required." },
      { status: 400 }
    );
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: `Unsupported image type: ${file.type || "unknown"}.` },
      { status: 400 }
    );
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "Photo is larger than the 25MB limit." },
      { status: 413 }
    );
  }

  /* 4 -Resolve the current Clerk user for uploader metadata. */
  let uploaderName = "";
  let uploaderImageUrl: string | undefined;
  try {
    const user = await currentUser();
    uploaderName =
      user?.fullName ||
      user?.firstName ||
      user?.username ||
      user?.primaryEmailAddress?.emailAddress ||
      "Family member";
    uploaderImageUrl = user?.imageUrl;
  } catch {
    uploaderName = "Family member";
  }

  try {
    /* 5 -Upload the binary to Sanity's asset pipeline. */
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const asset = await client.assets.upload("image", buffer, {
      filename: file.name || `${slugify(title) || "photo"}.jpg`,
      contentType: file.type,
    });

    /* 6 -Find or create the album by title (case-insensitive).
     * Albums are unique by name -same title always maps to the same album. */
    let albumRef: { _type: "reference"; _ref: string } | undefined;
    if (albumTitle) {
      const existing = await client.fetch<{ _id: string } | null>(
        `*[_type == "album" && lower(title) == lower($title)][0]{ _id }`,
        { title: albumTitle }
      );
      if (existing?._id) {
        albumRef = { _type: "reference", _ref: existing._id };
      } else {
        const created = await client.create({
          _type: "album",
          title: albumTitle,
          slug: { _type: "slug", current: slugify(albumTitle) },
        });
        albumRef = { _type: "reference", _ref: created._id };
      }
    }

    /* 7 -Create the photo document referencing the asset + album + uploader. */
    const takenAt = takenAtInput
      ? new Date(takenAtInput).toISOString()
      : new Date().toISOString();

    const doc = await client.create({
      _type: "photo",
      title: title || file.name || "Untitled",
      caption: caption || undefined,
      takenAt,
      image: {
        _type: "image",
        asset: { _type: "reference", _ref: asset._id },
      },
      album: albumRef,
      uploaderClerkId: userId,
      uploaderName,
      uploaderImageUrl,
    });

    /* 8 -Refresh cached gallery routes so the new photo shows up immediately. */
    revalidateTag("photos", "default");
    revalidateTag("albums", "default");
    revalidatePath("/");
    revalidatePath("/gallery");
    revalidatePath("/albums");
    revalidatePath("/favorites");
    revalidatePath("/highlights");
    if (albumTitle) revalidatePath(`/albums/${slugify(albumTitle)}`);

    return NextResponse.json(
      {
        ok: true,
        photo: {
          id: doc._id,
          title: doc.title,
          imageUrl: asset.url,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed.";
    console.error("[upload] error", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
