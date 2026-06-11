import {
  ILLUSTRATION_COUNT,
  STYLES,
  type Illustration,
} from "./openai-illustration";

/**
 * Dev-only placeholder illustrations so the pick-an-image flow works without an
 * OPENAI_API_KEY. Returns simple SVG data URIs in distinct styles/colours
 * (deterministic per index).
 */

const PALETTE = [
  { bg: "#f1ede1", shape: "#9e3322" },
  { bg: "#f6efd9", shape: "#234e9e" },
  { bg: "#f7f0e6", shape: "#2f7a5f" },
  { bg: "#f1ebe0", shape: "#b0894a" },
];

function placeholderSvg(objectName: string, styleId: string, i: number): string {
  const { bg, shape } = PALETTE[i % PALETTE.length];
  const label = objectName.trim().slice(0, 28) || "Hiện vật";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="${bg}"/>
  <circle cx="256" cy="232" r="120" fill="${shape}" opacity="0.85"/>
  <rect x="156" y="356" width="200" height="14" rx="7" fill="${shape}" opacity="0.35"/>
  <text x="256" y="436" text-anchor="middle" font-family="sans-serif" font-size="26" fill="#3a2a1e">${escapeXml(
    label,
  )}</text>
  <text x="256" y="470" text-anchor="middle" font-family="monospace" font-size="13" fill="#6b5a4e" letter-spacing="2">MOCK · ${escapeXml(
    styleId,
  )}</text>
</svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** `ILLUSTRATION_COUNT` deterministic placeholder candidates, varied styles. */
export function generateMockIllustrations(objectName: string): Illustration[] {
  return Array.from({ length: ILLUSTRATION_COUNT }, (_, i) => {
    const style = STYLES[i % STYLES.length];
    return {
      url: placeholderSvg(objectName, style.id, i),
      style: style.id,
    };
  });
}
