import { describe, expect, it } from 'vitest';

import { debtScannerService } from '../../src/services/debt-scanner';

describe('debtScannerService', () => {
  it('extracts debt comments', () => {
    const code = `// TODO: add retry\n// FIXME: handle edge case\nconst x = 1;`;

    const result = debtScannerService.scanFile('src/a.ts', code);

    expect(result).toHaveLength(2);
    expect(result[0].type).toBe('TODO');
    expect(result[1].type).toBe('FIXME');
  });
});
