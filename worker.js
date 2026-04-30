// Cloudflare Worker: Telegram 私聊中转机器人
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

// ============ 文字题库（50题） ============
const TEXT_QUESTIONS = [
  { question: "冰融化后会变成什么？", correct: "水", options: ["水", "石头", "木头", "火"] },
  { question: "正常人有几只眼睛？", correct: "2", options: ["2", "1", "3", "4"] },
  { question: "以下哪个属于水果？", correct: "香蕉", options: ["香蕉", "白菜", "猪肉", "大米"] },
  { question: "1 加 2 等于几？", correct: "3", options: ["3", "2", "4", "5"] },
  { question: "5 减 2 等于几？", correct: "3", options: ["3", "1", "2", "4"] },
  { question: "2 乘以 3 等于几？", correct: "6", options: ["6", "4", "5", "7"] },
  { question: "在天上飞的交通工具是什么？", correct: "飞机", options: ["飞机", "汽车", "轮船", "自行车"] },
  { question: "星期一的后面是星期几？", correct: "星期二", options: ["星期二", "星期日", "星期五", "星期三"] },
  { question: "鱼通常生活在哪里？", correct: "水里", options: ["水里", "树上", "土里", "火里"] },
  { question: "晴朗的天空通常是什么颜色？", correct: "蓝色", options: ["蓝色", "绿色", "红色", "紫色"] },
  { question: "太阳从哪个方向升起？", correct: "东方", options: ["东方", "西方", "南方", "北方"] },
  { question: "小狗发出的叫声通常是？", correct: "汪汪", options: ["汪汪", "喵喵", "咩咩", "呱呱"] },
  { question: "10 加 5 等于几？", correct: "15", options: ["15", "10", "12", "20"] },
  { question: "8 减 4 等于几？", correct: "4", options: ["4", "2", "3", "5"] },
  { question: "我们用什么器官来听声音？", correct: "耳朵", options: ["耳朵", "眼睛", "鼻子", "嘴巴"] },
  { question: "一年有几个月？", correct: "12", options: ["12", "10", "11", "13"] },
  { question: "一周有几天？", correct: "7", options: ["7", "5", "6", "8"] },
  { question: "地球是什么形状？", correct: "球形", options: ["球形", "方形", "三角形", "圆柱形"] },
  { question: "水的化学式是什么？", correct: "H2O", options: ["H2O", "CO2", "O2", "NaCl"] },
  { question: "中国有多少个省级行政区？", correct: "34", options: ["34", "30", "32", "36"] },
  { question: "以下哪个是哺乳动物？", correct: "鲸鱼", options: ["鲸鱼", "鲨鱼", "鳄鱼", "蜥蜴"] },
  { question: "光合作用需要什么气体？", correct: "二氧化碳", options: ["二氧化碳", "氧气", "氮气", "氢气"] },
  { question: "月亮绕地球一圈大约多久？", correct: "一个月", options: ["一个月", "一天", "一周", "一年"] },
  { question: "以下哪个是中国的传统节日？", correct: "春节", options: ["春节", "圣诞节", "感恩节", "复活节"] },
  { question: "人体最大的器官是什么？", correct: "皮肤", options: ["皮肤", "肝脏", "大脑", "心脏"] },
  { question: "哪种动物被称为百兽之王？", correct: "老虎", options: ["老虎", "狮子", "大象", "熊"] },
  { question: "一打等于几个？", correct: "12", options: ["12", "10", "24", "6"] },
  { question: "世界上最长的河流是？", correct: "尼罗河", options: ["尼罗河", "长江", "亚马逊河", "黄河"] },
  { question: "铅笔芯主要成分是什么？", correct: "石墨", options: ["石墨", "铅", "碳", "铁"] },
  { question: "WiFi 是什么的缩写？", correct: "无线保真", options: ["无线保真", "宽带网络", "光纤传输", "蓝牙连接"] },
  { question: "一天有多少小时？", correct: "24", options: ["24", "12", "48", "36"] },
  { question: "三角形内角和是多少度？", correct: "180", options: ["180", "360", "90", "270"] },
  { question: "以下哪个是可再生能源？", correct: "太阳能", options: ["太阳能", "石油", "煤炭", "天然气"] },
  { question: "蜜蜂采蜜后会酿成什么？", correct: "蜂蜜", options: ["蜂蜜", "蜂蜡", "花粉", "果酱"] },
  { question: "人体有多少块骨头？", correct: "206", options: ["206", "180", "300", "150"] },
  { question: "以下哪个行星最大？", correct: "木星", options: ["木星", "地球", "火星", "土星"] },
  { question: "彩虹有几种颜色？", correct: "7", options: ["7", "5", "6", "8"] },
  { question: "向日葵会朝向哪个方向？", correct: "太阳", options: ["太阳", "月亮", "北方", "南方"] },
  { question: "大象的鼻子有什么功能？", correct: "呼吸和抓取", options: ["呼吸和抓取", "只能呼吸", "只能抓取", "装饰用"] },
  { question: "铁生锈需要什么？", correct: "水和氧气", options: ["水和氧气", "只需要水", "只需要氧气", "阳光"] },
  { question: "哪种鸟不会飞？", correct: "企鹅", options: ["企鹅", "麻雀", "鸽子", "燕子"] },
  { question: "以下哪个是哺乳动物的特征？", correct: "胎生", options: ["胎生", "卵生", "有鳞片", "有羽毛"] },
  { question: "地球自转一圈需要多久？", correct: "24小时", options: ["24小时", "12小时", "365天", "30天"] },
  { question: "糖溶解在水里会怎样？", correct: "消失不见", options: ["消失不见", "沉到水底", "浮在水面", "变色"] },
  { question: "以下哪个是中国的首都？", correct: "北京", options: ["北京", "上海", "广州", "深圳"] },
  { question: "鸡蛋是哪种动物的卵？", correct: "鸡", options: ["鸡", "鸭", "鹅", "鸟"] },
  { question: "镜子利用的是什么原理？", correct: "光的反射", options: ["光的反射", "光的折射", "光的散射", "光的吸收"] },
  { question: "人正常体温大约是多少度？", correct: "36.5", options: ["36.5", "35", "38", "40"] },
  { question: "冰水混合物的温度是？", correct: "0度", options: ["0度", "10度", "-10度", "100度"] },
  { question: "以下哪个交通工具最快？", correct: "飞机", options: ["飞机", "火车", "汽车", "轮船"] }
];

