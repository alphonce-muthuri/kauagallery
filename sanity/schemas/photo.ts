import type { SchemaTypeDefinition } from "./_types";

export const photo: SchemaTypeDefinition = {
  name: "photo",
  title: "Photo",
  type: "document",
  fields: [
    {
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    },
    {
      name: "caption",
      title: "Caption",
      type: "text",
      rows: 2,
    },
    {
      name: "image",
      title: "Image",
      type: "image",
      options: { hotspot: true, metadata: ["dimensions", "lqip", "palette"] },
      validation: (Rule) => Rule.required(),
    },
    {
      name: "album",
      title: "Album",
      type: "reference",
      to: [{ type: "album" }],
    },
    {
      name: "takenAt",
      title: "Taken at",
      type: "datetime",
    },
    {
      name: "tags",
      title: "Tags",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
    },

    /* -Clerk-backed uploader identity (denormalized so no familyMember doc is required) -*/
    {
      name: "uploaderClerkId",
      title: "Uploader (Clerk user id)",
      type: "string",
    },
    {
      name: "uploaderName",
      title: "Uploader name",
      type: "string",
    },
    {
      name: "uploaderImageUrl",
      title: "Uploader avatar URL",
      type: "url",
    },

    /* Kept for backward compatibility with the familyMember reference flow. */
    {
      name: "uploader",
      title: "Uploader (reference · optional)",
      type: "reference",
      to: [{ type: "familyMember" }],
    },
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "uploaderName",
      media: "image",
    },
  },
};
