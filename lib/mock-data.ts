import type { Album, Photo } from "@/sanity/queries";

type MockAlbum = Album & { slug: string };

export const mockAlbums: MockAlbum[] = [
  {
    _id: "a-sunday-service",
    title: "Sunday Service",
    description:
      "Every Sunday we gather, we worship, we give thanks. God is good -all the time.",
    slug: "sunday-service",
    coverUrl:
      "https://images.unsplash.com/photo-1438232992991-995b671e4b8c?w=1400&q=80&auto=format&fit=crop",
    photoCount: 28,
  },
  {
    _id: "a-family-prayer",
    title: "Family devotion nights",
    description:
      "Wednesday evenings, the Word open on the table, the kids asking the best questions.",
    slug: "family-devotion-nights",
    coverUrl:
      "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=1400&q=80&auto=format&fit=crop",
    photoCount: 19,
  },
  {
    _id: "a-mama-kaua-birthday",
    title: "Mama Kaua's birthday",
    description:
      "Four generations under one roof -Kaua, Alphonce, Kawira, Muchai, the kids and Mama Nkiro herself.",
    slug: "mama-kaua-birthday",
    coverUrl:
      "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=1400&q=80&auto=format&fit=crop",
    photoCount: 34,
  },
  {
    _id: "a-school-holidays",
    title: "School holidays",
    description:
      "No alarms, long breakfasts, and the kids reminding us what joy looks like.",
    slug: "school-holidays",
    coverUrl:
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1400&q=80&auto=format&fit=crop",
    photoCount: 41,
  },
  {
    _id: "a-weekend-home",
    title: "Weekend at home",
    description:
      "Ugali, storytelling, the dog refusing to move off the sofa.",
    slug: "weekend-at-home",
    coverUrl:
      "https://images.unsplash.com/photo-1528716321680-815a8cdb8cbe?w=1400&q=80&auto=format&fit=crop",
    photoCount: 57,
  },
  {
    _id: "a-christmas",
    title: "Christmas & Thanksgiving",
    description:
      "Gratitude first. Then the mandazi. Then Alphonce's cinnamon rolls.",
    slug: "christmas-thanksgiving",
    coverUrl:
      "https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=1400&q=80&auto=format&fit=crop",
    photoCount: 62,
  },
];

type SeedPhoto = {
  id: string;
  w: number;
  h: number;
  title: string;
  caption?: string;
  albumSlug: string;
  uploader: string;
  daysAgo: number;
  tags: string[];
};

