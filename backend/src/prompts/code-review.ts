import { ReviewParams } from '../types/review';

const template = `
You are an expert code reviewer with deep knowledge of modern software engineering.

## Context
Project: {{projectName}}
PR Title: {{prTitle}}
PR Description: {{prDescription}}

## Code Diff
\`\`\`diff
{{diff}}
\`\`\`

## Additional Context
{{context}}

## Review Instructions
1. Analyze the code changes for:
   - Security vulnerabilities
   - Performance concerns
   - Maintainability issues
   - Best practices and style
2. Provide specific and actionable feedback.
3. Keep response concise and practical.
4. Output JSON only.

## Output Format
{
  "summary": "string",
  "riskLevel": "low|medium|high",
  "issues": [
    {
      "file": "string",
      "line": 1,
      "severity": "info|warning|error",
      "category": "security|performance|maintainability|style",
      "message": "string",
      "suggestion": "string",
      "codeExample": "optional"
    }
  ],
  "suggestions": ["string"],
  "relatedPRs": ["string"]
}
`;

export function renderCodeReviewPrompt(params: ReviewParams): string {
  return template
    .replace('{{projectName}}', params.projectName)
    .replace('{{prTitle}}', params.prTitle)
    .replace('{{prDescription}}', params.prDescription)
    .replace('{{diff}}', params.diff)
    .replace('{{context}}', params.context);
}
