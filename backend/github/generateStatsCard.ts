import {ContributionsInterface} from "./getContributionStats.js"


function generateDarkModeCard(contributionsData: ContributionsInterface): string {
	return `
	<svg width="500" height="230" viewBox="0 0 500 230" xmlns="http://www.w3.org/2000/svg">

  <!-- Background -->
  <rect width="100%" height="100%" rx="4" fill="#1e293b"/>

  <!-- Title -->
  <text x="250" y="32" fill="#ade8f4" font-size="16" font-family="'Trebuchet MS', 'Segoe UI', sans-serif" font-weight="600" text-anchor="middle" letter-spacing="3" opacity="0.65">
    CONTRIBUTION STATS
  </text>

  <!-- Top Divider -->
  <line x1="24" y1="46" x2="476" y2="46" stroke="#ade8f4" stroke-width="0.5" opacity="0.18"/>

  <!-- Rank Circle -->
  <circle cx="98" cy="122" r="56" fill="none" stroke="#ade8f4" stroke-width="1.8" opacity="0.85"/>
  <circle cx="98" cy="122" r="51" fill="#0f172a" opacity="0.85"/>

  <!-- RANK label -->
  <text x="98" y="106" fill="#ade8f4" font-size="10" font-family="'Trebuchet MS', 'Segoe UI', sans-serif" font-weight="600" text-anchor="middle" letter-spacing="3" opacity="0.55">
    RANK
  </text>

  <!-- Rank Character -->
  <text x="98" y="144" fill="#ade8f4" font-size="44" font-family="'Trebuchet MS', 'Segoe UI', sans-serif" font-weight="700" text-anchor="middle">
    ${contributionsData.rank}
  </text>

  <!-- Vertical Divider -->
  <line x1="178" y1="56" x2="178" y2="200" stroke="#ade8f4" stroke-width="0.5" opacity="0.18"/>

  <!-- Total Contributions Block -->
  <text x="202" y="80" fill="#ade8f4" font-size="14" font-family="'Trebuchet MS', 'Segoe UI', sans-serif" letter-spacing="2" opacity="0.55">
    TOTAL CONTRIBUTIONS
  </text>
  <text x="202" y="112" fill="#ade8f4" font-size="30" font-family="'Trebuchet MS', 'Segoe UI', sans-serif" font-weight="700">
    ${contributionsData.totalContributions}
  </text>

  <text x="202" y="128" fill="#ade8f4" font-size="11" font-family="'Trebuchet MS', 'Segoe UI', sans-serif" opacity="0.45" letter-spacing="0.5">
    ${contributionsData.accountCreationDate} – Present
  </text>

  <!-- Mid Divider -->
  <line x1="190" y1="140" x2="480" y2="140" stroke="#ade8f4" stroke-width="0.4" opacity="0.15"/>

  <!-- Max Streak Label -->
  <text x="202" y="158" fill="#ade8f4" font-size="14" font-family="'Trebuchet MS', 'Segoe UI', sans-serif" letter-spacing="2" opacity="0.55">
    MAX STREAK
  </text>

  <!-- Max Streak Number -->
  <text x="202" y="180" fill="#ade8f4" font-size="24" font-family="'Trebuchet MS', 'Segoe UI', sans-serif" font-weight="700">
    ${contributionsData.maxStreak} days
  </text>

</svg>
	`;
}
function generateLightModeCard(contributionsData: ContributionsInterface): string {
	return `
	<svg width="500" height="230" viewBox="0 0 500 230" xmlns="http://www.w3.org/2000/svg">

  <!-- Background -->
  <rect width="100%" height="100%" rx="4" fill="#f8fafc"/>

  <!-- Title -->
  <text x="250" y="32" fill="#334155" font-size="16" font-family="'Trebuchet MS', 'Segoe UI', sans-serif" font-weight="600" text-anchor="middle" letter-spacing="3" opacity="0.75">
    CONTRIBUTION STATS
  </text>

  <!-- Top Divider -->
  <line x1="24" y1="46" x2="476" y2="46" stroke="#cbd5e1" stroke-width="1" opacity="1"/>

  <!-- Rank Circle -->
  <circle cx="98" cy="122" r="56" fill="none" stroke="#16a34a" stroke-width="2" opacity="0.9"/>
  <circle cx="98" cy="122" r="51" fill="#f0fdf4" opacity="1"/>

  <!-- RANK label -->
  <text x="98" y="106" fill="#16a34a" font-size="10" font-family="'Trebuchet MS', 'Segoe UI', sans-serif" font-weight="600" text-anchor="middle" letter-spacing="3" opacity="0.8">
    RANK
  </text>

  <!-- Rank Character -->
  <text x="98" y="144" fill="#15803d" font-size="44" font-family="'Trebuchet MS', 'Segoe UI', sans-serif" font-weight="700" text-anchor="middle">
    ${contributionsData.rank}
  </text>

  <!-- Vertical Divider -->
  <line x1="178" y1="56" x2="178" y2="200" stroke="#cbd5e1" stroke-width="1" opacity="1"/>

  <!-- Total Contributions Label -->
  <text x="202" y="80" fill="#64748b" font-size="14" font-family="'Trebuchet MS', 'Segoe UI', sans-serif" letter-spacing="2">
    TOTAL CONTRIBUTIONS
  </text>

  <!-- Total Contributions Number -->
  <text x="202" y="112" fill="#15803d" font-size="30" font-family="'Trebuchet MS', 'Segoe UI', sans-serif" font-weight="700">
    ${contributionsData.totalContributions}
  </text>

  <!-- Date Range -->
  <text x="202" y="128" fill="#94a3b8" font-size="11" font-family="'Trebuchet MS', 'Segoe UI', sans-serif" letter-spacing="0.5">
    ${contributionsData.accountCreationDate} – Present
  </text>

  <!-- Mid Divider -->
  <line x1="190" y1="140" x2="480" y2="140" stroke="#cbd5e1" stroke-width="1" opacity="1"/>

  <!-- Max Streak Label -->
  <text x="202" y="158" fill="#64748b" font-size="14" font-family="'Trebuchet MS', 'Segoe UI', sans-serif" letter-spacing="2">
    MAX STREAK
  </text>

  <!-- Max Streak Number -->
  <text x="202" y="180" fill="#15803d" font-size="24" font-family="'Trebuchet MS', 'Segoe UI', sans-serif" font-weight="700">
    ${contributionsData.maxStreak} days
  </text>

</svg>
	`;
}


/** Generate SVG Card Using The Data*/
export function generateContributionStatsCard(contributionsData : ContributionsInterface , color_scheme: string = "dark") : string {
	return color_scheme === "light" ? generateLightModeCard(contributionsData) : generateDarkModeCard(contributionsData);;
}