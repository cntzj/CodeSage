import { DiffChunk, DiffChange } from '../types/review';

function parseHunkHeader(line: string): {
  oldStart: number;
  oldLines: number;
  newStart: number;
  newLines: number;
} {
  const match = line.match(/@@ -(\d+),(\d+) \+(\d+),(\d+) @@/);
  if (!match) {
    throw new Error(`Invalid hunk header: ${line}`);
  }

  return {
    oldStart: Number(match[1]),
    oldLines: Number(match[2]),
    newStart: Number(match[3]),
    newLines: Number(match[4]),
  };
}

export function parseDiff(diff: string): DiffChunk[] {
  const lines = diff.split('\n');
  const chunks: DiffChunk[] = [];

  let currentFile = '';
  let currentChunk: DiffChunk | null = null;
  let oldLine = 0;
  let newLine = 0;

  const flushChunk = () => {
    if (currentChunk) {
      chunks.push(currentChunk);
      currentChunk = null;
    }
  };

  for (const line of lines) {
    if (line.startsWith('diff --git')) {
      flushChunk();
      const parts = line.split(' ');
      const targetPath = parts[3] ?? '';
      currentFile = targetPath.startsWith('b/') ? targetPath.slice(2) : targetPath;
      continue;
    }

    if (line.startsWith('Binary files')) {
      flushChunk();
      continue;
    }

    if (line.startsWith('@@')) {
      flushChunk();
      const { oldStart, oldLines, newStart, newLines } = parseHunkHeader(line);
      oldLine = oldStart;
      newLine = newStart;
      currentChunk = {
        filePath: currentFile,
        oldStart,
        oldLines,
        newStart,
        newLines,
        changes: [],
      };
      continue;
    }

    if (!currentChunk) {
      continue;
    }

    let change: DiffChange;
    if (line.startsWith('+')) {
      change = {
        type: 'added',
        lineNumber: newLine,
        content: line.slice(1),
      };
      newLine += 1;
    } else if (line.startsWith('-')) {
      change = {
        type: 'removed',
        lineNumber: oldLine,
        content: line.slice(1),
      };
      oldLine += 1;
    } else {
      change = {
        type: 'context',
        lineNumber: newLine,
        content: line.startsWith(' ') ? line.slice(1) : line,
      };
      oldLine += 1;
      newLine += 1;
    }

    currentChunk.changes.push(change);
  }

  flushChunk();
  return chunks;
}
