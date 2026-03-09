export interface DebtFinding {
  type: 'TODO' | 'FIXME' | 'HACK' | 'XXX' | 'BUG';
  description: string;
  filePath: string;
  lineNumber: number;
}

const DEBT_PATTERNS: Array<{ type: DebtFinding['type']; regex: RegExp }> = [
  { type: 'TODO', regex: /TODO[:\s]+(.+)/i },
  { type: 'FIXME', regex: /FIXME[:\s]+(.+)/i },
  { type: 'HACK', regex: /HACK[:\s]+(.+)/i },
  { type: 'XXX', regex: /XXX[:\s]+(.+)/i },
  { type: 'BUG', regex: /BUG[:\s]+(.+)/i },
];

export class DebtScannerService {
  scanFile(filePath: string, content: string): DebtFinding[] {
    const findings: DebtFinding[] = [];
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      for (const pattern of DEBT_PATTERNS) {
        const matched = line.match(pattern.regex);
        if (matched) {
          findings.push({
            type: pattern.type,
            description: matched[1]?.trim() || `${pattern.type} item`,
            filePath,
            lineNumber: index + 1,
          });
        }
      }
    });

    return findings;
  }
}

export const debtScannerService = new DebtScannerService();
