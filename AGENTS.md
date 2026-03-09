# AGENTS.md

## 项目架构

- `backend/`: API、Webhook、队列、AI 服务、数据模型
- `frontend/`: Dashboard UI、PR 页面、图谱可视化、债务看板
- `docker-compose.yml`: 本地一键编排
- `.github/workflows/ci.yml`: CI 流程

## 代码规范

1. TypeScript 全程开启严格模式
2. 命名规范：
   - 文件：kebab-case
   - 组件：PascalCase
   - 函数：camelCase
   - 常量：UPPER_SNAKE_CASE
3. 统一 Prettier + ESLint
4. API 层和业务层分离，Controller 不写复杂业务逻辑

## 开发流程

1. 从 `main` 创建分支：`codex/<feature-name>`
2. 完成后执行：
   - Backend: `pnpm lint && pnpm test && pnpm build`
   - Frontend: `npm run lint && npm run build`
3. 使用 Conventional Commits：
   - `feat:` 新功能
   - `fix:` 修复
   - `docs:` 文档
   - `refactor:` 重构
   - `test:` 测试
   - `chore:` 构建/工具

## 测试要求

1. 单元测试覆盖工具函数和核心服务
2. 集成测试覆盖健康检查和关键 API
3. 目标覆盖率：`>= 70%`
4. 新增 API 时必须补充至少一条测试或说明测试计划

## 运行模式

- `USE_MOCK_DATA=true`: 无需外部依赖即可走通前后端演示链路
- `USE_MOCK_DATA=false`: 使用 PostgreSQL + Redis + OpenAI + GitHub App 进行真实集成
