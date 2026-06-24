/** True when a stored filename exists (not null/empty). */
export function hasStoredImage(filename) {
  return Boolean(filename && String(filename).trim());
}

/** Pick the first usable image URL from candidates with matching filename fields. */
export function pickImageSource(candidates = []) {
  for (const { url, filename } of candidates) {
    if (hasStoredImage(filename) && url && String(url).trim()) {
      return { url: String(url).trim(), filename: String(filename).trim() };
    }
  }
  return null;
}
