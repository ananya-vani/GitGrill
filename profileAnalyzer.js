function analyzeProfile(restData, graphData) {
  const { user, repositories } = restData;

  // Statistics

  const totalStars = repositories.reduce(
    (sum, repo) => sum + repo.stargazers_count,
    0,
  );

  const totalForks = repositories.reduce(
    (sum, repo) => sum + repo.forks_count,
    0,
  );

  const emptyRepos = repositories.filter((repo) => repo.size === 0).length;

  const reposWithoutDescription = repositories.filter(
    (repo) => !repo.description,
  ).length;

  // Languages

  const languageCount = {};

  for (const repo of repositories) {
    if (repo.language) {
      languageCount[repo.language] = (languageCount[repo.language] || 0) + 1;
    }
  }

  const mostUsedLanguage =
    Object.entries(languageCount).sort((a, b) => b[1] - a[1])[0]?.[0] ||
    "Unknown";

  // Best Repository

  const bestRepository =
    repositories.length > 0
      ? repositories.reduce((best, repo) =>
          repo.stargazers_count > best.stargazers_count ? repo : best,
        )
      : null;

  // Top Repositories

  const topRepositories = [...repositories]
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 5)
    .map((repo) => ({
      name: repo.name,
      language: repo.language,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      description: repo.description,
    }));

  // Last Activity

  const lastUpdatedRepo = [...repositories].sort(
    (a, b) => new Date(b.updated_at) - new Date(a.updated_at),
  )[0];

  return {
    username: user.login,

    name: user.name || null,

    bio: user.bio || null,

    followers: user.followers,

    following: user.following,

    publicRepos: user.public_repos,

    accountAge: (
      (Date.now() - new Date(user.created_at)) /
      (1000 * 60 * 60 * 24 * 365.25)
    ).toFixed(1),

    totalContributions:
      graphData.contributionsCollection?.contributionCalendar
        ?.totalContributions ?? 0,

    pinnedRepositories: graphData.pinnedItems?.nodes ?? [],

    mostUsedLanguage,

    languageCount,

    activity: {
      lastUpdated: lastUpdatedRepo ? lastUpdatedRepo.updated_at : null,
    },

    stats: {
      totalStars,

      totalForks,

      averageStars:
        repositories.length > 0
          ? (totalStars / repositories.length).toFixed(1)
          : 0,

      reposWithoutDescription,

      emptyRepos,
    },

    bestRepository: bestRepository
      ? {
          name: bestRepository.name,
          language: bestRepository.language,
          stars: bestRepository.stargazers_count,
          forks: bestRepository.forks_count,
          description: bestRepository.description,
        }
      : null,

    topRepositories,
  };
}

module.exports = {
  analyzeProfile,
};
