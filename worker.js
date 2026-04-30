// Cloudflare Worker: Telegram 私聊中转机器人 (Emoji Captcha + 群组话题管理)
// 基于 ZenmoFeiShi/dm-gateway-bot + Linsars/telegram_private_chatbot

// ============ HTML 激活页面 ============
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

// ============ Emoji Captcha ============
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
  const resp = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  return resp.json();
}

// 构建话题标题
function buildTopicTitle(from) {
  const name = [from.first_name || "", from.last_name || ""].join(" ").trim().substring(0, 50);
  const username = from.username ? `@${from.username}` : "";
  return `${name} ${username} [${from.id}]`.trim().substring(0, 128);
}

// 获取或创建用户话题
async function getOrCreateTopic(env, userId, from) {
  // 先查 KV 里有没有
  const existing = await env.KV.get(`user:${userId}`, { type: "json" });
  if (existing && existing.thread_id) return existing;

  // 创建新话题
  const title = buildTopicTitle(from);
  const res = await tgApi(env.ENV_BOT_TOKEN, "createForumTopic", {
    chat_id: env.ENV_SUPERGROUP_ID,
    name: title
  });
  if (!res.ok) throw new Error("创建话题失败: " + res.description);

  const rec = { thread_id: res.result.message_thread_id, title };
  await env.KV.put(`user:${userId}`, JSON.stringify(rec));
  await env.KV.put(`thread:${rec.thread_id}`, String(userId));
  return rec;
}

// 通过话题 ID 找用户 ID
async function getUserIdByThread(env, threadId) {
  const uid = await env.KV.get(`thread:${threadId}`);
  return uid ? Number(uid) : null;
}

// 转发访客消息到群组话题
async function forwardToTopic(env, userId, from, msg) {
  const topic = await getOrCreateTopic(env, userId, from);
  const token = env.ENV_BOT_TOKEN;
  const chatId = env.ENV_SUPERGROUP_ID;
  const threadId = topic.thread_id;

  const body = { chat_id: chatId, message_thread_id: threadId };

  if (msg.text) {
    await tgApi(token, "sendMessage", { ...body, text: msg.text });
  } else if (msg.photo) {
    await tgApi(token, "sendPhoto", { ...body, photo: msg.photo[msg.photo.length - 1].file_id, caption: msg.caption || "" });
  } else if (msg.video) {
    await tgApi(token, "sendVideo", { ...body, video: msg.video.file_id, caption: msg.caption || "" });
  } else if (msg.voice) {
    await tgApi(token, "sendVoice", { ...body, voice: msg.voice.file_id });
  } else if (msg.audio) {
    await tgApi(token, "sendAudio", { ...body, audio: msg.audio.file_id, caption: msg.caption || "" });
  } else if (msg.document) {
    await tgApi(token, "sendDocument", { ...body, document: msg.document.file_id, caption: msg.caption || "" });
  } else if (msg.sticker) {
    await tgApi(token, "sendSticker", { ...body, sticker: msg.sticker.file_id });
  } else if (msg.video_note) {
    await tgApi(token, "sendVideoNote", { ...body, video_note: msg.video_note.file_id });
  } else if (msg.animation) {
    await tgApi(token, "sendAnimation", { ...body, animation: msg.animation.file_id, caption: msg.caption || "" });
  } else if (msg.location) {
    await tgApi(token, "sendLocation", { ...body, latitude: msg.location.latitude, longitude: msg.location.longitude });
  } else if (msg.contact) {
    await tgApi(token, "sendContact", { ...body, phone_number: msg.contact.phone_number, first_name: msg.contact.first_name });
  } else {
    await tgApi(token, "sendMessage", { ...body, text: "[未知消息类型]" });
  }
}

// 主人回复访客（直接 copyMessage，不需要引用）
async function replyToVisitor(env, targetUserId, msg) {
  const token = env.ENV_BOT_TOKEN;

  if (msg.text) {
    await tgApi(token, "sendMessage", { chat_id: targetUserId, text: msg.text });
  } else if (msg.photo) {
    await tgApi(token, "sendPhoto", { chat_id: targetUserId, photo: msg.photo[msg.photo.length - 1].file_id, caption: msg.caption || "" });
  } else if (msg.video) {
    await tgApi(token, "sendVideo", { chat_id: targetUserId, video: msg.video.file_id, caption: msg.caption || "" });
  } else if (msg.voice) {
    await tgApi(token, "sendVoice", { chat_id: targetUserId, voice: msg.voice.file_id });
  } else if (msg.audio) {
    await tgApi(token, "sendAudio", { chat_id: targetUserId, audio: msg.audio.file_id });
  } else if (msg.document) {
    await tgApi(token, "sendDocument", { chat_id: targetUserId, document: msg.document.file_id, caption: msg.caption || "" });
  } else if (msg.sticker) {
    await tgApi(token, "sendSticker", { chat_id: targetUserId, sticker: msg.sticker.file_id });
  } else if (msg.video_note) {
    await tgApi(token, "sendVideoNote", { chat_id: targetUserId, video_note: msg.video_note.file_id });
  } else if (msg.animation) {
    await tgApi(token, "sendAnimation", { chat_id: targetUserId, animation: msg.animation.file_id });
  } else if (msg.location) {
    await tgApi(token, "sendLocation", { chat_id: targetUserId, latitude: msg.location.latitude, longitude: msg.location.longitude });
  } else {
    // 兜底：转发
    await tgApi(token, "copyMessage", { chat_id: targetUserId, from_chat_id: env.ENV_SUPERGROUP_ID, message_id: msg.message_id });
  }
}

