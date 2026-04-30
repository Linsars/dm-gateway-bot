// Cloudflare Worker: Telegram 私聊中转机器人 (Emoji Captcha 验证)
// 基于 ZenmoFeiShi/dm-gateway-bot 项目

// 环境变量
const BOT_TOKEN = "your_bot_token_here";
const OWNER_ID = "your_owner_id_here";

// Emoji Captcha 题库
const CAPTCHAS = [
  { question: "Tap 🐶", answer: "🐶" },
  { question: "Tap 🐱", answer: "🐱" },
  { question: "Tap 🐼", answer: "🐼" },
  { question: "Tap 🦊", answer: "🦊" },
  { question: "Tap 🐸", answer: "🐸" },
  { question: "Tap 🦁", answer: "🦁" }
];

// 存储验证状态
const pendingUsers = new Map();
const verifiedUsers = new Set();

// 生成验证码
function generateCaptcha() {
  const captcha = CAPTCHAS[Math.floor(Math.random() * CAPTCHAS.length)];
  const emojis = ["🐶", "🐱", "🐼", "🦊", "🐸", "🦁"];
  const options = emojis.sort(() => Math.random() - 0.5);
  return {
    question: captcha.question,
    answer: captcha.answer,
    options: options
  };
}

// 发送消息给主人
async function forwardToOwner(env, userId, userName, message) {
  const header = `💬 来自 ${userName} 的消息：\n用户 ID: ${userId}\n`;
  let text = header;
  
  if (message.text) {
    text += `\n${message.text}`;
  }
  
  await sendMessage(env.BOT_TOKEN, OWNER_ID, text);
}

// 发送消息
async function sendMessage(token, chatId, text) {
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text: text })
  });
  return response.json();
}

// 主处理函数
export default {
  async fetch(request, env, ctx) {
    // 处理 GET 请求（浏览器访问）
    if (request.method === "GET") {
      return new Response(`
        <html>
          <head><title>Telegram 机器人</title></head>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h1>🤖 Telegram 机器人运行中</h1>
            <p>这是一个 Telegram 机器人，通过 Webhook 接收消息。</p>
            <p>请通过 Telegram 客户端与机器人交互。</p>
          </body>
        </html>
      `, {
        headers: { "Content-Type": "text/html" }
      });
    }

    // 处理 POST 请求（Telegram Webhook）
    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    const update = await request.json();

    // 处理回调查询（验证码点击）
    if (update.callback_query) {
      const query = update.callback_query;
      const userId = query.from.id;
      const data = query.data;

      if (data.startsWith("verify:")) {
        const selected = data.split(":")[1];
        const pending = pendingUsers.get(userId);

        if (!pending) {
          return new Response(JSON.stringify({
            method: "answerCallbackQuery",
            callback_query_id: query.id,
            text: "验证已超时，请重新发送 /start"
          }), { headers: { "Content-Type": "application/json" } });
        }

        if (selected === pending.answer) {
          verifiedUsers.add(userId);
          pendingUsers.delete(userId);
          return new Response(JSON.stringify({
            method: "answerCallbackQuery",
            callback_query_id: query.id,
            text: "✅ 验证通过！"
          }), { headers: { "Content-Type": "application/json" } });
        } else {
          return new Response(JSON.stringify({
            method: "answerCallbackQuery",
            callback_query_id: query.id,
            text: "❌ 选择错误，请重试",
            show_alert: true
          }), { headers: { "Content-Type": "application/json" } });
        }
      }
    }

    // 处理消息
    if (update.message) {
      const message = update.message;
      const userId = message.from.id;
      const userName = message.from.first_name || "未知";
      const text = message.text;

      // 忽略命令
      if (text && text.startsWith("/")) {
        if (text === "/start") {
          if (userId == OWNER_ID) {
            await sendMessage(env.BOT_TOKEN, userId, "你是管理员，可以直接发消息给我，我会帮你转发。");
          } else if (verifiedUsers.has(userId)) {
            await sendMessage(env.BOT_TOKEN, userId, "你已经通过验证，直接发消息给我即可转达给主人。");
          } else {
            const captcha = generateCaptcha();
            pendingUsers.set(userId, { answer: captcha.answer });
            
            // 创建按钮
            const buttons = captcha.options.map(e => ({
              text: e,
              callback_data: `verify:${e}`
            }));
            
            await sendMessage(env.BOT_TOKEN, userId, `🤖 你想联系主人，请先验证你是真人：\n\n${captcha.question}`, {
              reply_markup: { inline_keyboard: [buttons] }
            });
          }
        }
        return new Response(JSON.stringify({ method: "sendMessage" }), { headers: { "Content-Type": "application/json" } });
      }

      // 管理员逻辑
      if (userId == OWNER_ID) {
        // 处理回复逻辑
        return new Response(JSON.stringify({ method: "sendMessage" }), { headers: { "Content-Type": "application/json" } });
      }

      // 未验证用户
      if (!verifiedUsers.has(userId)) {
        const captcha = generateCaptcha();
        pendingUsers.set(userId, { answer: captcha.answer });
        
        const buttons = captcha.options.map(e => ({
          text: e,
          callback_data: `verify:${e}`
        }));
        
        await sendMessage(env.BOT_TOKEN, userId, `🤖 请先验证你是真人：\n\n${captcha.question}`, {
          reply_markup: { inline_keyboard: [buttons] }
        });
        return new Response(JSON.stringify({ method: "sendMessage" }), { headers: { "Content-Type": "application/json" } });
      }

      // 已验证用户，转发给主人
      await forwardToOwner(env, userId, userName, message);
      await sendMessage(env.BOT_TOKEN, userId, "✅ 已发送给主人，等待回复...");
    }

    return new Response(JSON.stringify({ status: "ok" }), { headers: { "Content-Type": "application/json" } });
  }
};