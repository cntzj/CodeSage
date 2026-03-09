import { describe, expect, it } from 'vitest';

import { parseDiff } from '../../src/utils/diff-parser';

describe('parseDiff', () => {
  it('parses unified diff chunks', () => {
    const diff = `diff --git a/src/utils/helper.ts b/src/utils/helper.ts\nindex 123..456 100644\n--- a/src/utils/helper.ts\n+++ b/src/utils/helper.ts\n@@ -10,2 +10,2 @@\n-  return a + b;\n+  return a + b + c;`;

    const chunks = parseDiff(diff);

    expect(chunks).toHaveLength(1);
    expect(chunks[0].filePath).toBe('src/utils/helper.ts');
    expect(chunks[0].changes.some((change) => change.type === 'added')).toBe(true);
  });
});