// ============ Emoji 题库（20个） ============
const EMOJI_CAPTCHAS = [
  { question: "Tap 🐶", answer: "🐶" },
  { question: "Tap 🐱", answer: "🐱" },
  { question: "Tap 🐼", answer: "🐼" },
  { question: "Tap 🦊", answer: "🦊" },
  { question: "Tap 🐸", answer: "🐸" },
  { question: "Tap 🦁", answer: "🦁" },
  { question: "Tap 🐮", answer: "🐮" },
  { question: "Tap 🐷", answer: "🐷" },
  { question: "Tap 🐵", answer: "🐵" },
  { question: "Tap 🐰", answer: "🐰" },
  { question: "Tap 🐻", answer: "🐻" },
  { question: "Tap 🐧", answer: "🐧" },
  { question: "Tap 🦄", answer: "🦄" },
  { question: "Tap 🐙", answer: "🐙" },
  { question: "Tap 🦋", answer: "🦋" },
  { question: "Tap 🐳", answer: "🐳" },
  { question: "Tap 🦜", answer: "🦜" },
  { question: "Tap 🐢", answer: "🐢" },
  { question: "Tap 🦔", answer: "🦔" },
  { question: "Tap 🐲", answer: "🐲" }
];

// ============ 工具函数 ============
function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function generateTextQuestion() {
  const q = TEXT_QUESTIONS[Math.floor(Math.random() * TEXT_QUESTIONS.length)];
  return { question: q.question, answer: q.correct, options: shuffle(q.options) };
}

function generateEmojiCaptcha() {
  const c = EMOJI_CAPTCHAS[Math.floor(Math.random() * EMOJI_CAPTCHAS.length)];
  return { question: c.question, answer: c.answer, options: shuffle(EMOJI_CAPTCHAS.map(x => x.answer)) };
}

async function tgApi(token, method, body) {
  const resp = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  return resp.json();
}

function buildTopicTitle(from) {
  const name = [from.first_name || "", from.last_name || ""].join(" ").trim().substring(0, 50);
  const username = from.username ? `@${from.username}` : "";
  return `${name} ${username} [${from.id}]`.trim().substring(0, 128);
}

