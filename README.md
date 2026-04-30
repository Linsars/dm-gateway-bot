# Telegram 私聊机器人 (Cloudflare Workers 版)

基于 [ZenmoFeiShi/dm-gateway-bot](https://github.com/ZenmoFeiShi/dm-gateway-bot)，专为 Cloudflare Workers 设计。

## ✨ 功能
- Emoji Captcha 验证
- 双向消息转发
- 多媒体支持

## 🚀 部署步骤
[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/Linsars/dm-gateway-bot)
### 1. 点击上面☝️屎黄色按钮【Deploy to Cloudflare】部署
- 登录 Cloudflare
- 填写环境变量：
  - `ENV_BOT_TOKEN`（Bot Token）
  - `ENV_OWNER_ID`（你的 TG 用户 ID）
- 创建或选择 KV 命名空间，绑定变量名填 `KV`
- 点击部署

### 2. 激活 Webhook
- 访问 Worker 域名，点击页面上的激活链接

### 3. 开启自动部署（可选）
Fork 本仓库后：
1. 修改 `wrangler.toml` 中的 `id = "你的KV命名空间ID"`
2. 仓库 → Settings → Secrets → Actions → 添加 `CLOUDFLARE_API_TOKEN`（你的 Cloudflare API Token）
3. 以后推代码到 main 分支即自动部署

**注意：** 不设置 `CLOUDFLARE_API_TOKEN` 不影响本次部署，只是无法自动更新。
