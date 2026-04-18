import { LanguageStats } from "./getLanguageStats.js";


/** Generates an SVG card displaying language statistics  
*/
export function generateLanguageCard(languageStats: LanguageStats, color_scheme?: string): string {
    const isDark = color_scheme !== 'light';

    const bg           = isDark ? '#1e293b' : '#f8fafc';
    const accent       = isDark ? '#ade8f4' : '#16a34a';
    const dividerColor = isDark ? '#ade8f4' : '#cbd5e1';
    const dividerW     = isDark ? '0.5'     : '1';
    const dividerOp    = isDark ? '0.18'    : '1';

    const top10     = Object.entries(languageStats.languages).slice(0, 10);
    const leftCol   = top10.slice(0, 5);
    const rightCol  = top10.slice(5);
    const hasRight  = rightCol.length > 0;

    const ROW_H  = 26;
    const START_Y = 72;
    const rows   = Math.max(leftCol.length, rightCol.length);
    const height = START_Y + (rows - 1) * ROW_H + 30;

    const renderCol = (
        col: [string, [number, string]][],
        startIdx: number,
        xNum: number,
        xName: number,
        xPct: number
    ): string =>
        col.map(([lang, [, pct]], i) => {
            const y       = START_Y + i * ROW_H;
            const num     = startIdx + i;
            const nameX   = num >= 10 ? xName + 6 : xName; // nudge name for double-digit
            return `
  <text x="${xNum}"  y="${y}" fill="${accent}" font-size="12"  font-family="'Trebuchet MS', 'Segoe UI', sans-serif" opacity="0.4">${num}.</text>
  <text x="${nameX}" y="${y}" fill="${accent}" font-size="14" font-family="'Trebuchet MS', 'Segoe UI', sans-serif" font-weight="600">${lang}</text>
  <text x="${xPct}"  y="${y}" fill="${accent}" font-size="12" font-family="'Trebuchet MS', 'Segoe UI', sans-serif" opacity="0.65" text-anchor="end">${pct}</text>`;
        }).join('');

    return `<svg width="460" height="${height}" viewBox="0 0 460 ${height}" xmlns="http://www.w3.org/2000/svg">

  <!-- Background -->
  <rect width="100%" height="100%" rx="4" fill="${bg}"/>

  <!-- Title -->
  <text x="230" y="32" fill="${accent}" font-size="12" font-family="'Trebuchet MS', 'Segoe UI', sans-serif" font-weight="600" text-anchor="middle" letter-spacing="3" opacity="0.65">TOP LANGUAGES</text>

  <!-- Top Divider -->
  <line x1="24" y1="46" x2="436" y2="46" stroke="${dividerColor}" stroke-width="${dividerW}" opacity="${dividerOp}"/>

  ${hasRight ? `<!-- Vertical Divider -->
  <line x1="228" y1="54" x2="228" y2="${height - 12}" stroke="${dividerColor}" stroke-width="${dividerW}" opacity="${dividerOp}"/>` : ''}

  <!-- Left Column -->
  ${renderCol(leftCol as [string, [number, string]][], 1, 24, 38, 220)}

  ${hasRight ? `<!-- Right Column -->
  ${renderCol(rightCol as [string, [number, string]][], 6, 240, 254, 444)}` : ''}

</svg>`;
}