# Telegram 私聊机器人 (Cloudflare Workers 版)

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/Linsars/dm-gateway-bot)

基于 [ZenmoFeiShi/dm-gateway-bot](https://github.com/ZenmoFeiShi/dm-gateway-bot) + [Linsars/telegram_private_chatbot](https://github.com/Linsars/telegram_private_chatbot)

## ✨ 功能
- 两级验证：文字题 → 表情验证 → 不通过则 ban 一周（自动解除）
- 群组话题管理：每位访客自动创建独立话题
- 主人在话题里直接发消息即可回复（不需要引用）
- 点赞/贴表情转发给访客
- 多媒体消息支持
- 管理员指令

## 🚀 部署步骤

### 前置准备
1. 创建 Telegram **群组**，开启**话题功能**（Forum Topics）
2. 把机器人拉入群组，设为**管理员**（需要管理话题权限）
3. 获取群组 ID：桌面端右键群内消息 → 复制链接 → 链接里的 `-100xxxxxxxxxx`

### 部署
1. 点击上方屎黄色按钮
2. 填写环境变量：
   - `ENV_BOT_TOKEN`：Bot Token
   - `ENV_OWNER_ID`：你的 Telegram 用户 ID
   - `ENV_SUPERGROUP_ID`：群组 ID（-100 开头）
3. 创建 KV 命名空间，绑定变量名填 `KV`
4. 部署

### 部署后
1. @BotFather → /mybots → Settings → Group Privacy → **Turn off**
2. 访问 Worker 域名 → 输入 Token → 点击激活

## 📖 验证流程
```
/start → 文字题（50题随机）
  ├─ 答对 → 开始对话
  └─ 答错 → 表情验证（20种随机）
              ├─ 点对 → 开始对话
              └─ 点错 → ban 一周（自动解除）
```

## 🛠 管理员指令
| 指令 | 说明 |
|------|------|
| `/close` | 关闭对话 |
| `/open` | 恢复对话 |
| `/ban` | 封禁用户 |
| `/unban` | 解封用户 |
| `/trust` | 永久信任（跳过验证） |
| `/reset` | 重置验证状态 |
| `/info` | 查看用户信息 |