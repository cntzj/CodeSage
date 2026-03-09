import { env } from '../../config/env';
import { logger } from '../../config/logger';

interface SlackMessage {
  text: string;
  blocks?: Array<Record<string, unknown>>;
}

export class SlackNotifier {
  async send(message: SlackMessage): Promise<void> {
    if (!env.SLACK_WEBHOOK_URL) {
      logger.info('Slack webhook not configured, skip notification');
      return;
    }

    const response = await fetch(env.SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      throw new Error(`Slack notification failed: ${response.status}`);
    }
  }

  async notifyReviewCompleted(project: string, prNumber: number, riskLevel: string): Promise<void> {
    await this.send({
      text: `CodeSage review completed for ${project}#${prNumber}`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Review Completed*\nProject: ${project}\nPR: #${prNumber}\nRisk: *${riskLevel}*`,
          },
        },
      ],
    });
  }
}

export const slackNotifier = new SlackNotifier();
