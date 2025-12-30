import type { CodetecaApp, Status } from "./types";

const appsMock = [
  {
    id: "arboleteca",
    name: "Arboleteca",
    description:
      "Mapa geoespacial para explorar árboles en la Ciudad de Buenos Aires. Fomentar el conocimiento y un poco de deporte al mismo tiempo",
    slug: "arboleteca",
    href: "/arboleteca",
    repo: "https://github.com/alancampora/arboleteca",
    status: "active" as Status,
    tags: ["astro", "react", "node", "mongo", "geo"],
    hasDetailedContent: true,
  },
  {
    id: "blogteca",
    name: "Blogteca",
    slug: "blogteca",
    description: "Blog builder con MDX + diseño personalizable.",
    href: "/blogteca",
    repo: "https://github.com/alancampora/blogteca",
    status: "experimental" as Status,
    tags: ["mdx", "next", "editor"],
    hasDetailedContent: false,
  },
]

const REPOS = [
  "alancampora/arboleteca",
  "alancampora/sobremesa"];

async function loadLocalContent(slug: string): Promise<string | null> {
  try {
    const content = await import(`../data/content/${slug}.md?raw`);
    return content.default;
  } catch (e) {
    console.warn(`No local content for ${slug}`);
    return null;
  }
}

const raw = (slug: string) =>
  `https://raw.githubusercontent.com/${slug}/main/codeteca.config.json?t=${Date.now()}`;

export async function loadApps(): Promise<CodetecaApp[]> {
  if (import.meta.env.DEV) {
    const appsWithContent = await Promise.all(
      appsMock.map(async (app) => {
        if (app.hasDetailedContent) {
          const content = await loadLocalContent(app.slug);
          return { ...app, detailedContent: content };
        }
        return app;
      })
    );
    return appsWithContent;
  }

  const settled = await Promise.allSettled(
    REPOS.map(async (slug) => {
      const res = await fetch(raw(slug));

      if (!res.ok) {
        throw new Error(`${slug}: ${res.statusText} (${res.status})`);
      }

      return (await res.json()) as CodetecaApp;
    }),
  );

  return settled
    .filter((r): r is PromiseFulfilledResult<CodetecaApp> => {
      if (r.status === "rejected") {
        console.error("Failed to load repo:", r.reason);
        return false;
      }
      return true;
    })
    .map((r) => r.value);
}
