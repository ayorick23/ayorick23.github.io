/** `code` → <code>, **bold** → <strong>, *italic* → <em>. Order matters: bold before italic so ** isn't eaten by the single-* pattern. */
function renderInlineText(raw: string): string {
  const escaped = raw.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return escaped
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>");
}

/**
 * Splits a section body into blank-line-separated blocks, rendering each as a
 * paragraph or a `-`/`1.` list, with inline formatting applied per line.
 */
export function renderBody(raw: string): string {
  const blocks = raw.trim().split(/\n{2,}/);
  return blocks
    .map((block) => {
      const lines = block
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);
      const isBulletList = lines.every((line) => /^[-*]\s+/.test(line));
      const isOrderedList = lines.every((line) => /^\d+\.\s+/.test(line));

      if (isBulletList) {
        const items = lines.map((line) => `<li>${renderInlineText(line.replace(/^[-*]\s+/, ""))}</li>`).join("");
        return `<ul>${items}</ul>`;
      }
      if (isOrderedList) {
        const items = lines.map((line) => `<li>${renderInlineText(line.replace(/^\d+\.\s+/, ""))}</li>`).join("");
        return `<ol>${items}</ol>`;
      }
      return `<p>${renderInlineText(lines.join(" "))}</p>`;
    })
    .join("");
}