async function getOrCreateTopic(env, userId, from) {
  const existing = await env.KV.get(`user:${userId}`, { type: "json" });
  if (existing && existing.thread_id) return existing;

  const res = await tgApi(env.ENV_BOT_TOKEN, "createForumTopic", {
    chat_id: env.ENV_SUPERGROUP_ID,
    name: buildTopicTitle(from)
  });
  if (!res.ok) throw new Error("创建话题失败: " + res.description);

  const rec = { thread_id: res.result.message_thread_id, title: buildTopicTitle(from) };
  await env.KV.put(`user:${userId}`, JSON.stringify(rec));
  await env.KV.put(`thread:${rec.thread_id}`, String(userId));
  return rec;
}

async function getUserIdByThread(env, threadId) {
  const uid = await env.KV.get(`thread:${threadId}`);
  return uid ? Number(uid) : null;
}

// ============ 通知主人话题 ============
async function notifyOwner(env, userId, from, text) {
  try {
    const topic = await getOrCreateTopic(env, userId, from);
    await tgApi(env.ENV_BOT_TOKEN, "sendMessage", {
      chat_id: env.ENV_SUPERGROUP_ID,
      message_thread_id: topic.thread_id,
      text: text
    });
  } catch (e) {
    // 创建话题失败，私聊通知主人
    await tgApi(env.ENV_BOT_TOKEN, "sendMessage", { chat_id: env.ENV_OWNER_ID, text: `[话题创建失败] ${text}` });
  }
}

// ============ 发送验证题 ============
async function sendTextVerify(env, userId, from) {
  const q = generateTextQuestion();
  await env.KV.put(`verify:${userId}`, JSON.stringify({ stage: "text", answer: q.answer }), { expirationTtl: 300 });
  const buttons = q.options.map(e => ({ text: e, callback_data: `v:text:${e}` }));
  await tgApi(env.ENV_BOT_TOKEN, "sendMessage", {
    chat_id: userId,
    text: `🤖 请回答以下问题：\n\n${q.question}`,
    reply_markup: { inline_keyboard: [buttons] }
  });
  // 通知主人有新访客
  await notifyOwner(env, userId, from, `👤 新访客：${from.first_name || "未知"}\nUID: ${userId}\n正在答题...`);
}

async function sendEmojiVerify(env, userId, from) {
  const c = generateEmojiCaptcha();
  await env.KV.put(`verify:${userId}`, JSON.stringify({ stage: "emoji", answer: c.answer }), { expirationTtl: 300 });
  const buttons = c.options.map(e => ({ text: e, callback_data: `v:emoji:${e}` }));
  await tgApi(env.ENV_BOT_TOKEN, "sendMessage", {
    chat_id: userId,
    text: `⚠️ 文字验证失败，再来一个：\n\n${c.question}`,
    reply_markup: { inline_keyboard: [buttons] }
  });
  // 通知主人
  await notifyOwner(env, userId, from, `⚠️ 访客 ${from.first_name || "未知"} (${userId}) 文字验证失败，正在表情验证...`);
}

// ============ 转发消息 ============
async function forwardToTopic(env, userId, from, msg) {
  const topic = await getOrCreateTopic(env, userId, from);
  const token = env.ENV_BOT_TOKEN;
  const body = { chat_id: env.ENV_SUPERGROUP_ID, message_thread_id: topic.thread_id };

  if (msg.text) await tgApi(token, "sendMessage", { ...body, text: msg.text });
  else if (msg.photo) await tgApi(token, "sendPhoto", { ...body, photo: msg.photo[msg.photo.length - 1].file_id, caption: msg.caption || "" });
  else if (msg.video) await tgApi(token, "sendVideo", { ...body, video: msg.video.file_id, caption: msg.caption || "" });
  else if (msg.voice) await tgApi(token, "sendVoice", { ...body, voice: msg.voice.file_id });
  else if (msg.audio) await tgApi(token, "sendAudio", { ...body, audio: msg.audio.file_id, caption: msg.caption || "" });
  else if (msg.document) await tgApi(token, "sendDocument", { ...body, document: msg.document.file_id, caption: msg.caption || "" });
  else if (msg.sticker) await tgApi(token, "sendSticker", { ...body, sticker: msg.sticker.file_id });
  else if (msg.video_note) await tgApi(token, "sendVideoNote", { ...body, video_note: msg.video_note.file_id });
  else if (msg.animation) await tgApi(token, "sendAnimation", { ...body, animation: msg.animation.file_id, caption: msg.caption || "" });
  else if (msg.location) await tgApi(token, "sendLocation", { ...body, latitude: msg.location.latitude, longitude: msg.location.longitude });
  else if (msg.contact) await tgApi(token, "sendContact", { ...body, phone_number: msg.contact.phone_number, first_name: msg.contact.first_name });
  else await tgApi(token, "sendMessage", { ...body, text: "[未知消息类型]" });
}

