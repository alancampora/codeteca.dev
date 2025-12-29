import type { CodetecaApp } from "./types";

const REPOS = ["alancampora/arboleteca"];

const raw = (slug: string) =>
  `https://raw.githubusercontent.com/${slug}/main/codeteca.config.json?t=${Date.now()}`;

export async function loadApps(): Promise<CodetecaApp[]> {
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
