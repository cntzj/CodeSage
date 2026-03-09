import { Router } from 'express';

import { dashboardController } from '../controllers/dashboard.controller';
import { debtController } from '../controllers/debt.controller';
import { healthController } from '../controllers/health.controller';
import { knowledgeController } from '../controllers/knowledge.controller';
import { projectController } from '../controllers/project.controller';
import { pullRequestController } from '../controllers/pull-request.controller';
import { webhookController } from '../controllers/webhook.controller';
import { verifyGitHubWebhook } from '../middlewares/verify-webhook';
import { asyncHandler } from '../utils/async-handler';

export const router = Router();

/**
 * @openapi
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     responses:
 *       200:
 *         description: Service is healthy
 */
router.get('/health', healthController);

/**
 * @openapi
 * /webhooks/github:
 *   post:
 *     summary: Receive GitHub webhook events
 *     responses:
 *       200:
 *         description: Webhook processed successfully
 */
router.post('/webhooks/github', verifyGitHubWebhook, asyncHandler(webhookController.handleGitHubWebhook.bind(webhookController)));

router.get('/api/projects', asyncHandler(projectController.list.bind(projectController)));
router.get('/api/projects/:id', asyncHandler(projectController.get.bind(projectController)));
router.post('/api/projects', asyncHandler(projectController.create.bind(projectController)));
router.put('/api/projects/:id/config', asyncHandler(projectController.updateConfig.bind(projectController)));
router.delete('/api/projects/:id', asyncHandler(projectController.remove.bind(projectController)));

router.get('/api/projects/:id/pull-requests', asyncHandler(pullRequestController.listByProject.bind(pullRequestController)));
router.get('/api/projects/:id/pull-requests/:prNumber', asyncHandler(pullRequestController.getByNumber.bind(pullRequestController)));
router.get('/api/pull-requests/:id', asyncHandler(pullRequestController.get.bind(pullRequestController)));
router.get('/api/pull-requests/:id/review', asyncHandler(pullRequestController.getReview.bind(pullRequestController)));
router.post('/api/pull-requests/:id/review', asyncHandler(pullRequestController.triggerReview.bind(pullRequestController)));

router.get('/api/projects/:id/knowledge/nodes', asyncHandler(knowledgeController.getNodes.bind(knowledgeController)));
router.get('/api/projects/:id/knowledge/graph', asyncHandler(knowledgeController.getGraph.bind(knowledgeController)));
router.get('/api/knowledge/search', asyncHandler(knowledgeController.semanticSearch.bind(knowledgeController)));

router.get('/api/projects/:id/debts', asyncHandler(debtController.list.bind(debtController)));
router.get('/api/projects/:id/debts/stats', asyncHandler(debtController.stats.bind(debtController)));
router.put('/api/debts/:id', asyncHandler(debtController.update.bind(debtController)));

router.get('/api/projects/:id/dashboard', asyncHandler(dashboardController.overview.bind(dashboardController)));
