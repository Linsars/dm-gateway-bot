# Telegram 私聊机器人 (Cloudflare Workers 版)

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/Linsars/dm-gateway-bot)

基于 [ZenmoFeiShi/dm-gateway-bot](https://github.com/ZenmoFeiShi/dm-gateway-bot) + [Linsars/telegram_private_chatbot](https://github.com/Linsars/telegram_private_chatbot)，专为 Cloudflare Workers 设计。

## ✨ 功能
- Emoji Captcha 验证
- 群组话题管理：每位访客自动创建独立话题
- 主人在话题里直接发消息即可回复（不需要引用）
- 支持点赞/贴表情转发给访客
- 多媒体消息支持
- 管理员指令：/close /open /ban /unban /trust /reset /info

## 🚀 首次部署

### 前置准备
1. 创建一个 Telegram **群组**，开启**话题功能**（Forum Topics）
2. 把机器人拉入群组，设为**管理员**（需要管理话题权限）
3. 获取群组 ID：桌面端右键群内消息 → 复制链接 → 链接里的 `-100xxxxxxxxxx` 就是群组 ID

### 1. 点击屎黄色按钮部署
- 登录 Cloudflare
- 填写环境变量：
  - `ENV_BOT_TOKEN`：Bot Token
  - `ENV_OWNER_ID`：你的 Telegram 用户 ID
  - `ENV_SUPERGROUP_ID`：群组 ID（-100 开头）
- 创建或选择 KV 命名空间，绑定变量名填 `KV`
- 点击部署

### 2. 关闭群组隐私（重要）
- 打开 @BotFather → /mybots → 选择机器人 → Settings → Group Privacy → Turn off

### 3. 激活 Webhook
- 访问 Worker 域名
- 输入 Bot Token，点击"激活机器人"

### 4. 绑定 KV 存储
- Cloudflare → KV → 创建命名空间
- Worker → 设置 → KV 命名空间绑定 → 添加
- 变量名填 `KV`，选择刚创建的命名空间

## 🔄 更新 Worker 代码

### 方法一：CF Dashboard（最简单）
1. Worker → 编辑代码
2. 复制最新的 [worker.js](https://raw.githubusercontent.com/Linsars/dm-gateway-bot/main/worker.js)
3. 粘贴替换 → 保存并部署

### 方法二：Wrangler CLI
```bash
wrangler deploy
```

### 方法三：GitHub Actions
1. Fork 本仓库，修改 `wrangler.toml` 中的 KV ID
2. 添加 GitHub Secret `CLOUDFLARE_API_TOKEN`
3. 创建 `.github/workflows/deploy.yml` 并推送