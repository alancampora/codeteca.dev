import { mockGithubContributors, mockGithubData } from "./mock-github"
function getGithubDataDev() {
  return {
    repoData: mockGithubData,
    commits: [],
    contributors: mockGithubContributors,
    totalCommits: 32
  };
}

export async function getGitHubData(repoUrl: string) {

  if (import.meta.env.DEV) {
    return getGithubDataDev();
  }

  const [, , , owner, repo] = repoUrl.split("/");

  const headers: HeadersInit = {
    'Accept': 'application/vnd.github.v3+json'
  };

  // Agregar token si existe
  if (import.meta.env.GITHUB_TOKEN) {
    headers['Authorization'] = `token ${import.meta.env.GITHUB_TOKEN}`;
  }

  try {
    const repoResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}`,
      { headers }
    );

    const repoData = await repoResponse.json();

    // Commits recientes
    const commitsResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/commits?per_page=10`,
    );
    const commits = await commitsResponse.json();

    const contributorsResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contributors`,
      { headers }
    );
    const contributors = await contributorsResponse.json();
    const totalCommits = contributors.reduce((sum: number, contributor: any) => sum + contributor.contributions, 0);


    return { repoData, commits, contributors, totalCommits };
  } catch (error) {
    console.error("Error fetching GitHub data:", error);
    return { repoData: null, commits: [], contributors: [], totalCommits: 0 };
  }
};


