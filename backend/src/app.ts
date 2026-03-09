import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import type { Request } from 'express';

import { swaggerSpec } from './config/swagger';
import { errorHandler, notFoundHandler } from './middlewares/error-handler';
import { traceIdMiddleware } from './middlewares/trace-id';
import { router } from './routes';

export function createApp() {
  const app = express();

  app.use(traceIdMiddleware);
  app.use(helmet());
  app.use(cors());
  app.use(
    express.json({
      verify(req, _res, buffer) {
        (req as Request).rawBody = buffer.toString('utf8');
      },
    }),
  );

  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.use(router);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
