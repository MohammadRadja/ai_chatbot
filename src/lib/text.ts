export function normalizeText(value: string) {
  return value
    .replace(/\u00a0/g, " ")
    .replace(/[\t ]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function normalizeForSearch(value: string) {
  return normalizeText(value)
    .toLocaleLowerCase()
    .replace(/[^\p{L}\p{N}$€£]+/gu, " ")
    .trim();
}

export function tokenize(value: string) {
  return normalizeForSearch(value)
    .split(/\s+/)
    .filter((token) => token.length > 1);
}

export function excerpt(value: string, maxLength = 420) {
  const normalized = normalizeText(value);
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength).replace(/\s+\S*$/, "")}…`;
}
