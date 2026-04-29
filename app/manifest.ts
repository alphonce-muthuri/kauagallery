import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Kaua's  -a private family photo library",
    short_name: "Kaua's ",
    description:
      "A Mac-inspired, Pinterest-style photo library for the whole family. Built with Next.js, Sanity, Clerk, and shadcn/ui.",
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#F5EFDF",
    theme_color: "#ea580c",
    categories: ["photo", "lifestyle", "social", "productivity"],
    icons: [
      {
        src: "/icons/icon-32.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        src: "/icons/icon-64.png",
        sizes: "64x64",
        type: "image/png",
      },
      {
        src: "/icons/icon-128.png",
        sizes: "128x128",
        type: "image/png",
      },
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-256.png",
        sizes: "256x256",
        type: "image/png",
      },
      {
        src: "/icons/icon-384.png",
        sizes: "384x384",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Upload photos",
        short_name: "Upload",
        description: "Add new memories to your family library",
        url: "/upload",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
      },
      {
        name: "Gallery",
        short_name: "Gallery",
        description: "Browse the family gallery",
        url: "/gallery",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
      },
      {
        name: "Favorites",
        short_name: "Favorites",
        description: "View favorite moments",
        url: "/favorites",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
      },
    ],
  };
}
