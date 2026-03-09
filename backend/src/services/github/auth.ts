import { createAppAuth } from '@octokit/auth-app';

import { env } from '../../config/env';

export class GitHubAuthService {
  private auth =
    env.GITHUB_APP_ID && env.GITHUB_PRIVATE_KEY
      ? createAppAuth({
          appId: env.GITHUB_APP_ID,
          privateKey: env.GITHUB_PRIVATE_KEY.replace(/\\n/g, '\n'),
        })
      : null;

  async getInstallationToken(installationId: number): Promise<string> {
    if (!this.auth) {
      throw new Error('GitHub App is not configured. Set GITHUB_APP_ID and GITHUB_PRIVATE_KEY.');
    }

    const result = await this.auth({
      type: 'installation',
      installationId,
    });

    if (!('token' in result)) {
      throw new Error('Unable to acquire installation token.');
    }

    return result.token;
  }
}

export const gitHubAuthService = new GitHubAuthService();
