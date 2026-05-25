const ISSUE_ID_RE = /\b([A-Z]{2,10}-\d+)\b/i;
const LINEAR_URL_RE =
  /linear\.app\/[^/]+\/issue\/([A-Z]{2,10}-\d+)/i;

export function parseLinearIssueId(text: string): string | null {
  const urlMatch = text.match(LINEAR_URL_RE);
  if (urlMatch?.[1]) return urlMatch[1].toUpperCase();

  const idMatch = text.match(ISSUE_ID_RE);
  if (idMatch?.[1]) return idMatch[1].toUpperCase();

  return null;
}

export function messageReferencesLinearIssue(text: string): boolean {
  const lower = text.toLowerCase();
  if (parseLinearIssueId(text)) return true;
  return (
    lower.includes("linear.app") ||
    /\b(desde|from)\s+[a-z]{2,10}-\d+/i.test(text) ||
    /\blinear\b/.test(lower) && ISSUE_ID_RE.test(text)
  );
}
