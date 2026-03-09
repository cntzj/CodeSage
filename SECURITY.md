# Security Policy

## Supported Versions

当前维护分支：`main`

## Reporting a Vulnerability

请通过以下方式私下披露安全问题：

1. 发送邮件到项目维护者安全邮箱
2. 标题包含 `[CodeSage Security]`
3. 提供复现步骤、影响范围、建议修复方式

我们会在 72 小时内确认，并在验证后安排修复发布。

## Security Baseline

1. 认证与授权
   - JWT 短期有效
   - 仓库级访问权限隔离
2. 数据安全
   - 传输链路 TLS
   - 密钥仅通过环境变量或 Secret Manager 注入
3. 输入与输出防护
   - Webhook 签名校验
   - 参数验证与错误处理
4. 审计与可观测
   - 结构化日志
   - traceId 链路追踪

## Recommended Hardening

1. 在生产环境关闭 `USE_MOCK_DATA`
2. 采用最小权限 GitHub App 权限模型
3. 开启依赖漏洞扫描（Trivy/Snyk/GitHub Dependabot）
4. 对 Slack/Discord Webhook 使用独立通道和最小权限
