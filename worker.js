// Cloudflare Worker: Telegram 私聊中转机器人 (Emoji Captcha 验证)
// 基于 ZenmoFeiShi/dm-gateway-bot 项目

// ============ HTML 页面 ============
const HTML_PAGE = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Telegram 机器人</title>
  <style>
    body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f9f9f9; }
    .box { background: white; padding: 30px; border-radius: 10px; max-width: 460px; margin: 0 auto; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    input { width: 90%; padding: 10px; margin: 10px 0; border: 1px solid #ddd; border-radius: 5px; font-size: 14px; }
    button { background: #0088cc; color: white; border: none; padding: 12px 30px; border-radius: 5px; font-size: 16px; cursor: pointer; margin-top: 10px; }
    button:hover { background: #006699; }
    .tip { font-size: 12px; color: #999; margin-top: 15px; }
    #result { margin-top: 15px; padding: 10px; border-radius: 5px; display: none; }
    .ok { background: #d4edda; color: #155724; }
    .err { background: #f8d7da; color: #721c24; }
  </style>
</head>
<body>
  <div class="box">
    <h1>🤖 Telegram 机器人</h1>
    <p>输入你的 Bot Token 激活 Webhook：</p>
    <input type="text" id="token" placeholder="123456:ABC-DEF..." />
    <br>
    <button onclick="activate()">激活机器人</button>
    <div id="result"></div>
    <p class="tip">Token 仅在浏览器本地使用，不会上传到服务器</p>
  </div>
  <script>
    async function activate() {
      var token = document.getElementById("token").value.trim();
      var result = document.getElementById("result");
      if (!token) { result.style.display="block"; result.className="err"; result.textContent="请输入 Token"; return; }
      result.style.display="block"; result.className=""; result.textContent="正在激活...";
      try {
        var resp = await fetch("https://api.telegram.org/bot"+token+"/setWebhook?url="+encodeURIComponent(location.origin));
        var data = await resp.json();
        if (data.ok) { result.className="ok"; result.textContent="✅ 激活成功！机器人已上线。"; }
        else { result.className="err"; result.textContent="❌ 激活失败："+data.description; }
      } catch(e) { result.className="err"; result.textContent="❌ 请求失败："+e.message; }
    }
  </script>
</body>
</html>`;

// ============ Emoji Captcha 题库 ============
const CAPTCHAS = [
  { question: "Tap 🐶", answer: "🐶" },
  { question: "Tap 🐱", answer: "🐱" },
  { question: "Tap 🐼", answer: "🐼" },
  { question: "Tap 🦊", answer: "🦊" },
  { question: "Tap 🐸", answer: "🐸" },
  { question: "Tap 🦁", answer: "🦁" }
];

// ============ 状态存储 ============
const pendingUsers = new Map();
const verifiedUsers = new Set();

// ============ 工具函数 ============
function generateCaptcha() {
  const c = CAPTCHAS[Math.floor(Math.random() * CAPTCHAS.length)];
  const options = [...CAPTCHAS.map(x => x.answer)].sort(() => Math.random() - 0.5);
  return { question: c.question, answer: c.answer, options };
}

// 调用 Telegram API
async function tgApi(token, method, body) {
  return fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
}

// 从转发消息中提取用户 ID
function extractUserId(text) {
  if (!text) return null;
  const match = text.match(/用户 ID: (\d+)/);
  return match ? match[1] : null;
}

// 转发访客消息给主人
async function forwardToOwner(env, userId, userName, msg) {
  const token = env.ENV_BOT_TOKEN;
  const ownerId = env.ENV_OWNER_ID;
  const header = `💬 来自 ${userName} 的消息：\n用户 ID: ${userId}\n`;

  if (msg.text) {
    await tgApi(token, "sendMessage", { chat_id: ownerId, text: header + "\n" + msg.text });
  } else if (msg.photo) {
    await tgApi(token, "sendPhoto", { chat_id: ownerId, photo: msg.photo[msg.photo.length - 1].file_id, caption: header + (msg.caption || "") });
  } else if (msg.video) {
    await tgApi(token, "sendVideo", { chat_id: ownerId, video: msg.video.file_id, caption: header + (msg.caption || "") });
  } else if (msg.voice) {
    await tgApi(token, "sendVoice", { chat_id: ownerId, voice: msg.voice.file_id, caption: header });
  } else if (msg.audio) {
    await tgApi(token, "sendAudio", { chat_id: ownerId, audio: msg.audio.file_id, caption: header + (msg.caption || "") });
  } else if (msg.document) {
    await tgApi(token, "sendDocument", { chat_id: ownerId, document: msg.document.file_id, caption: header + (msg.caption || "") });
  } else if (msg.sticker) {
    await tgApi(token, "sendMessage", { chat_id: ownerId, text: header });
    await tgApi(token, "sendSticker", { chat_id: ownerId, sticker: msg.sticker.file_id });
  } else if (msg.video_note) {
    await tgApi(token, "sendMessage", { chat_id: ownerId, text: header });
    await tgApi(token, "sendVideoNote", { chat_id: ownerId, video_note: msg.video_note.file_id });
  } else if (msg.location) {
    await tgApi(token, "sendMessage", { chat_id: ownerId, text: header });
    await tgApi(token, "sendLocation", { chat_id: ownerId, latitude: msg.location.latitude, longitude: msg.location.longitude });
  } else if (msg.contact) {
    await tgApi(token, "sendMessage", { chat_id: ownerId, text: header });
    await tgApi(token, "sendContact", { chat_id: ownerId, phone_number: msg.contact.phone_number, first_name: msg.contact.first_name });
  } else if (msg.animation) {
    await tgApi(token, "sendAnimation", { chat_id: ownerId, animation: msg.animation.file_id, caption: header });
  } else {
    await tgApi(token, "sendMessage", { chat_id: ownerId, text: header + "\n[未知消息类型]" });
  }
}

// 主人回复访客
async function replyToVisitor(env, targetId, msg) {
  const token = env.ENV_BOT_TOKEN;
  const prefix = "💬 主人回复：\n";

  if (msg.text) {
    await tgApi(token, "sendMessage", { chat_id: targetId, text: prefix + msg.text });
  } else if (msg.photo) {
    await tgApi(token, "sendPhoto", { chat_id: targetId, photo: msg.photo[msg.photo.length - 1].file_id, caption: msg.caption || "" });
  } else if (msg.video) {
    await tgApi(token, "sendVideo", { chat_id: targetId, video: msg.video.file_id, caption: msg.caption || "" });
  } else if (msg.voice) {
    await tgApi(token, "sendVoice", { chat_id: targetId, voice: msg.voice.file_id });
  } else if (msg.audio) {
    await tgApi(token, "sendAudio", { chat_id: targetId, audio: msg.audio.file_id });
  } else if (msg.document) {
    await tgApi(token, "sendDocument", { chat_id: targetId, document: msg.document.file_id, caption: msg.caption || "" });
  } else if (msg.sticker) {
    await tgApi(token, "sendSticker", { chat_id: targetId, sticker: msg.sticker.file_id });
  } else if (msg.animation) {
    await tgApi(token, "sendAnimation", { chat_id: targetId, animation: msg.animation.file_id });
  } else if (msg.location) {
    await tgApi(token, "sendLocation", { chat_id: targetId, latitude: msg.location.latitude, longitude: msg.location.longitude });
  } else {
    await tgApi(token, "sendMessage", { chat_id: targetId, text: prefix + "[未知消息类型]" });
  }
}

// ============ 主处理 ============
export default {
  async fetch(request, env) {
    if (request.method === "GET") {
      return new Response(HTML_PAGE, { headers: { "Content-Type": "text/html; charset=utf-8" } });
    }

    if (request.method !== "POST") return new Response("Method not allowed", { status: 405 });

    const update = await request.json();

    // 验证回调
    if (update.callback_query) {
      const q = update.callback_query;
      const uid = q.from.id;
      const data = q.data;
      if (!data.startsWith("verify:")) return new Response("ok");

      const selected = data.split(":")[1];
      const pending = pendingUsers.get(uid);

      if (!pending) {
        return new Response(JSON.stringify({ method: "answerCallbackQuery", callback_query_id: q.id, text: "验证已过期，请重发 /start" }), { headers: { "Content-Type": "application/json" } });
      }
      if (selected === pending.answer) {
        verifiedUsers.add(uid);
        pendingUsers.delete(uid);
        return new Response(JSON.stringify({ method: "answerCallbackQuery", callback_query_id: q.id, text: "✅ 验证通过！" }), { headers: { "Content-Type": "application/json" } });
      }
      return new Response(JSON.stringify({ method: "answerCallbackQuery", callback_query_id: q.id, text: "❌ 选择错误，请重试", show_alert: true }), { headers: { "Content-Type": "application/json" } });
    }

    // 消息处理
    if (update.message) {
      const msg = update.message;
      const uid = msg.from.id;
      const name = msg.from.first_name || "未知";
      const text = msg.text;

      // 命令处理
      if (text && text.startsWith("/")) {
        if (text === "/start") {
          if (String(uid) === String(env.ENV_OWNER_ID)) {
            await tgApi(env.ENV_BOT_TOKEN, "sendMessage", { chat_id: uid, text: "✅ 机器人已就绪。回复转发消息即可回复对应访客。" });
          } else if (verifiedUsers.has(uid)) {
            await tgApi(env.ENV_BOT_TOKEN, "sendMessage", { chat_id: uid, text: "你已通过验证，直接发消息即可。" });
          } else {
            const c = generateCaptcha();
            pendingUsers.set(uid, { answer: c.answer });
            const buttons = c.options.map(e => ({ text: e, callback_data: `verify:${e}` }));
            await tgApi(env.ENV_BOT_TOKEN, "sendMessage", { chat_id: uid, text: `🤖 请先验证你是真人：\n\n${c.question}`, reply_markup: { inline_keyboard: [buttons] } });
          }
        }
        return new Response("ok");
      }

      // 主人消息：回复转发的消息
      if (String(uid) === String(env.ENV_OWNER_ID)) {
        if (msg.reply_to_message) {
          const replied = msg.reply_to_message;
          const sourceText = replied.text || replied.caption || "";
          const targetId = extractUserId(sourceText);
          if (targetId) {
            await replyToVisitor(env, targetId, msg);
            await tgApi(env.ENV_BOT_TOKEN, "sendMessage", { chat_id: uid, text: `✅ 已回复用户 ${targetId}` });
          }
        }
        return new Response("ok");
      }

      // 未验证访客
      if (!verifiedUsers.has(uid)) {
        const c = generateCaptcha();
        pendingUsers.set(uid, { answer: c.answer });
        const buttons = c.options.map(e => ({ text: e, callback_data: `verify:${e}` }));
        await tgApi(env.ENV_BOT_TOKEN, "sendMessage", { chat_id: uid, text: `🤖 请先验证你是真人：\n\n${c.question}`, reply_markup: { inline_keyboard: [buttons] } });
        return new Response("ok");
      }

      // 已验证访客：转发给主人
      await forwardToOwner(env, uid, name, msg);
    }

    return new Response("ok");
  }
};