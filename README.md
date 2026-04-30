# Telegram 私聊机器人 (Cloudflare Workers 版)

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/Linsars/dm-gateway-bot)

基于 [ZenmoFeiShi/dm-gateway-bot](https://github.com/ZenmoFeiShi/dm-gateway-bot)，专为 Cloudflare Workers 设计。

## ✨ 功能
- Emoji Captcha 验证
- 双向消息转发
- 多媒体支持

## 🚀 一键部署

点击屎黄色按钮 → 登录 Cloudflare → 填写环境变量 → 部署

**部署后：**
1. 创建 KV 命名空间（Cloudflare → KV → 创建）
2. 绑定到 Worker（Worker → 设置 → KV 绑定 → 变量名 `KV`）
3. 访问 Worker 域名，点击页面上的激活链接

## 🔄 Fork 后自动部署

1. Fork 本仓库
2. 修改 `wrangler.toml` 中的 KV 命名空间 ID 为你自己的
3. 设置 GitHub Secrets（仓库 → Settings → Secrets → Actions）：
   - `CLOUDFLARE_API_TOKEN`：Cloudflare API Token
   - `ENV_BOT_TOKEN`：你的 Bot Token
   - `ENV_OWNER_ID`：你的 Telegram 用户 ID
4. 推送到 main 分支即自动部署