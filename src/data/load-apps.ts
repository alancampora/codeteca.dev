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

const raw = (slug: string, file: string) =>
  `https://raw.githubusercontent.com/${slug}/main/${file}?t=${Date.now()}`;

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
      const res = await fetch(raw(slug, 'codeteca.config.json'));

      if (!res.ok) {
        throw new Error(`${slug}: ${res.statusText} (${res.status})`);
      }

      const config = (await res.json()) as CodetecaApp;

      let detailedContent = null;

      if (config.hasDetailedContent) {
        try {
          const contentRes = await fetch(raw(slug, 'codeteca.content.md'));
          if (contentRes.ok) {
            detailedContent = await contentRes.text();
          }
        } catch (e) {
          console.warn(`No detailed content for ${slug}`);
        }
      }

      return { ...config, detailedContent };

    }),
  );
  return settled
    .filter((r): r is PromiseFulfilledResult<any> => {
      if (r.status === "rejected") {
        console.error("Failed to load repo:", r.reason);
        return false;
      }
      return true;
    })
    .map((r) => r.value);
}
