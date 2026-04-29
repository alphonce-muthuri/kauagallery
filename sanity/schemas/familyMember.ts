import type { SchemaTypeDefinition } from "./_types";

export const familyMember: SchemaTypeDefinition = {
  name: "familyMember",
  title: "Family member",
  type: "document",
  fields: [
    {
      name: "name",
      title: "Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    },
    { name: "role", title: "Role", type: "string" },
    { name: "avatarUrl", title: "Avatar URL", type: "url" },
    { name: "clerkUserId", title: "Clerk user id", type: "string" },
  ],
  preview: { select: { title: "name", subtitle: "role" } },
};
