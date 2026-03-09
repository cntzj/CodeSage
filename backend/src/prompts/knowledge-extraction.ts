export function renderKnowledgeExtractionPrompt(filePath: string, language: string, code: string): string {
  return `
Analyze the following code and extract key knowledge entities.

## File Path
${filePath}

## Code
\`\`\`${language}
${code}
\`\`\`

## Instructions
1. Identify key functions, classes, and modules.
2. Describe each entity in 1-2 short sentences.
3. Identify dependencies and relationships.
4. Output concise JSON.

## Output Format
{
  "entities": [
    {
      "type": "function|class|module",
      "name": "string",
      "description": "string",
      "lineStart": 1,
      "lineEnd": 2,
      "dependencies": ["string"]
    }
  ],
  "relations": [
    {
      "source": "string",
      "target": "string",
      "type": "calls|extends|imports|uses"
    }
  ]
}
`;
}
