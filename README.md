# Telegram 私聊机器人 (Cloudflare Workers 版)

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/Linsars/dm-gateway-bot)

基于 [ZenmoFeiShi/dm-gateway-bot](https://github.com/ZenmoFeiShi/dm-gateway-bot) 项目，专为 Cloudflare Workers 部署设计。

## ✨ 核心特性

- **0 成本部署**：完全免费，利用 Cloudflare Workers 免费额度
- **Emoji 验证**：新用户需点击正确表情才能发送消息
- **双向转发**：访客消息转发给主人，主人回复转发给访客
- **防骚扰**：验证通过后才能发送消息

## 🚀 快速部署

### 部署步骤：
1. **点击部署按钮**：点击上方的 "Deploy to Cloudflare" 按钮
2. **登录 Cloudflare 账号**
3. **Fork 仓库**：Cloudflare 会自动 fork 本仓库到你的 GitHub 账号
4. **配置环境变量**：
   - `ENV_BOT_TOKEN` = 你的 Bot Token（从 @BotFather 获取）
   - `ENV_OWNER_ID` = 你的 Telegram 用户 ID（从 @userinfobot 获取）
5. **绑定 KV 空间**：选择新建或使用现有的 KV 命名空间
6. **点击 "Save and Deploy"**

### 部署后需要做的：

1. **在部署页面绑定 KV 空间**：
   - Cloudflare 部署页面会显示 KV 命名空间绑定选项
   - 你可以选择：
     - **新建 KV 空间**：创建名为 `dm-gateway-bot-kv` 的新空间
     - **选择现有 KV 空间**：从下拉菜单选择你已有的 KV 空间
   - 变量名必须是 `KV`

2. **添加环境变量**：
   - 在同一页面的 "Environment Variables" 部分
   - 点击 "Add variable"
   - 添加以下两个变量：
   
   | 变量名 | 值 | 说明 |
   |--------|----|------|
   | `ENV_BOT_TOKEN` | `123` | 删除默认的123，填入你的 Bot Token |
   | `ENV_OWNER_ID` | `123` | 删除默认的123，填入你的 Telegram 用户 ID |

3. **激活 Webhook**：
   - 获取 Worker URL（格式：`https://xxx.workers.dev`）
   - 访问：`https://api.telegram.org/bot<YOUR_TOKEN>/setWebhook?url=<YOUR_WORKER_URL>`
   - 确认返回：`{"ok":true,"result":true}`

## 📱 使用说明

### 访客使用流程：
1. 私聊机器人
2. 发送 `/start` 命令
3. 点击正确的表情进行验证
4. 验证通过后发送消息
5. 消息会转发给主人

### 主人使用流程：
1. 直接私聊机器人发送消息
2. 机器人会自动转发给访客
3. 无需验证

## 🔧 技术说明

- **验证方式**：Emoji Captcha（点击正确的表情）
- **存储**：使用 Cloudflare KV 存储验证状态
- **部署**：Cloudflare Workers + GitHub

## 📁 项目结构

```
dm-gateway-bot/
├── worker.js          # Cloudflare Worker 主代码
├── wrangler.toml     # Wrangler 配置
└── README.md         # 项目说明
```

## 📚 参考项目

- [ZenmoFeiShi/dm-gateway-bot](https://github.com/ZenmoFeiShi/dm-gateway-bot) - 原始项目