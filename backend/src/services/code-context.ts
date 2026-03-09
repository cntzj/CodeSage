import { PRFile } from '../types/github';
import { gitHubClientService } from './github/client';

interface BuildContextParams {
  installationId: number;
  owner: string;
  repo: string;
  prNumber: number;
  baseRef: string;
}

function truncate(content: string, maxLength = 3000): string {
  return content.length <= maxLength ? content : `${content.slice(0, maxLength)}\n...<truncated>`;
}

export class CodeContextService {
  async buildContext(params: BuildContextParams): Promise<string> {
    const files = await gitHubClientService.listPullRequestFiles(
      params.installationId,
      params.owner,
      params.repo,
      params.prNumber,
    );

    const candidateFiles = files.filter((file) => !file.filename.endsWith('.lock')).slice(0, 10);

    const snippets = await Promise.all(
      candidateFiles.map(async (file: PRFile) => {
        try {
          const content = await gitHubClientService.getFileContent(
            params.installationId,
            params.owner,
            params.repo,
            file.filename,
            params.baseRef,
          );

          return `\n### ${file.filename}\n${truncate(content)}`;
        } catch {
          return `\n### ${file.filename}\n<unable to fetch content>`;
        }
      }),
    );

    return snippets.join('\n');
  }
}

export const codeContextService = new CodeContextService();
