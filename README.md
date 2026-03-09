# CodeSage

CodeSage 是一个 AI 驱动的代码审查与知识管理平台，包含以下核心能力：

1. GitHub PR 自动审查（Webhook 触发 + 队列）
2. 代码知识图谱提取与可视化
3. TODO/FIXME 技术债务扫描与看板管理
4. Web Dashboard（PR、Graph、Debt、Settings）

## 项目结构

```text
.
├── backend/                     # Node.js + TypeScript + Express + Prisma
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── services/
│   │   ├── queues/
│   │   ├── utils/
│   │   └── app.ts / server.ts
│   ├── prisma/schema.prisma
│   └── tests/
├── frontend/                    # Next.js 14 + Tailwind
│   ├── app/(dashboard)/
│   ├── components/
│   ├── lib/
│   └── types/
├── docker-compose.yml
└── .github/workflows/ci.yml
```

## 主要技术栈

- Backend: Node.js 20, TypeScript, Express, Prisma, BullMQ, Redis, OpenAI, Octokit
- Frontend: Next.js 14 (App Router), TypeScript, Tailwind CSS, Zustand, Recharts, Cytoscape
- Infra: PostgreSQL, Redis, Qdrant, Docker Compose, GitHub Actions

## 快速开始

### 1. 后端

```bash
cd backend
cp .env.example .env
pnpm install
pnpm prisma:generate
pnpm dev
```

默认监听 `http://localhost:4000`，文档地址 `http://localhost:4000/docs`。

### 2. 前端

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

默认访问 `http://localhost:3000`。

### 3. Docker 一键启动

```bash
docker compose up --build
```

## 核心 API

- `POST /webhooks/github`
- `GET /api/projects/:id/pull-requests`
- `GET /api/projects/:id/pull-requests/:prNumber`
- `GET /api/projects/:id/knowledge/graph`
- `GET /api/knowledge/search?q=...`
- `GET /api/projects/:id/debts`
- `GET /api/projects/:id/debts/stats`
- `PUT /api/debts/:id`
- `PUT /api/projects/:id/config`

## 开发命令

### Backend

```bash
pnpm dev
pnpm build
pnpm lint
pnpm test
```

### Frontend

```bash
npm run dev
npm run build
npm run lint
```

## 安全与配置建议

1. 生产环境关闭 `USE_MOCK_DATA`
2. 使用真实 `DATABASE_URL` 和 `REDIS_URL`
3. 配置 `GITHUB_APP_ID` / `GITHUB_PRIVATE_KEY` / `GITHUB_WEBHOOK_SECRET`
4. 配置 `OPENAI_API_KEY` 以启用真实 AI 审查
5. Webhook Secret、API Key 使用 Secret Manager 管理

## License

MIT
