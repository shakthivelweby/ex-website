"use client";

import { prepareRichHtml } from "@/utils/sanitizeRichText";

/**
 * Renders CMS HTML on detail pages.
 *
 * IMPORTANT: Renders synchronously from props — never defer with useEffect,
 * or content can fail to appear (empty About/Terms sections).
 */
const RichTextContent = ({ html, className = "", as: Tag = "div" }) => {
  const safeHtml = prepareRichHtml(html);

  if (!safeHtml) return null;

  return (
    <Tag
      className={`render-html w-full min-w-0 max-w-full text-sm leading-relaxed text-gray-700 ${className}`}
      dangerouslySetInnerHTML={{ __html: safeHtml }}
      suppressHydrationWarning
    />
  );
};

export default RichTextContent;
