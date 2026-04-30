# Telegram 私聊机器人 (Cloudflare Workers 版)

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/Linsars/dm-gateway-bot)

基于 [ZenmoFeiShi/dm-gateway-bot](https://github.com/ZenmoFeiShi/dm-gateway-bot)，专为 Cloudflare Workers 设计。

## ✨ 功能
- Emoji Captcha 验证
- 双向消息转发（文字、图片、视频、语音、贴纸、文件等）
- 主人回复转发消息即可回复对应访客

## 🚀 首次部署

### 1. 点击屎黄色按钮部署
- 登录 Cloudflare
- 填写 `ENV_BOT_TOKEN`（你的 Bot Token）
- 填写 `ENV_OWNER_ID`（你的 Telegram 用户 ID）
- 创建或选择 KV 命名空间，绑定变量名填 `KV`
- 点击部署

### 2. 激活 Webhook
- 访问 Worker 域名
- 输入 Bot Token，点击"激活机器人"

## 🔄 更新 Worker 代码

当本项目有新版本时，你可以通过以下方式更新：

### 方法一：直接在 CF Dashboard 更新（最简单）
1. 打开 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 找到你的 Worker → 点击"编辑代码"
3. 打开本仓库最新的 `worker.js`：[点击查看](https://raw.githubusercontent.com/Linsars/dm-gateway-bot/main/worker.js)
4. 复制全部内容，粘贴到编辑器中替换原代码
5. 点击"保存并部署"

### 方法二：使用 Wrangler CLI（命令行）
1. 安装 [Wrangler](https://developers.cloudflare.com/workers/wrangler/install-and-update/)
2. 克隆你的 Fork 仓库
3. 用本仓库最新的 `worker.js` 替换本地文件
4. 在 `wrangler.toml` 中确保 KV ID 正确
5. 运行 `wrangler deploy`

### 方法三：GitHub Actions 自动部署
1. Fork 本仓库到你的 GitHub
2. 在 `wrangler.toml` 中填入你的 KV 命名空间 ID
3. 仓库 → Settings → Secrets → Actions → 添加：
   - `CLOUDFLARE_API_TOKEN`：你的 Cloudflare API Token（需 Worker:Edit 权限）
4. 创建 `.github/workflows/deploy.yml`：
   ```yaml
   name: Deploy
   on:
     push:
       branches: [ main ]
   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - uses: cloudflare/wrangler-action@v3
           with:
             apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
             command: deploy --keep-vars
   ```
5. 推送到 main 分支即自动部署