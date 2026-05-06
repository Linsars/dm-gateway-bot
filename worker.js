const BOT_NAME = "tg-o2o-bot";

const HTML_PAGE = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${BOT_NAME}</title>
<style>
body{font-family:Arial,sans-serif;text-align:center;padding:50px;background:#f5f5f5}
.box{background:#fff;padding:30px;border-radius:10px;max-width:420px;margin:0 auto;box-shadow:0 2px 8px rgba(0,0,0,.08)}
input{width:90%;padding:10px;margin:10px 0;border:1px solid #ddd;border-radius:5px;font-size:14px}
button{background:#0088cc;color:#fff;border:none;padding:12px 28px;border-radius:5px;font-size:15px;cursor:pointer;margin-top:10px}
button:hover{background:#006699}.tip{font-size:12px;color:#999;margin-top:15px}
#result{margin-top:15px;padding:10px;border-radius:5px;display:none}
.ok{background:#d4edda;color:#155724}.err{background:#f8d7da;color:#721c24}
#health{position:fixed;top:10px;right:10px;padding:4px 10px;border-radius:12px;font-size:11px;color:#fff;cursor:pointer}
.h-ok{background:#28a745}.h-err{background:#dc3545}.h-ing{background:#6c757d}
</style>
</head>
<body>
<span id="health" class="h-ing">检查中...</span>
<div class="box">
<h1>🤖 Telegram Bot</h1>
<p>输入 Bot Token 激活 Webhook：</p>
<input type="text" id="token" placeholder="123456:ABC-DEF..."><br>
<button onclick="activate()">激活机器人</button>
<div id="result"></div>
<p class="tip">Token 仅在浏览器本地使用，不会上传到服务器</p>
</div>
<script>
(async()=>{try{const r=await fetch("/health?key="+new URLSearchParams(location.search).get("key"));const d=await r.json();const h=document.getElementById("health");h.textContent=d.status==="ok"?"运行中":"异常";h.className=d.status==="ok"?"h-ok":"h-err"}catch(e){document.getElementById("health").textContent="离线";document.getElementById("health").className="h-err"}})();
async function activate(){var t=document.getElementById("token").value.trim(),r=document.getElementById("result");if(!t){r.style.display="block";r.className="err";r.textContent="请输入 Token";return}r.style.display="block";r.className="";r.textContent="正在激活...";try{var s="__SECRET__";var url="https://api.telegram.org/bot"+t+"/setWebhook?url="+encodeURIComponent(location.origin);if(s)url+="&secret_token="+encodeURIComponent(s);var resp=await fetch(url);var d=await resp.json();if(d.ok){r.className="ok";r.textContent="✅ 激活成功！"}else{r.className="err";r.textContent="❌ "+d.description}}catch(e){r.className="err";r.textContent="❌ "+e.message}}
</script></body></html>`;

const TEXT_QUESTIONS = [
  {q:"冰融化后会变成什么？",a:"水",o:["水","石头","木头","火"]},{q:"正常人有几只眼睛？",a:"2",o:["2","1","3","4"]},{q:"以下哪个属于水果？",a:"香蕉",o:["香蕉","白菜","猪肉","大米"]},{q:"1 加 2 等于几？",a:"3",o:["3","2","4","5"]},{q:"5 减 2 等于几？",a:"3",o:["3","1","2","4"]},{q:"2 乘以 3 等于几？",a:"6",o:["6","4","5","7"]},{q:"在天上飞的交通工具是什么？",a:"飞机",o:["飞机","汽车","轮船","自行车"]},{q:"星期一的后面是星期几？",a:"星期二",o:["星期二","星期日","星期五","星期三"]},{q:"鱼通常生活在哪里？",a:"水里",o:["水里","树上","土里","火里"]},{q:"晴朗的天空通常是什么颜色？",a:"蓝色",o:["蓝色","绿色","红色","紫色"]},{q:"太阳从哪个方向升起？",a:"东方",o:["东方","西方","南方","北方"]},{q:"小狗发出的叫声通常是？",a:"汪汪",o:["汪汪","喵喵","咩咩","呱呱"]},{q:"10 加 5 等于几？",a:"15",o:["15","10","12","20"]},{q:"8 减 4 等于几？",a:"4",o:["4","2","3","5"]},{q:"我们用什么器官来听声音？",a:"耳朵",o:["耳朵","眼睛","鼻子","嘴巴"]},{q:"一年有几个月？",a:"12",o:["12","10","11","13"]},{q:"一周有几天？",a:"7",o:["7","5","6","8"]},{q:"地球是什么形状？",a:"球形",o:["球形","方形","三角形","圆柱形"]},{q:"水的化学式是什么？",a:"H2O",o:["H2O","CO2","O2","NaCl"]},{q:"中国有多少个省级行政区？",a:"34",o:["34","30","32","36"]},{q:"以下哪个是哺乳动物？",a:"鲸鱼",o:["鲸鱼","鲨鱼","鳄鱼","蜥蜴"]},{q:"光合作用需要什么气体？",a:"二氧化碳",o:["二氧化碳","氧气","氮气","氢气"]},{q:"月亮绕地球一圈大约多久？",a:"一个月",o:["一个月","一天","一周","一年"]},{q:"以下哪个是中国的传统节日？",a:"春节",o:["春节","圣诞节","感恩节","复活节"]},{q:"人体最大的器官是什么？",a:"皮肤",o:["皮肤","肝脏","大脑","心脏"]},{q:"哪种动物被称为百兽之王？",a:"老虎",o:["老虎","狮子","大象","熊"]},{q:"一打等于几个？",a:"12",o:["12","10","24","6"]},{q:"世界上最长的河流是？",a:"尼罗河",o:["尼罗河","长江","亚马逊河","黄河"]},{q:"铅笔芯主要成分是什么？",a:"石墨",o:["石墨","铅","碳","铁"]},{q:"WiFi 是什么的缩写？",a:"无线保真",o:["无线保真","宽带网络","光纤传输","蓝牙连接"]},{q:"一天有多少小时？",a:"24",o:["24","12","48","36"]},{q:"三角形内角和是多少度？",a:"180",o:["180","360","90","270"]},{q:"以下哪个是可再生能源？",a:"太阳能",o:["太阳能","石油","煤炭","天然气"]},{q:"蜜蜂采蜜后会酿成什么？",a:"蜂蜜",o:["蜂蜜","蜂蜡","花粉","果酱"]},{q:"人体有多少块骨头？",a:"206",o:["206","180","300","150"]},{q:"以下哪个行星最大？",a:"木星",o:["木星","地球","火星","土星"]},{q:"彩虹有几种颜色？",a:"7",o:["7","5","6","8"]},{q:"向日葵会朝向哪个方向？",a:"太阳",o:["太阳","月亮","北方","南方"]},{q:"大象的鼻子有什么功能？",a:"呼吸和抓取",o:["呼吸和抓取","只能呼吸","只能抓取","装饰用"]},{q:"铁生锈需要什么？",a:"水和氧气",o:["水和氧气","只需要水","只需要氧气","阳光"]},{q:"哪种鸟不会飞？",a:"企鹅",o:["企鹅","麻雀","鸽子","燕子"]},{q:"以下哪个是哺乳动物的特征？",a:"胎生",o:["胎生","卵生","有鳞片","有羽毛"]},{q:"地球自转一圈需要多久？",a:"24小时",o:["24小时","12小时","365天","30天"]},{q:"糖溶解在水里会怎样？",a:"消失不见",o:["消失不见","沉到水底","浮在水面","变色"]},{q:"以下哪个是中国的首都？",a:"北京",o:["北京","上海","广州","深圳"]},{q:"鸡蛋是哪种动物的卵？",a:"鸡",o:["鸡","鸭","鹅","鸟"]},{q:"镜子利用的是什么原理？",a:"光的反射",o:["光的反射","光的折射","光的散射","光的吸收"]},{q:"人正常体温大约是多少度？",a:"36.5",o:["36.5","35","38","40"]},{q:"冰水混合物的温度是？",a:"0度",o:["0度","10度","-10度","100度"]},{q:"以下哪个交通工具最快？",a:"飞机",o:["飞机","火车","汽车","轮船"]}
];

const EMOJI_POOL = ["🐶","🐱","🐼","🦊","🐸","🦁","🐮","🐷","🐵","🐰","🐻","🐧","🦄","🐙","🦋","🐳","🦜","🐢","🦔","🐲"];

function shuffle(a){const b=[...a];for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]]}return b}
function genTextQ(){const q=TEXT_QUESTIONS[Math.floor(Math.random()*TEXT_QUESTIONS.length)];return{question:q.q,answer:q.a,options:shuffle(q.o)}}
function genEmojiQ(){const answer=EMOJI_POOL[Math.floor(Math.random()*EMOJI_POOL.length)];const d=shuffle(EMOJI_POOL.filter(e=>e!==answer)).slice(0,7);return{question:`Tap ${answer}`,answer,options:shuffle([answer,...d])}}
function shortId(){return Math.random().toString(36).substring(2,8)}
function msToTime(ms){const h=Math.floor(ms/3600000);return h<24?`${h}小时`:`${Math.floor(h/24)}天${h%24}小时`}

async function tgWithRetry(token,method,body,retries=2){
  for(let i=0;i<=retries;i++){
    try{
      const r=await fetch(`https://api.telegram.org/bot${token}/${method}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
      const d=await r.json();
      if(d.ok||i===retries)return d;
      if(d.error_code===429){const wait=(d.parameters?.retry_after||1)*1000;await new Promise(r=>setTimeout(r,wait));continue}
      return d;
    }catch(e){if(i===retries)return{ok:false,description:e.message};await new Promise(r=>setTimeout(r,1000))}
  }
}

async function isBlocked(token,userId){
  const r=await fetch(`https://api.telegram.org/bot${token}/sendChatAction`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({chat_id:userId,action:"typing"})});
  const d=await r.json();return!d.ok&&(d.description||"").includes("blocked");
}

function buildTopicTitle(from){
  const name=[from.first_name||"",from.last_name||""].join(" ").trim().substring(0,50);
  const u=from.username?`@${from.username}`:"";
  return`${name} ${u} [${from.id}]`.trim().substring(0,128);
}

async function getTopic(env,userId,from){
  const ex=await env.KV.get(`user:${userId}`,{type:"json"});
  if(ex?.thread_id){
    if(from&&(ex.last_name!==from.last_name||ex.username!==from.username)){
      const newTitle=buildTopicTitle(from);
      if(newTitle!==ex.title){
        try{await tgWithRetry(env.ENV_BOT_TOKEN,"editForumTopic",{chat_id:env.ENV_SUPERGROUP_ID,message_thread_id:ex.thread_id,name:newTitle});}catch(e){}
        ex.title=newTitle;ex.username=from.username;ex.last_name=from.last_name;
        await env.KV.put(`user:${userId}`,JSON.stringify(ex));
      }
    }
    return ex;
  }
  const title=buildTopicTitle(from);
  const res=await tgWithRetry(env.ENV_BOT_TOKEN,"createForumTopic",{chat_id:env.ENV_SUPERGROUP_ID,name:title});
  if(!res.ok)throw new Error("创建话题失败: "+res.description);
  const rec={thread_id:res.result.message_thread_id,title,username:from.username,last_name:from.last_name};
  await env.KV.put(`user:${userId}`,JSON.stringify(rec));
  await env.KV.put(`thread:${rec.thread_id}`,String(userId));
  return rec;
}

async function uidByThread(env,tid){const u=await env.KV.get(`thread:${tid}`);return u?Number(u):null}

function scheduleDelete(ctx,token,chatId,msgId){
  const p=new Promise(r=>setTimeout(async()=>{try{await tgWithRetry(token,"deleteMessage",{chat_id:chatId,message_id:msgId});}catch(e){}r()},30000));
  if(ctx?.waitUntil)ctx.waitUntil(p);
}

async function notifyOwner(env,userId,from,text){
  try{const topic=await getTopic(env,userId,from);await tgWithRetry(env.ENV_BOT_TOKEN,"sendMessage",{chat_id:env.ENV_SUPERGROUP_ID,message_thread_id:topic.thread_id,text});}
  catch(e){console.error("notifyOwner failed:",e.message);try{await tgWithRetry(env.ENV_BOT_TOKEN,"sendMessage",{chat_id:env.ENV_OWNER_ID,text:`[话题失败] ${text}`});}catch(e2){console.error("notifyOwner fallback failed:",e2.message)}}
}

async function sendTextVerify(env,ctx,userId,from){
  const q=genTextQ();const qid=shortId();
  const opts=shuffle(q.options);
  await env.KV.put(`v:${qid}`,{answer:q.answer,uid:userId},{expirationTtl:300});
  await env.KV.put(`verify:${userId}`,{stage:"text",qid,warned:false,qids:[]},{expirationTtl:300});
  const buttons=opts.map((_,i)=>({text:opts[i],callback_data:`vt:${qid}:${i}`}));
  const res=await tgWithRetry(env.ENV_BOT_TOKEN,"sendMessage",{chat_id:userId,text:`🤖 请回答以下问题：\n\n${q.question}`,reply_markup:{inline_keyboard:[buttons]}});
  if(res.ok?.result){const s=await env.KV.get(`verify:${userId}`,{type:"json"});if(s){s.qids.push(res.result.message_id);await env.KV.put(`verify:${userId}`,s,{expirationTtl:300})}}
  await notifyOwner(env,userId,from,`👤 新访客：${from.first_name||"未知"}\nUID: ${userId}\n正在答题...`);
}

async function sendEmojiVerify(env,ctx,userId,from){
  const c=genEmojiQ();const qid=shortId();
  await env.KV.put(`v:${qid}`,{answer:c.answer,uid:userId},{expirationTtl:300});
  const old=await env.KV.get(`verify:${userId}`,{type:"json"});
  await env.KV.put(`verify:${userId}`,{stage:"emoji",qid,warned:false,qids:old?.qids||[]},{expirationTtl:300});
  const buttons=c.options.map((_,i)=>({text:c.options[i],callback_data:`ve:${qid}:${i}`}));
  const res=await tgWithRetry(env.ENV_BOT_TOKEN,"sendMessage",{chat_id:userId,text:`⚠️ 文字验证失败，再来一个：\n\n${c.question}`,reply_markup:{inline_keyboard:[buttons]}});
  if(res.ok?.result){const s=await env.KV.get(`verify:${userId}`,{type:"json"});if(s){s.qids.push(res.result.message_id);await env.KV.put(`verify:${userId}`,s,{expirationTtl:300})}}
}

async function deleteVerifyMsgs(env,userId){
  const s=await env.KV.get(`verify:${userId}`,{type:"json"});
  if(s?.qids)await Promise.allSettled(s.qids.map(mid=>tgWithRetry(env.ENV_BOT_TOKEN,"deleteMessage",{chat_id:userId,message_id:mid})));
}

async function sendMsg(token,chatId,msg,extra){
  const b={chat_id:chatId,...extra};
  if(msg.text)return tgWithRetry(token,"sendMessage",{...b,text:msg.text});
  if(msg.photo)return tgWithRetry(token,"sendPhoto",{...b,photo:msg.photo[msg.photo.length-1].file_id,caption:msg.caption||""});
  if(msg.video)return tgWithRetry(token,"sendVideo",{...b,video:msg.video.file_id,caption:msg.caption||""});
  if(msg.voice)return tgWithRetry(token,"sendVoice",{...b,voice:msg.voice.file_id});
  if(msg.audio)return tgWithRetry(token,"sendAudio",{...b,audio:msg.audio.file_id,caption:msg.caption||""});
  if(msg.document)return tgWithRetry(token,"sendDocument",{...b,document:msg.document.file_id,caption:msg.caption||""});
  if(msg.sticker)return tgWithRetry(token,"sendSticker",{...b,sticker:msg.sticker.file_id});
  if(msg.video_note)return tgWithRetry(token,"sendVideoNote",{...b,video_note:msg.video_note.file_id});
  if(msg.animation)return tgWithRetry(token,"sendAnimation",{...b,animation:msg.animation.file_id,caption:msg.caption||""});
  if(msg.location)return tgWithRetry(token,"sendLocation",{...b,latitude:msg.location.latitude,longitude:msg.location.longitude});
  if(msg.contact)return tgWithRetry(token,"sendContact",{...b,phone_number:msg.contact.phone_number,first_name:msg.contact.first_name});
  return tgWithRetry(token,"sendMessage",{...b,text:"[未知消息类型]"});
}

async function forwardToTopic(env,ctx,userId,from,msg){
  const topic=await getTopic(env,userId,from);
  const res=await sendMsg(env.ENV_BOT_TOKEN,env.ENV_SUPERGROUP_ID,msg,{message_thread_id:topic.thread_id});
  if(res.ok?.result?.message_id){
    await env.KV.put(`m:${env.ENV_SUPERGROUP_ID}:${res.result.message_id}`,userId,{expirationTtl:86400});
    await env.KV.put(`mv:${userId}:${msg.message_id}`,res.result.message_id,{expirationTtl:86400});
  }
}

async function replyToVisitor(env,ctx,targetUserId,msg){
  const res=await sendMsg(env.ENV_BOT_TOKEN,targetUserId,msg);
  if(!res.ok&&(res.description||"").includes("blocked")){
    const topic=await env.KV.get(`user:${targetUserId}`,{type:"json"});
    if(topic)await tgWithRetry(env.ENV_BOT_TOKEN,"sendMessage",{chat_id:env.ENV_SUPERGROUP_ID,message_thread_id:topic.thread_id,text:"⚠️ 该访客已断开连接（可能屏蔽了机器人）"});
    return;
  }
}

async function handleAdmin(env,ctx,userId,tid,text){
  const t=env.ENV_BOT_TOKEN,cid=env.ENV_SUPERGROUP_ID,b={chat_id:cid,message_thread_id:tid};
  const cmds={
    "/close":async()=>{await env.KV.put(`closed:${userId}`,"1");await tgWithRetry(t,"closeForumTopic",{chat_id:cid,message_thread_id:tid});await tgWithRetry(t,"sendMessage",{...b,text:"🚫 对话已关闭"})},
    "/open":async()=>{await env.KV.delete(`closed:${userId}`);await tgWithRetry(t,"reopenForumTopic",{chat_id:cid,message_thread_id:tid});await tgWithRetry(t,"sendMessage",{...b,text:"✅ 对话已恢复"})},
    "/ban":async()=>{await env.KV.put(`banned:${userId}`,"1");await tgWithRetry(t,"sendMessage",{...b,text:"🚫 用户已封禁"})},
    "/unban":async()=>{await env.KV.delete(`banned:${userId}`);await env.KV.delete(`verified:${userId}`);await tgWithRetry(t,"sendMessage",{...b,text:"✅ 用户已解封"})},
    "/trust":async()=>{await env.KV.put(`trusted:${userId}`,"1");await env.KV.delete(`verified:${userId}`);await tgWithRetry(t,"sendMessage",{...b,text:"🌟 已设置永久信任"})},
    "/reset":async()=>{await env.KV.delete(`verified:${userId}`);await tgWithRetry(t,"sendMessage",{...b,text:"🔄 验证已重置"})},
    "/info":async()=>{await tgWithRetry(t,"sendMessage",{...b,text:`👤 UID: ${userId}\nTopic: ${tid}\nLink: tg://user?id=${userId}`})},
  };
  if(cmds[text]){await cmds[text]();return true}return false;
}

export default{
  async fetch(request,env,ctx){
    try{
      if(request.method==="GET"){
        const url=new URL(request.url);
        if(url.pathname==="/health"){
          const key=env.ENV_HEALTH_KEY;
          if(key&&url.searchParams.get("key")!==key)return new Response("Forbidden",{status:403});
          return new Response(JSON.stringify({status:"ok",bot:BOT_NAME,time:new Date().toISOString()}),{headers:{"Content-Type":"application/json"}});
        }
        return new Response(HTML_PAGE.replace("__SECRET__",env.ENV_WEBHOOK_SECRET||""),{headers:{"Content-Type":"text/html; charset=utf-8"}});
      }
      if(request.method!=="POST")return new Response("Method not allowed",{status:405});

      const secret=env.ENV_WEBHOOK_SECRET;
      if(secret&&request.headers.get("X-Telegram-Bot-Api-Secret-Token")!==secret)return new Response("Unauthorized",{status:401});

      const update=await request.json();

      if(update.edited_message){
        const msg=update.edited_message,uid=msg.from.id;
        if(String(uid)===String(env.ENV_OWNER_ID)&&msg.chat&&String(msg.chat.id)===String(env.ENV_SUPERGROUP_ID)&&msg.message_thread_id){
          const target=await uidByThread(env,msg.message_thread_id);
          if(target)await sendMsg(env.ENV_BOT_TOKEN,target,msg);
        }else if(String(uid)!==String(env.ENV_OWNER_ID)){
          const topic=await env.KV.get(`user:${uid}`,{type:"json"});
          if(topic?.thread_id)await sendMsg(env.ENV_BOT_TOKEN,env.ENV_SUPERGROUP_ID,msg,{message_thread_id:topic.thread_id});
        }
        return new Response("ok");
      }

      if(update.message_reaction){
        const mr=update.message_reaction;
        if(String(mr.chat.id)===String(env.ENV_SUPERGROUP_ID)&&mr.message_thread_id){
          const uid=await uidByThread(env,mr.message_thread_id);
          if(uid){
            const emoji=(mr.new_reaction||[]).map(r=>r.emoji||"").filter(Boolean).join("");
            if(emoji)await tgWithRetry(env.ENV_BOT_TOKEN,"sendMessage",{chat_id:uid,text:`👍 主人回应：${emoji}`});
          }
        }
        return new Response("ok");
      }

      if(update.callback_query){
        const q=update.callback_query,uid=q.from.id,data=q.data;

        if(data.startsWith("vt:")||data.startsWith("ve:")){
          const parts=data.split(":"),type=parts[0],qid=parts[1],idx=parseInt(parts[2]);
          const vdata=await env.KV.get(`v:${qid}`,{type:"json"});
          if(!vdata||vdata.uid!==uid)return new Response(JSON.stringify({method:"answerCallbackQuery",callback_query_id:q.id,text:"验证已过期，请重发 /start"}),{headers:{"Content-Type":"application/json"}});
          const state=await env.KV.get(`verify:${uid}`,{type:"json"});
          if(!state)return new Response(JSON.stringify({method:"answerCallbackQuery",callback_query_id:q.id,text:"验证已过期"}),{headers:{"Content-Type":"application/json"}});

          let selected;
          if(type==="vt"){
            const tq=TEXT_QUESTIONS.find(x=>x.a===vdata.answer);
            if(tq){const opts=shuffle(tq.o);selected=opts[idx]}
          }else{
            const answer=vdata.answer;
            const distractors=shuffle(EMOJI_POOL.filter(e=>e!==answer)).slice(0,7);
            const opts=shuffle([answer,...distractors]);selected=opts[idx];
          }

          if(selected===vdata.answer){
            await deleteVerifyMsgs(env,uid);
            await env.KV.put(`verified:${uid}`,"1",{expirationTtl:2592000});await env.KV.delete(`verify:${uid}`);await env.KV.delete(`v:${qid}`);
            await notifyOwner(env,uid,q.from,`✅ 访客 ${q.from.first_name||"未知"} (${uid}) 验证通过`);
            return new Response(JSON.stringify({method:"answerCallbackQuery",callback_query_id:q.id,text:"✅ 验证通过！"}),{headers:{"Content-Type":"application/json"}});
          }

          if(type==="vt"){
            await sendEmojiVerify(env,ctx,uid,q.from);
            return new Response(JSON.stringify({method:"answerCallbackQuery",callback_query_id:q.id,text:"❌ 答错了，请用表情再试一次"}),{headers:{"Content-Type":"application/json"}});
          }

          await deleteVerifyMsgs(env,uid);
          const banExpiry=Date.now()+604800000;
          await env.KV.put(`banned:${uid}`,{until:banExpiry},{expirationTtl:604800});await env.KV.delete(`verify:${uid}`);await env.KV.delete(`v:${qid}`);
          await tgWithRetry(env.ENV_BOT_TOKEN,"sendMessage",{chat_id:uid,text:`🚫 验证失败，你已被关小黑屋，${msToTime(604800000)}后自动解除。`});
          await notifyOwner(env,uid,q.from,`🚫 访客 ${q.from.first_name||"未知"} (${uid}) 验证失败，已 ban\n在本话题发送 /unban 可解封`);
          return new Response(JSON.stringify({method:"answerCallbackQuery",callback_query_id:q.id,text:"🚫 已被封禁",show_alert:true}),{headers:{"Content-Type":"application/json"}});
        }
        return new Response("ok");
      }

      if(update.message){
        const msg=update.message,uid=msg.from.id,text=(msg.text||"").trim();

        if(msg.chat&&String(msg.chat.id)===String(env.ENV_SUPERGROUP_ID)&&msg.message_thread_id){
          const target=await uidByThread(env,msg.message_thread_id);
          if(!target)return new Response("ok");
          if(text.startsWith("/")){await handleAdmin(env,ctx,target,msg.message_thread_id,text);return new Response("ok")}
          if(await env.KV.get(`closed:${target}`)){
            await tgWithRetry(env.ENV_BOT_TOKEN,"sendMessage",{chat_id:env.ENV_SUPERGROUP_ID,message_thread_id:msg.message_thread_id,text:"⚠️ 对话已关闭，请先 /open"});
            return new Response("ok");
          }
          await replyToVisitor(env,ctx,target,msg);
          if(msg.reply_to_message){
            const origMsgId=msg.reply_to_message.message_id;
            const visitorUid=await env.KV.get(`m:${env.ENV_SUPERGROUP_ID}:${origMsgId}`,{type:"json"});
            if(visitorUid)await env.KV.put(`mr:${visitorUid}:${msg.message_id}`,origMsgId,{expirationTtl:86400});
          }
          return new Response("ok");
        }

        if(String(uid)===String(env.ENV_OWNER_ID))return new Response("ok");

        const banData=await env.KV.get(`banned:${uid}`);
        if(banData){
          if(typeof banData==="object"&&banData.until){
            if(Date.now()<banData.until)return new Response("ok");
            await env.KV.delete(`banned:${uid}`);
          }else return new Response("ok");
        }

        if(await env.KV.get(`trusted:${uid}`)||await env.KV.get(`verified:${uid}`)){
          if(text==="/start"){await tgWithRetry(env.ENV_BOT_TOKEN,"sendMessage",{chat_id:uid,text:"✅ 你已通过验证，直接发消息即可。"});return new Response("ok")}
          if(text==="/status"){
            const exp=2592000;
            await tgWithRetry(env.ENV_BOT_TOKEN,"sendMessage",{chat_id:uid,text:`✅ 验证状态：有效\n有效期：${msToTime(exp*1000)}`});
            return new Response("ok");
          }
          await forwardToTopic(env,ctx,uid,msg.from,msg);
          return new Response("ok");
        }

        if(text.startsWith("/")){
          if(text==="/start"){
            const vs=await env.KV.get(`verify:${uid}`,{type:"json"});
            if(vs){const r=await tgWithRetry(env.ENV_BOT_TOKEN,"sendMessage",{chat_id:uid,text:"⏳ 验证进行中，请回答上方的问题。"});if(r.ok?.result)scheduleDelete(ctx,env.ENV_BOT_TOKEN,uid,r.result.message_id)}
            else await sendTextVerify(env,ctx,uid,msg.from);
          }
          return new Response("ok");
        }

        const vs=await env.KV.get(`verify:${uid}`,{type:"json"});
        if(vs){
          if(vs.warned){
            await deleteVerifyMsgs(env,uid);
            await env.KV.put(`banned:${uid}`,{until:Date.now()+3600000},{expirationTtl:3600});await env.KV.delete(`verify:${uid}`);
            await tgWithRetry(env.ENV_BOT_TOKEN,"sendMessage",{chat_id:uid,text:"🚫 无视警告，你已被封禁1小时。"});
            await notifyOwner(env,uid,msg.from,`🚫 访客 ${msg.from.first_name||"未知"} (${uid}) 无视警告，已 ban 1小时`);
          }else{
            vs.warned=true;await env.KV.put(`verify:${uid}`,vs,{expirationTtl:300});
            const r=await tgWithRetry(env.ENV_BOT_TOKEN,"sendMessage",{chat_id:uid,text:"⚠️ 请认真答题，再次乱发消息将被封禁。"});
            if(r.ok?.result)scheduleDelete(ctx,env.ENV_BOT_TOKEN,uid,r.result.message_id);
          }
          return new Response("ok");
        }

        await sendTextVerify(env,ctx,uid,msg.from);
      }

      return new Response("ok");
    }catch(e){
      console.error("Unhandled error:",e);
      return new Response("ok");
    }
  }
};