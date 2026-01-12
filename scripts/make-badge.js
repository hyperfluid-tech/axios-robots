const fs = require('fs');
const path = require('path');

const summaryPath = path.join(__dirname, '../coverage/coverage-summary.json');
const badgePath = path.join(__dirname, '../badges/coverage.svg');
const badgesDir = path.dirname(badgePath);

if (!fs.existsSync(badgesDir)) {
  fs.mkdirSync(badgesDir, { recursive: true });
}

// Read coverage summary
let coverage = 0;
try {
  const summary = require(summaryPath);
  coverage = summary.total.lines.pct;
} catch (e) {
  console.error('Could not read coverage-summary.json:', e);
  process.exit(1);
}

// Determine color
let color = '#e05d44'; // red
if (coverage >= 90) color = '#4c1'; // brightgreen
else if (coverage >= 80) color = '#dfb317'; // yellow
else if (coverage >= 70) color = '#fe7d37'; // orange

// Format coverage: round to 1 decimal place to keep it compact but precise, or integer.
// Let's use integer for cleaner badge, or 1 decimal if useful.
// "97.1%" is 5 chars. "100%" is 4 chars.
// Let's slightly widen the badge and maybe round to integer.
const formattedCoverage = Math.floor(coverage) + '%'; 

// Dimensions
const leftWidth = 65;  // "coverage"
const rightWidth = 40; // percentage
const width = leftWidth + rightWidth;

// Generate SVG
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="20">
  <linearGradient id="b" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>
  <mask id="a">
    <rect width="${width}" height="20" rx="3" fill="#fff"/>
  </mask>
  <g mask="url(#a)">
    <path fill="#555" d="M0 0h${leftWidth}v20H0z"/>
    <path fill="${color}" d="M${leftWidth} 0h${rightWidth}v20H${leftWidth}z"/>
    <path fill="url(#b)" d="M0 0h${width}v20H0z"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="DejaVu Sans,Verdana,Geneva,sans-serif" font-size="11">
    <text x="${leftWidth / 2}" y="15" fill="#010101" fill-opacity=".3">coverage</text>
    <text x="${leftWidth / 2}" y="14">coverage</text>
    <text x="${leftWidth + (rightWidth / 2)}" y="15" fill="#010101" fill-opacity=".3">${formattedCoverage}</text>
    <text x="${leftWidth + (rightWidth / 2)}" y="14">${formattedCoverage}</text>
  </g>
</svg>`;

fs.writeFileSync(badgePath, svg);
console.log(`Badge generated at ${badgePath} (${formattedCoverage})`);
