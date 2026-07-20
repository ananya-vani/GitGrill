async function getGitHubRESTData(username) {
  // User Profile
  const userResponse = await fetch(`https://api.github.com/users/${username}`);

  if (!userResponse.ok) {
    throw new Error(`GitHub user "${username}" not found.`);
  }

  const user = await userResponse.json();

  // Public Repositories (Owned Only)
  const repoResponse = await fetch(
    `https://api.github.com/users/${username}/repos?per_page=100&type=owner&sort=updated`,
  );

  if (!repoResponse.ok) {
    throw new Error(
      `Failed to fetch repositories. GitHub responded with ${repoResponse.status}.`,
    );
  }

  const repositories = await repoResponse.json();

  return {
    user,
    repositories,
  };
}

module.exports = {
  getGitHubRESTData,
};
