import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";

import { getSanityClient } from "@/sanity/client";
import { getSanityWriteClient } from "@/sanity/write-client";
import { familyMembersQuery, type FamilyMember } from "@/sanity/queries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const client = getSanityClient();
  if (!client) {
    return NextResponse.json({ members: [] as FamilyMember[] });
  }
  const members = await client.fetch<FamilyMember[]>(familyMembersQuery);
  return NextResponse.json({ members: members ?? [] });
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "You must be signed in." }, { status: 401 });
  }

  const client = getSanityWriteClient();
  if (!client) {
    return NextResponse.json({ error: "Sanity not configured." }, { status: 500 });
  }

  let body: { name?: string; avatarUrl?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const name = body.name?.trim();
  if (!name) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }

  const avatarUrl = body.avatarUrl?.trim();
  const created = await client.create({
    _type: "familyMember",
    name,
    ...(avatarUrl ? { avatarUrl } : {}),
  });

  revalidatePath("/family");
  return NextResponse.json({ member: created }, { status: 201 });
}

export async function PATCH(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "You must be signed in." }, { status: 401 });
  }

  const client = getSanityWriteClient();
  if (!client) {
    return NextResponse.json({ error: "Sanity not configured." }, { status: 500 });
  }

  let body: { id?: string; name?: string; avatarUrl?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const id = body.id?.trim();
  if (!id) {
    return NextResponse.json({ error: "Member id is required." }, { status: 400 });
  }

  const setFields: Record<string, string> = {};
  const unsetFields: string[] = [];
  if (typeof body.name === "string") {
    const nextName = body.name.trim();
    if (!nextName) {
      return NextResponse.json({ error: "Name cannot be empty." }, { status: 400 });
    }
    setFields.name = nextName;
  }

  if (typeof body.avatarUrl === "string") {
    const nextAvatar = body.avatarUrl.trim();
    if (nextAvatar) setFields.avatarUrl = nextAvatar;
    else unsetFields.push("avatarUrl");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let patch: any = client.patch(id);
  if (Object.keys(setFields).length > 0) patch = patch.set(setFields);
  if (unsetFields.length > 0) patch = patch.unset(unsetFields);
  const updated = await patch.commit();

  revalidatePath("/family");
  return NextResponse.json({ member: updated });
}