const seeds: SeedPhoto[] = [
  {
    id: "photo-1438232992991-995b671e4b8c",
    w: 1200,
    h: 1500,
    title: "Praise and worship",
    caption: "When the whole family sings together, the walls join in.",
    albumSlug: "sunday-service",
    uploader: "Alphonce",
    daysAgo: 5,
    tags: ["sunday", "worship", "faith"],
  },
  {
    id: "photo-1529390079861-591de354faf5",
    w: 1200,
    h: 900,
    title: "After the sermon",
    caption: "Baba Kaua said it was the best one yet. He says that every week.",
    albumSlug: "sunday-service",
    uploader: "Zamzam",
    daysAgo: 5,
    tags: ["sunday", "family"],
  },
  {
    id: "photo-1517842645767-c639042777db",
    w: 1200,
    h: 900,
    title: "Kids in their best",
    caption: "They dressed themselves. We let them.",
    albumSlug: "sunday-service",
    uploader: "Kawira",
    daysAgo: 12,
    tags: ["sunday", "kids"],
  },

  {
    id: "photo-1504052434569-70ad5836ab65",
    w: 1200,
    h: 800,
    title: "Wednesday devotion",
    caption: "Jeremiah 29:11 -the kids can now recite it from memory.",
    albumSlug: "family-devotion-nights",
    uploader: "Mama Nkiro",
    daysAgo: 9,
    tags: ["faith", "family", "prayer"],
  },
  {
    id: "photo-1524504388940-b1c1722653e1",
    w: 1200,
    h: 900,
    title: "Open Bible, open hearts",
    caption: "Kaua led the reading. The little ones sat still for the whole thing.",
    albumSlug: "family-devotion-nights",
    uploader: "Alphonce",
    daysAgo: 16,
    tags: ["faith", "home"],
  },

  {
    id: "photo-1464349095431-e9a21285b5f3",
    w: 1200,
    h: 1500,
    title: "Mama Nkiro, surrounded by love",
    caption: "She said the best gift was having everyone together. She was right.",
    albumSlug: "mama-kaua-birthday",
    uploader: "Alphonce",
    daysAgo: 40,
    tags: ["birthday", "family", "gratitude"],
  },
  {
    id: "photo-1516627145497-ae6968895b74",
    w: 1200,
    h: 900,
    title: "Four generations",
    caption: "God's faithfulness across every generation in this room.",
    albumSlug: "mama-kaua-birthday",
    uploader: "Sheila",
    daysAgo: 40,
    tags: ["birthday", "generations"],
  },
  {
    id: "photo-1519741497674-611481863552",
    w: 1200,
    h: 900,
    title: "The cake Mama made herself",
    caption: "Cardamom and honey -nobody else's hands can make it taste like that.",
    albumSlug: "mama-kaua-birthday",
    uploader: "Karimi",
    daysAgo: 40,
    tags: ["birthday", "baking"],
  },

  {
    id: "photo-1503676260728-1c00da094a0b",
    w: 1200,
    h: 900,
    title: "First day back to school",
    caption: "New shoes, new faith, same big God watching over them.",
    albumSlug: "school-holidays",
    uploader: "Zamzam",
    daysAgo: 22,
    tags: ["school", "kids"],
  },
  {
    id: "photo-1523050854058-8df90110c9f1",
    w: 1200,
    h: 1500,
    title: "Holiday reading",
    caption: "Tumi chose the Bible. We did not suggest it.",
    albumSlug: "school-holidays",
    uploader: "Kaua",
    daysAgo: 25,
    tags: ["kids", "reading", "faith"],
  },
  {
    id: "photo-1509927083803-4bd519298ac4",
    w: 1200,
    h: 900,
    title: "Cousins at the farm",
    caption: "Dirty hands, wide smiles, hearts full of thanks.",
    albumSlug: "school-holidays",
    uploader: "Mutugi",
    daysAgo: 30,
    tags: ["cousins", "outdoors"],
  },

  {
    id: "photo-1528716321680-815a8cdb8cbe",
    w: 1200,
    h: 800,
    title: "Slow Saturday morning",
    caption: "Tea on the veranda, no agenda, just gratitude.",
    albumSlug: "weekend-at-home",
    uploader: "Alphonce",
    daysAgo: 3,
    tags: ["home", "morning", "peace"],
  },
  {
    id: "photo-1529333166437-7750a6dd5a70",
    w: 1200,
    h: 900,
    title: "Chapati Sunday",
    caption: "Mama's hands, the same recipe since 1982.",
    albumSlug: "weekend-at-home",
    uploader: "Lenah",
    daysAgo: 7,
    tags: ["food", "home", "tradition"],
  },
  {
    id: "photo-1444080748397-f442aa95c3e5",
    w: 1200,
    h: 1500,
    title: "Evening walk",
    caption: "Thanking God for this neighborhood, these trees, these people.",
    albumSlug: "weekend-at-home",
    uploader: "Kaua",
    daysAgo: 14,
    tags: ["outdoors", "family", "gratitude"],
  },
  {
    id: "photo-1471897488648-5eae4ac6686b",
    w: 1200,
    h: 800,
    title: "Backyard golden hour",
    caption: "His mercies are new every morning -and every evening too.",
    albumSlug: "weekend-at-home",
    uploader: "Valarie",
    daysAgo: 18,
    tags: ["home", "evening"],
  },

  {
    id: "photo-1512389142860-9c449e58a543",
    w: 1200,
    h: 800,
    title: "Christmas morning",
    caption: "We opened the Word before the presents. The kids didn't even complain.",
    albumSlug: "christmas-thanksgiving",
    uploader: "Mama Nkiro",
    daysAgo: 110,
    tags: ["christmas", "faith", "home"],
  },
  {
    id: "photo-1482517967863-00e15c9b44be",
    w: 1200,
    h: 1500,
    title: "Matching Christmas outfits",
    caption: "Alphonce insisted. Nobody resisted.",
    albumSlug: "christmas-thanksgiving",
    uploader: "Zamzam",
    daysAgo: 110,
    tags: ["christmas", "family"],
  },
  {
    id: "photo-1545389336-cf090694435e",
    w: 1200,
    h: 1600,
    title: "Thanksgiving table",
    caption: "Every seat filled. Every prayer answered.",
    albumSlug: "christmas-thanksgiving",
    uploader: "Kaua",
    daysAgo: 115,
    tags: ["thanksgiving", "gratitude", "family"],
  },
  {
    id: "photo-1513885535751-8b9238bd345a",
    w: 1200,
    h: 900,
    title: "Cinnamon rolls at dawn",
    caption: "Alphonce was up at 5am. God bless him.",
    albumSlug: "christmas-thanksgiving",
    uploader: "Mukami",
    daysAgo: 110,
    tags: ["baking", "morning", "christmas"],
  },
];

export const mockPhotos: Photo[] = seeds.map((s, i) => {
  const album = mockAlbums.find((a) => a.slug === s.albumSlug)!;
  return {
    _id: `p-${i + 1}`,
    title: s.title,
    caption: s.caption,
    takenAt: new Date(Date.now() - s.daysAgo * 86400000).toISOString(),
    imageUrl: `https://images.unsplash.com/${s.id}?w=1200&q=80&auto=format&fit=crop`,
    dimensions: { width: s.w, height: s.h, aspectRatio: s.w / s.h },
    album: {
      _id: album._id,
      title: album.title,
      slug: { current: album.slug },
    },
    uploader: {
      _id: s.uploader.toLowerCase().replace(/\s+/g, "-"),
      name: s.uploader,
      avatarUrl: undefined,
    },
    tags: s.tags,
  };
});
