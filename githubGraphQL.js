let graphqlWithAuth;

const GET_PROFILE_QUERY = `
query($login: String!) {
  user(login: $login) {
    login

    followers {
      totalCount
    }

    contributionsCollection {
      contributionCalendar {
        totalContributions
      }
    }

    pinnedItems(first: 6, types: REPOSITORY) {
      nodes {
        ... on Repository {
          name
          stargazerCount
          forkCount
          primaryLanguage {
            name
          }
        }
      }
    }
  }
}
`;

async function getGitHubGraphData(username) {
  try {
    if (!graphqlWithAuth) {
      const { graphql } = await import("@octokit/graphql");

      graphqlWithAuth = graphql.defaults({
        headers: {
          authorization: `token ${process.env.GITHUB_TOKEN}`,
        },
      });
    }

    const data = await graphqlWithAuth(GET_PROFILE_QUERY, {
      login: username,
    });

    if (!data.user) {
      throw new Error("GitHub GraphQL returned no user.");
    }

    return data.user;
  } catch (error) {
    throw new Error(`Failed to fetch GitHub GraphQL data: ${error.message}`);
  }
}

module.exports = {
  getGitHubGraphData,
};
