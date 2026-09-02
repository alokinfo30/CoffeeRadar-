/**
 * Enterprise Defense-in-Depth Security: PromptGuard
 * Defends against prompt injection, jailbreaking (DAN mode, developer mode, system overrides),
 * instruction hijacking, and leaks. Enforces XML boundary isolation (<user_query>) and API key redaction.
 */

export interface PromptGuardScanResult {
  isSafe: boolean;
  threatLevel: 'CLEAN' | 'SUSPICIOUS' | 'CRITICAL_BLOCK';
  threatScore: number; // 0 to 100
  flaggedPatterns: string[];
  sanitizedQuery: string;
  wrappedUserQuery: string;
  reasons: string[];
}

const INJECTION_PATTERNS: { regex: RegExp; description: string; weight: number }[] = [
  { regex: /ignore\s+(all\s+)?(previous|prior|above)\s+(instructions|directives|prompts|rules)/i, description: 'Instruction Override / Memory Erasure Attempt', weight: 85 },
  { regex: /you\s+are\s+now\s+(in\s+)?(dan\s+mode|developer\s+mode|jailbreak|unrestricted|god\s+mode)/i, description: 'DAN Mode / Persona Hijack Attack', weight: 95 },
  { regex: /system\s+prompt\s+(leak|dump|reveal|output|display|show)/i, description: 'System Prompt Extraction', weight: 80 },
  { regex: /reveal\s+(the\s+)?(gemini|api|secret|internal)\s+(key|token|password|credential)/i, description: 'API Key Exfiltration Attempt', weight: 90 },
  { regex: /<script[\s\S]*?>[\s\S]*?<\/script>/i, description: 'Cross-Site Scripting Injection', weight: 90 },
  { regex: /eval\s*\(/i, description: 'Code Execution Payload', weight: 85 },
  { regex: /bypass\s+(safety|content|security)\s+(filters|checks|policy)/i, description: 'Safety Bypass Request', weight: 90 },
  { regex: /disregard\s+(your\s+)?(guidelines|guardrails|safety)/i, description: 'Guardrail Disregard', weight: 85 },
  { regex: /base64\s+decode|rot13|hex\s+decode/i, description: 'Encoded Obfuscation Bypass', weight: 60 }
];

export class PromptGuard {
  /**
   * Scans user input for prompt injection and jailbreak payloads.
   */
  public static scan(rawInput: string): PromptGuardScanResult {
    if (!rawInput || typeof rawInput !== 'string') {
      return {
        isSafe: true,
        threatLevel: 'CLEAN',
        threatScore: 0,
        flaggedPatterns: [],
        sanitizedQuery: '',
        wrappedUserQuery: '<user_query></user_query>',
        reasons: []
      };
    }

    const trimmed = rawInput.trim();
    let totalScore = 0;
    const flagged: string[] = [];
    const reasons: string[] = [];

    for (const pattern of INJECTION_PATTERNS) {
      if (pattern.regex.test(trimmed)) {
        flagged.push(pattern.description);
        reasons.push(`Detected pattern matching ${pattern.description}`);
        totalScore += pattern.weight;
      }
    }

    // Check for excessive repetitive control tags or closing XML tags intended to break isolation
    if (/<\/user_query>/i.test(trimmed) || /<\/system>/i.test(trimmed) || /<\/context>/i.test(trimmed)) {
      flagged.push('XML Tag Boundary Smuggling');
      reasons.push('Attempted to prematurely close XML boundary isolation tags');
      totalScore += 75;
    }

    // Sanitize the query to neutralize any nested XML tags
    const sanitized = trimmed
      .replace(/<\/?user_query>/gi, '[STRIPPED_TAG]')
      .replace(/<\/?system>/gi, '[STRIPPED_TAG]')
      .replace(/<\/?context>/gi, '[STRIPPED_TAG]');

    // Enforce XML boundary isolation
    const wrapped = `<user_query>\n${sanitized}\n</user_query>`;

    const isSafe = totalScore < 60;
    const threatLevel: 'CLEAN' | 'SUSPICIOUS' | 'CRITICAL_BLOCK' =
      totalScore >= 75 ? 'CRITICAL_BLOCK' : totalScore >= 40 ? 'SUSPICIOUS' : 'CLEAN';

    return {
      isSafe,
      threatLevel,
      threatScore: Math.min(100, totalScore),
      flaggedPatterns: flagged,
      sanitizedQuery: sanitized,
      wrappedUserQuery: wrapped,
      reasons
    };
  }

  /**
   * Scans model output text to redact any leaked API keys, tokens, or system canary strings.
   */
  public static redactSensitiveOutput(text: string): string {
    if (!text || typeof text !== 'string') return '';

    return text
      // Redact standard Google / Gemini API keys (e.g. AIzaSy...)
      .replace(/AIza[0-9A-Za-z-_]{35}/g, '[REDACTED_GEMINI_API_KEY]')
      // Redact generic sk- or Bearer tokens
      .replace(/(?:sk-|Bearer\s+)[0-9A-Za-z-_]{20,}/gi, '[REDACTED_API_TOKEN]')
      // Redact private environment references
      .replace(/process\.env\.[A-Z_]+/g, '[REDACTED_ENV_VAR]')
      // Redact potential password assignments
      .replace(/(?:password|secret|apiKey)\s*=\s*['"][^'"]+['"]/gi, 'apiKey="[REDACTED]"');
  }
}