// ============ 管理员指令 ============
async function handleAdminCommand(env, userId, threadId, text) {
  const token = env.ENV_BOT_TOKEN;
  const chatId = env.ENV_SUPERGROUP_ID;
  const body = { chat_id: chatId, message_thread_id: threadId };

  if (text === "/close") {
    await env.KV.put(`closed:${userId}`, "1");
    await tgApi(token, "closeForumTopic", { chat_id: chatId, message_thread_id: threadId });
    await tgApi(token, "sendMessage", { ...body, text: "🚫 对话已关闭" });
    return true;
  }
  if (text === "/open") {
    await env.KV.delete(`closed:${userId}`);
    await tgApi(token, "reopenForumTopic", { chat_id: chatId, message_thread_id: threadId });
    await tgApi(token, "sendMessage", { ...body, text: "✅ 对话已恢复" });
    return true;
  }
  if (text === "/ban") {
    await env.KV.put(`banned:${userId}`, "1");
    await tgApi(token, "sendMessage", { ...body, text: "🚫 用户已封禁" });
    return true;
  }
  if (text === "/unban") {
    await env.KV.delete(`banned:${userId}`);
    await tgApi(token, "sendMessage", { ...body, text: "✅ 用户已解封" });
    return true;
  }
  if (text === "/trust") {
    await env.KV.put(`trusted:${userId}`, "1");
    await tgApi(token, "sendMessage", { ...body, text: "🌟 已设置永久信任" });
    return true;
  }
  if (text === "/reset") {
    await env.KV.delete(`verified:${userId}`);
    verifiedUsers.delete(userId);
    await tgApi(token, "sendMessage", { ...body, text: "🔄 验证已重置" });
    return true;
  }
  if (text === "/info") {
    const info = `👤 用户信息\nUID: ${userId}\nTopic ID: ${threadId}\nLink: tg://user?id=${userId}`;
    await tgApi(token, "sendMessage", { ...body, text: info });
    return true;
  }
  return false;
}

// ============ 主处理 ============
export default {
  async fetch(request, env) {
    if (request.method === "GET") {
      return new Response(HTML_PAGE, { headers: { "Content-Type": "text/html; charset=utf-8" } });
    }
    if (request.method !== "POST") return new Response("Method not allowed", { status: 405 });

    const update = await request.json();

    // ---- 反应/表情转发 ----
    if (update.message_reaction) {
      const mr = update.message_reaction;
      const chatId = String(mr.chat.id);
      if (chatId === String(env.ENV_SUPERGROUP_ID) && mr.message_thread_id) {
        const userId = await getUserIdByThread(env, mr.message_thread_id);
        if (userId) {
          const reactions = mr.new_reaction || [];
          const emoji = reactions.map(r => r.emoji || r.type || "").filter(Boolean).join("");
          if (emoji) {
            await tgApi(env.ENV_BOT_TOKEN, "sendMessage", { chat_id: userId, text: `👍 主人回应了你的消息：${emoji}` });
          }
        }
      }
      return new Response("ok");
    }

    // ---- 验证回调 ----
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

    // ---- 消息处理 ----
    if (update.message) {
      const msg = update.message;
      const uid = msg.from.id;
      const name = msg.from.first_name || "未知";
      const text = (msg.text || "").trim();

      // === 群组话题消息（主人在话题里发的消息） ===
      if (msg.chat && String(msg.chat.id) === String(env.ENV_SUPERGROUP_ID) && msg.message_thread_id) {
        const targetUserId = await getUserIdByThread(env, msg.message_thread_id);
        if (!targetUserId) return new Response("ok");

        // 管理员指令
        if (text.startsWith("/")) {
          await handleAdminCommand(env, targetUserId, msg.message_thread_id, text);
          return new Response("ok");
        }

        // 检查是否关闭
        const closed = await env.KV.get(`closed:${targetUserId}`);
        if (closed) {
          await tgApi(env.ENV_BOT_TOKEN, "sendMessage", {
            chat_id: env.ENV_SUPERGROUP_ID,
            message_thread_id: msg.message_thread_id,
            text: "⚠️ 对话已关闭，请先 /open"
          });
          return new Response("ok");
        }

        // 直接发送给访客（不需要引用）
        await replyToVisitor(env, targetUserId, msg);
        return new Response("ok");
      }

      // === 私聊消息 ===

      // 命令
      if (text.startsWith("/")) {
        if (text === "/start") {
          if (String(uid) === String(env.ENV_OWNER_ID)) {
            await tgApi(env.ENV_BOT_TOKEN, "sendMessage", { chat_id: uid, text: "✅ 机器人已就绪。\n在群组话题里直接发消息即可回复访客。" });
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

      // 主人私聊（不走话题）
      if (String(uid) === String(env.ENV_OWNER_ID)) {
        return new Response("ok");
      }

      // 封禁检查
      const banned = await env.KV.get(`banned:${uid}`);
      if (banned) return new Response("ok");

      // 未验证
      if (!verifiedUsers.has(uid)) {
        const c = generateCaptcha();
        pendingUsers.set(uid, { answer: c.answer });
        const buttons = c.options.map(e => ({ text: e, callback_data: `verify:${e}` }));
        await tgApi(env.ENV_BOT_TOKEN, "sendMessage", { chat_id: uid, text: `🤖 请先验证你是真人：\n\n${c.question}`, reply_markup: { inline_keyboard: [buttons] } });
        return new Response("ok");
      }

      // 已验证：转发到群组话题
      await forwardToTopic(env, uid, msg.from, msg);
    }

    return new Response("ok");
  }
};