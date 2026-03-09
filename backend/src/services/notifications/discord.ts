import { env } from '../../config/env';
import { logger } from '../../config/logger';

export class DiscordNotifier {
  async send(content: string): Promise<void> {
    if (!env.DISCORD_WEBHOOK_URL) {
      logger.info('Discord webhook not configured, skip notification');
      return;
    }

    const response = await fetch(env.DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      throw new Error(`Discord notification failed: ${response.status}`);
    }
  }
}

export const discordNotifier = new DiscordNotifier();
