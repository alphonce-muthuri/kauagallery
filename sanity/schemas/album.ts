import type { SchemaTypeDefinition } from "./_types";

export const album: SchemaTypeDefinition = {
  name: "album",
  title: "Album",
  type: "document",
  fields: [
    {
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    },
    {
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 64 },
      validation: (Rule) => Rule.required(),
    },
    {
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
    },
    {
      name: "cover",
      title: "Cover",
      type: "image",
      options: { hotspot: true, metadata: ["dimensions", "lqip"] },
    },
  ],
  preview: {
    select: { title: "title", subtitle: "description", media: "cover" },
  },
};
