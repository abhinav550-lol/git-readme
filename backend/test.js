const GITHUB_TOKEN = "YOUR_GITHUB_TOKEN";

const query = `
query GitHubStatsCard($login: String!, $from: DateTime!, $to: DateTime!) {
  user(login: $login) {
    name
    avatarUrl

    contributionsCollection(from: $from, to: $to) {
      totalCommitContributions
      totalPullRequestContributions
      totalIssueContributions
    }

    repositories(first: 100, isFork: false, ownerAffiliations: OWNER) {
      nodes {
        name
        stargazerCount
        languages(first: 5, orderBy: { field: SIZE, direction: DESC }) {
          edges {
            size
            node {
              name
            }
          }
        }
      }
    }
  }
}
`;

const variables = {
  login: "abhinav550-lol",
  from: "2026-01-01T00:00:00Z",
  to: "2026-12-31T23:59:59Z",
};

async function run() {
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GITHUB_TOKEN}`,
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  const data = await res.json();
  console.log(JSON.stringify(data, null, 2)); 
}

run();