async function replyToVisitor(env, targetUserId, msg) {
  const token = env.ENV_BOT_TOKEN;
  if (msg.text) await tgApi(token, "sendMessage", { chat_id: targetUserId, text: msg.text });
  else if (msg.photo) await tgApi(token, "sendPhoto", { chat_id: targetUserId, photo: msg.photo[msg.photo.length - 1].file_id, caption: msg.caption || "" });
  else if (msg.video) await tgApi(token, "sendVideo", { chat_id: targetUserId, video: msg.video.file_id, caption: msg.caption || "" });
  else if (msg.voice) await tgApi(token, "sendVoice", { chat_id: targetUserId, voice: msg.voice.file_id });
  else if (msg.audio) await tgApi(token, "sendAudio", { chat_id: targetUserId, audio: msg.audio.file_id });
  else if (msg.document) await tgApi(token, "sendDocument", { chat_id: targetUserId, document: msg.document.file_id, caption: msg.caption || "" });
  else if (msg.sticker) await tgApi(token, "sendSticker", { chat_id: targetUserId, sticker: msg.sticker.file_id });
  else if (msg.video_note) await tgApi(token, "sendVideoNote", { chat_id: targetUserId, video_note: msg.video_note.file_id });
  else if (msg.animation) await tgApi(token, "sendAnimation", { chat_id: targetUserId, animation: msg.animation.file_id });
  else if (msg.location) await tgApi(token, "sendLocation", { chat_id: targetUserId, latitude: msg.location.latitude, longitude: msg.location.longitude });
  else await tgApi(token, "copyMessage", { chat_id: targetUserId, from_chat_id: env.ENV_SUPERGROUP_ID, message_id: msg.message_id });
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
    await env.KV.delete(`verified:${userId}`);
    await tgApi(token, "sendMessage", { ...body, text: "✅ 用户已解封" });
    return true;
  }
  if (text === "/trust") {
    await env.KV.put(`trusted:${userId}`, "1");
    await env.KV.delete(`verified:${userId}`);
    await tgApi(token, "sendMessage", { ...body, text: "🌟 已设置永久信任" });
    return true;
  }
  if (text === "/reset") {
    await env.KV.delete(`verified:${userId}`);
    await tgApi(token, "sendMessage", { ...body, text: "🔄 验证已重置" });
    return true;
  }
  if (text === "/info") {
    await tgApi(token, "sendMessage", { ...body, text: `👤 用户信息\nUID: ${userId}\nTopic ID: ${threadId}\nLink: tg://user?id=${userId}` });
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
      if (String(mr.chat.id) === String(env.ENV_SUPERGROUP_ID) && mr.message_thread_id) {
        const userId = await getUserIdByThread(env, mr.message_thread_id);
        if (userId) {
          const emoji = (mr.new_reaction || []).map(r => r.emoji || "").filter(Boolean).join("");
          if (emoji) await tgApi(env.ENV_BOT_TOKEN, "sendMessage", { chat_id: userId, text: `👍 主人回应了你的消息：${emoji}` });
        }
      }
      return new Response("ok");
    }

    // ---- 验证回调 ----
    if (update.callback_query) {
      const q = update.callback_query;
      const uid = q.from.id;
      const data = q.data;

      // 文字验证回调
      if (data.startsWith("v:text:")) {
        const selected = data.substring(7);
        const state = await env.KV.get(`verify:${uid}`, { type: "json" });
        if (!state || state.stage !== "text") {
          return new Response(JSON.stringify({ method: "answerCallbackQuery", callback_query_id: q.id, text: "验证已过期，请重发 /start" }), { headers: { "Content-Type": "application/json" } });
        }
        if (selected === state.answer) {
          await env.KV.put(`verified:${uid}`, "1", { expirationTtl: 2592000 });
          await env.KV.delete(`verify:${uid}`);
          await notifyOwner(env, uid, q.from, `✅ 访客 ${q.from.first_name || "未知"} (${uid}) 验证通过，可以对话了`);
          return new Response(JSON.stringify({ method: "answerCallbackQuery", callback_query_id: q.id, text: "✅ 验证通过！" }), { headers: { "Content-Type": "application/json" } });
        }
        await sendEmojiVerify(env, uid, q.from);
        return new Response(JSON.stringify({ method: "answerCallbackQuery", callback_query_id: q.id, text: "❌ 答错了，请用表情再试一次" }), { headers: { "Content-Type": "application/json" } });
      }

      // 表情验证回调
      if (data.startsWith("v:emoji:")) {
        const selected = data.substring(8);
        const state = await env.KV.get(`verify:${uid}`, { type: "json" });
        if (!state || state.stage !== "emoji") {
          return new Response(JSON.stringify({ method: "answerCallbackQuery", callback_query_id: q.id, text: "验证已过期，请重发 /start" }), { headers: { "Content-Type": "application/json" } });
        }
        if (selected === state.answer) {
          await env.KV.put(`verified:${uid}`, "1", { expirationTtl: 2592000 });
          await env.KV.delete(`verify:${uid}`);
          await notifyOwner(env, uid, q.from, `✅ 访客 ${q.from.first_name || "未知"} (${uid}) 表情验证通过，可以对话了`);
          return new Response(JSON.stringify({ method: "answerCallbackQuery", callback_query_id: q.id, text: "✅ 验证通过！" }), { headers: { "Content-Type": "application/json" } });
        }
        // ban 一周
        await env.KV.put(`banned:${uid}`, "1", { expirationTtl: 604800 });
        await env.KV.delete(`verify:${uid}`);
        await tgApi(env.ENV_BOT_TOKEN, "sendMessage", { chat_id: uid, text: "🚫 验证失败，你已被关小黑屋，一周后自动解除。" });
        // 在话题里通知主人，主人可以 /unban
        await notifyOwner(env, uid, q.from, `🚫 访客 ${q.from.first_name || "未知"} (${uid}) 验证失败，已 ban 一周\n在本话题发送 /unban 可立即解封`);
        return new Response(JSON.stringify({ method: "answerCallbackQuery", callback_query_id: q.id, text: "🚫 验证失败，已被封禁一周", show_alert: true }), { headers: { "Content-Type": "application/json" } });
      }

      return new Response("ok");
    }

    // ---- 消息处理 ----
    if (update.message) {
      const msg = update.message;
      const uid = msg.from.id;
      const text = (msg.text || "").trim();

      // === 群组话题消息 ===
      if (msg.chat && String(msg.chat.id) === String(env.ENV_SUPERGROUP_ID) && msg.message_thread_id) {
        const targetUserId = await getUserIdByThread(env, msg.message_thread_id);
        if (!targetUserId) return new Response("ok");

        if (text.startsWith("/")) {
          await handleAdminCommand(env, targetUserId, msg.message_thread_id, text);
          return new Response("ok");
        }

        const closed = await env.KV.get(`closed:${targetUserId}`);
        if (closed) {
          await tgApi(env.ENV_BOT_TOKEN, "sendMessage", { chat_id: env.ENV_SUPERGROUP_ID, message_thread_id: msg.message_thread_id, text: "⚠️ 对话已关闭，请先 /open" });
          return new Response("ok");
        }

        await replyToVisitor(env, targetUserId, msg);
        return new Response("ok");
      }

      // === 私聊消息 ===

      // 命令
      if (text.startsWith("/")) {
        if (text === "/start") {
          if (String(uid) === String(env.ENV_OWNER_ID)) {
            await tgApi(env.ENV_BOT_TOKEN, "sendMessage", { chat_id: uid, text: "✅ 机器人已就绪。\n在群组话题里直接发消息即可回复访客。" });
          } else {
            const banned = await env.KV.get(`banned:${uid}`);
            if (banned) {
              await tgApi(env.ENV_BOT_TOKEN, "sendMessage", { chat_id: uid, text: "🚫 你已被关小黑屋，一周后自动解除。" });
              await notifyOwner(env, uid, msg.from, `🚫 被 ban 的访客 ${msg.from.first_name || "未知"} (${uid}) 尝试访问\n在本话题发送 /unban 可解封`);
            } else {
              await sendTextVerify(env, uid, msg.from);
            }
          }
        }
        return new Response("ok");
      }

      // 主人私聊
      if (String(uid) === String(env.ENV_OWNER_ID)) return new Response("ok");

      // 封禁检查
      const banned = await env.KV.get(`banned:${uid}`);
      if (banned) return new Response("ok");

      // 永久信任检查
      const trusted = await env.KV.get(`trusted:${uid}`);

      // 已验证 / 永久信任
      if (trusted || await env.KV.get(`verified:${uid}`)) {
        await forwardToTopic(env, uid, msg.from, msg);
        return new Response("ok");
      }

      // 未验证 → 发文字验证
      await sendTextVerify(env, uid, msg.from);
    }

    return new Response("ok");
  }
};