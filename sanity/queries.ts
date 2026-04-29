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
    "imageUrl": image.asset->url,
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
    "coverUrl": select(
      defined(cover.asset) => cover.asset->url,
      *[_type == "photo" && references(^._id)] | order(_createdAt desc)[0].image.asset->url
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
      *[_type == "photo" && references(^._id)] | order(takenAt desc, _createdAt desc)[0].image.asset->url
    ),
    "photos": *[_type == "photo" && references(^._id)] | order(takenAt desc) {
      _id,
      title,
      caption,
      takenAt,
      "imageUrl": image.asset->url,
      "imageAssetId": image.asset._ref,
      "dimensions": image.asset->metadata.dimensions,
      "lqip": image.asset->metadata.lqip,
      ${uploaderProjection}
    }
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
