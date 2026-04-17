const INJECTION_PATTERNS = [
  /ignore\s+(previous|above|prior)\s+instructions?/gi,
  /\[INSTRUCTION\]/gi,
  /\[SYSTEM\]/gi,
  /###\s*system/gi,
  /<\|im_start\|>/gi,
  /<\|im_end\|>/gi,
  /system\s*prompt/gi,
  /you\s+are\s+now/gi,
  /act\s+as\s+(?:if\s+you\s+are|a\s+different)/gi,
  /forget\s+(everything|all|your)/gi,
];

export function sanitize(input: string): string {
  if (!input) return "";

  let sanitized = input.trim();

  for (const pattern of INJECTION_PATTERNS) {
    sanitized = sanitized.replace(pattern, "[제거됨]");
  }

  // Escape backticks and angle brackets that could break prompt structure
  sanitized = sanitized
    .replace(/`{3,}/g, "```")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  return sanitized.slice(0, 500);
}
