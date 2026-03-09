import swaggerJSDoc from 'swagger-jsdoc';

export const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CodeSage API',
      version: '1.0.0',
      description: 'AI 智能代码审查与知识管理平台 API 文档',
    },
    servers: [
      {
        url: 'http://localhost:4000',
      },
    ],
  },
  apis: ['src/routes/*.ts'],
});
