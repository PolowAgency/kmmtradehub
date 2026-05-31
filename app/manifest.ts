import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "KMM Trade",
    short_name: "KMM Trade",
    description: "Ta plateforme de formation trading",
    start_url: "/app/dashboard",
    display: "standalone",
    background_color: "#0A0A0A",
    theme_color: "#C9A84C",
    orientation: "portrait",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
    categories: ["education", "finance"],
    lang: "fr",
  };
}
