import { groq } from "next-sanity";

/**
 * `uploader` is projected from two possible sources:
 *  - new Clerk-denormalized fields (`uploaderClerkId`, `uploaderName`, `uploaderImageUrl`)
 *  - or the legacy familyMember reference (`uploader->{…}`)
 * Whichever exists first wins.
 */
const uploaderProjection = `
  "uploader": select(
    defined(uploaderName) => {
      "_id": uploaderClerkId,
      "name": uploaderName,
      "avatarUrl": uploaderImageUrl
    },
    defined(uploader) => uploader->{ _id, name, avatarUrl },
    null
  )
`;

export const photosQuery = groq`
  *[_type == "photo"] | order(takenAt desc, _createdAt desc) {
    _id,
    title,
    caption,
    takenAt,
    "imageUrl": coalesce(image.asset->url, externalImageUrl),
    "dimensions": image.asset->metadata.dimensions,
    "lqip": image.asset->metadata.lqip,
    "album": album->{ _id, title, slug },
    ${uploaderProjection},
    tags
  }
`;

export const photosCountQuery = groq`count(*[_type == "photo"])`;

export const paginatedPhotosQuery = groq`
  *[_type == "photo"] | order(takenAt desc, _createdAt desc) [$start...$end] {
    _id,
    title,
    caption,
    takenAt,
    "imageUrl": coalesce(image.asset->url, externalImageUrl),
    "dimensions": image.asset->metadata.dimensions,
    "lqip": image.asset->metadata.lqip,
    "album": album->{ _id, title, slug },
    ${uploaderProjection},
    tags
  }
`;

export const albumsQuery = groq`
  *[_type == "album"] | order(_createdAt desc) {
    _id,
    title,
    description,
    "slug": slug.current,
    "coverUrl": coalesce(
      cover.asset->url,
      *[_type == "photo" && references(^._id)] | order(_createdAt desc)[0].image.asset->url,
      *[_type == "photo" && references(^._id)] | order(_createdAt desc)[0].externalImageUrl
    ),
    "photoCount": count(*[_type == "photo" && references(^._id)])
  }
`;

export const albumsCountQuery = groq`count(*[_type == "album"])`;

export const paginatedAlbumsQuery = groq`
  *[_type == "album"] | order(_createdAt desc) [$start...$end] {
    _id,
    title,
    description,
    "slug": slug.current,
    "coverUrl": coalesce(
      cover.asset->url,
      *[_type == "photo" && references(^._id)] | order(_createdAt desc)[0].image.asset->url,
      *[_type == "photo" && references(^._id)] | order(_createdAt desc)[0].externalImageUrl
    ),
    "photoCount": count(*[_type == "photo" && references(^._id)])
  }
`;

export const albumBySlugQuery = groq`
  *[_type == "album" && slug.current == $slug][0] {
    _id,
    title,
    description,
    "slug": slug.current,
    "coverUrl": select(
      defined(cover.asset) => cover.asset->url,
      coalesce(
        *[_type == "photo" && references(^._id)] | order(takenAt desc, _createdAt desc)[0].image.asset->url,
        *[_type == "photo" && references(^._id)] | order(takenAt desc, _createdAt desc)[0].externalImageUrl
      )
    ),
    "photos": *[_type == "photo" && references(^._id)] | order(takenAt desc) {
      _id,
      title,
      caption,
      takenAt,
      "imageUrl": coalesce(image.asset->url, externalImageUrl),
      "imageAssetId": image.asset._ref,
      "dimensions": image.asset->metadata.dimensions,
      "lqip": image.asset->metadata.lqip,
      ${uploaderProjection}
    }
  }
`;

export function buildPhotosQueries(sort: "asc" | "desc") {
  const order = sort === "asc" ? "asc" : "desc";
  const photosQuery = groq`
    *[_type == "photo"
      && ($q == "" || title match $q || caption match $q || count(tags[@ match $q]) > 0)
      && ($albumSlug == "" || album->slug.current == $albumSlug)
    ] | order(takenAt ${order}, _createdAt ${order}) [$start...$end] {
      _id,
      title,
      caption,
      takenAt,
      "imageUrl": coalesce(image.asset->url, externalImageUrl),
      "dimensions": image.asset->metadata.dimensions,
      "lqip": image.asset->metadata.lqip,
      "album": album->{ _id, title, slug },
      ${uploaderProjection},
      tags
    }
  `;
  const countQuery = groq`
    count(*[_type == "photo"
      && ($q == "" || title match $q || caption match $q || count(tags[@ match $q]) > 0)
      && ($albumSlug == "" || album->slug.current == $albumSlug)
    ])
  `;
  return { photosQuery, countQuery };
}

export const heroPhotosQuery = groq`
  *[_type == "photo" && featuredInHero == true] | order(takenAt desc, _createdAt desc) {
    _id,
    title,
    caption,
    takenAt,
    "imageUrl": coalesce(image.asset->url, externalImageUrl),
    "dimensions": image.asset->metadata.dimensions,
    "lqip": image.asset->metadata.lqip,
    "album": album->{ _id, title, slug },
    ${uploaderProjection},
    tags
  }
`;

export const familyMembersQuery = groq`
  *[_type == "familyMember"] | order(name asc) {
    _id,
    name,
    role,
    avatarUrl,
    clerkUserId
  }
`;

export type Photo = {
  _id: string;
  title: string;
  caption?: string;
  takenAt?: string;
  imageUrl: string;
  imageAssetId?: string;
  dimensions: { width: number; height: number; aspectRatio: number };
  lqip?: string;
  album?: { _id: string; title: string; slug: { current: string } };
  uploader?: { _id: string; name: string; avatarUrl?: string } | null;
  tags?: string[];
};

export type Album = {
  _id: string;
  title: string;
  description?: string;
  slug: string;
  coverUrl?: string;
  photoCount: number;
  photos?: Photo[];
};

export type FamilyMember = {
  _id: string;
  name: string;
  role?: string;
  avatarUrl?: string;
  clerkUserId?: string;
};
