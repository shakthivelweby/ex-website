const BLOCKED_STYLE_PROPS = new Set([
  "width",
  "min-width",
  "max-width",
  "white-space",
  "word-break",
  "overflow-wrap",
  "position",
]);

const PARAGRAPH_BREAK = "\u0000PARABREAK\u0000";

function stripTags(html) {
  return html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

function cleanInlineStyles(html) {
  const filterStyles = (styles) =>
    styles
      .split(";")
      .map((rule) => rule.trim())
      .filter((rule) => {
        if (!rule) return false;
        const prop = rule.split(":")[0]?.trim().toLowerCase();
        if (!prop || prop.startsWith("mso-")) return false;
        return !BLOCKED_STYLE_PROPS.has(prop);
      })
      .join("; ");

  return html
    .replace(/\sstyle="([^"]*)"/gi, (match, styles) => {
      const filtered = filterStyles(styles);
      return filtered ? ` style="${filtered}"` : "";
    })
    .replace(/\sstyle='([^']*)'/gi, (match, styles) => {
      const filtered = filterStyles(styles);
      return filtered ? ` style='${filtered}'` : "";
    });
}

/** Single <br> inside a line = space; double <br> = paragraph break. */
function normalizeLineBreaks(html) {
  return html
    .replace(/<br\s*\/?>\s*<br\s*\/?>/gi, PARAGRAPH_BREAK)
    .replace(/<br\s*\/?>/gi, " ");
}

/**
 * Only merge adjacent <p> tags when Quill/Word split a sentence across lines.
 * Never removes or deduplicates content.
 */
function shouldMergeParagraphs(prevInner, nextInner) {
  const prevText = stripTags(prevInner);
  const nextText = stripTags(nextInner);

  if (!prevText || !nextText) return false;

  const endsSentence = /[.!?:;)\]"']\s*$/.test(prevText);
  const startsLowerOrPunct = /^[a-z(,]/.test(nextText);

  if (!endsSentence) return true;
  if (startsLowerOrPunct) return true;

  return false;
}

function mergeSplitParagraphs(html) {
  let result = html
    .replace(/<p(?:\s[^>]*)?>\s*<br\s*\/?>\s*<\/p>/gi, "<p><br></p>")
    .replace(/<p(?:\s[^>]*)?>\s*<\/p>/gi, "<p><br></p>");

  let changed = true;
  while (changed) {
    changed = false;
    result = result.replace(
      /<p(?:\s[^>]*)?>([\s\S]*?)<\/p>\s*<p(?:\s[^>]*)?>([\s\S]*?)<\/p>/i,
      (full, prevInner, nextInner) => {
        if (shouldMergeParagraphs(prevInner, nextInner)) {
          changed = true;
          return `<p>${prevInner} ${nextInner}</p>`;
        }
        return full;
      }
    );
  }

  return result;
}

function restoreParagraphBreaks(html) {
  if (!html.includes(PARAGRAPH_BREAK)) return html;
  return html.replace(new RegExp(PARAGRAPH_BREAK, "g"), "</p><p>");
}

/** Collapse consecutive empty Quill spacer paragraphs before display. */
function collapseSpacerParagraphs(html) {
  let result = html
    .replace(/<p(?:\s[^>]*)?>\s*<\/p>/gi, "<p><br></p>")
    .replace(/<p(?:\s[^>]*)?>\s*<br\s*\/?>\s*<\/p>/gi, "<p><br></p>");

  result = result.replace(/(?:<p><br><\/p>\s*){2,}/gi, "<p><br></p>");

  return result;
}

/** Prepare Quill/TinyMCE HTML for display inside a constrained column. */
export function sanitizeRichText(html) {
  if (!html || typeof html !== "string") return "";

  let cleaned = cleanInlineStyles(html)
    .replace(/\u00AD/g, "")
    .replace(/&shy;/gi, "")
    .replace(/\u200B/g, "")
    .replace(/<wbr\s*\/?>/gi, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/\sdata-start="[^"]*"/gi, "")
    .replace(/\sdata-end="[^"]*"/gi, "");

  cleaned = normalizeLineBreaks(cleaned);
  cleaned = mergeSplitParagraphs(cleaned);
  cleaned = restoreParagraphBreaks(cleaned);
  cleaned = collapseSpacerParagraphs(cleaned);

  return cleaned.trim();
}
