# Telegram 私聊机器人 (Cloudflare Workers 版)

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/Linsars/dm-gateway-bot)

基于 [ZenmoFeiShi/dm-gateway-bot](https://github.com/ZenmoFeiShi/dm-gateway-bot)，专为 Cloudflare Workers 设计。

## ✨ 功能
- Emoji Captcha 验证
- 双向消息转发
- 多媒体支持

## 🚀 部署步骤

### 1. 点击屎黄色按钮部署
- 登录 Cloudflare
- 填写 `ENV_BOT_TOKEN`（你的 Bot Token）
- 填写 `ENV_OWNER_ID`（你的 Telegram 用户 ID）
- 点击部署

### 2. 绑定 KV 存储
- Cloudflare → KV → 创建命名空间
- Worker → 设置 → KV 命名空间绑定 → 添加
- 变量名填 `KV`，选择刚创建的命名空间

### 3. 激活 Webhook
- 访问 Worker 域名
- 在页面上输入你的 Bot Token
- 点击"激活机器人"按钮
- 页面会显示激活结果

## 🔄 开启自动部署（可选）

如果你想通过 GitHub 推送代码自动更新 Worker：

1. Fork 本仓库
2. 修改 `wrangler.toml`，把 `#id = "你的KV命名空间ID"` 改为你的实际 KV ID（去掉 `#`）
3. 仓库 → Settings → Secrets → Actions → 添加 `CLOUDFLARE_API_TOKEN`（你的 Cloudflare API Token）
4. 推送到 main 分支即自动部署