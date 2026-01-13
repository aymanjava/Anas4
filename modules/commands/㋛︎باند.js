const fs = require("fs-extra");

module.exports.config = {
  name: "باند",
  version: "3.5.0",
  hasPermssion: 1, // مسؤولي المجموعات والمطور
  credits: "Ayman",
  description: "المقصلة الإمبراطورية: حظر نهائي من العودة للمجموعة",
  commandCategory: "مسؤولي المجموعات",
  usages: "[بالتاغ / بالرد] أو [عرض / القائمة / الغاء / ترسيت]",
  cooldowns: 2
};

module.exports.run = async function({ api, args, event, utils }) {
  let { messageID, threadID, senderID, mentions, type, messageReply } = event;
  const path = __dirname + `/cache/bans.json`;

  // التحقق من صلاحيات البوت
  var info = await api.getThreadInfo(threadID);
  if (!info.adminIDs.some(item => item.id == api.getCurrentUserID())) 
    return api.sendMessage('⚠️ سيدي، ارفعني أدمن أولاً لكي أتمكن من استخدام المقصلة!', threadID, messageID);

  // تهيئة قاعدة بيانات المحظورين
  if (!fs.existsSync(path)) fs.writeFileSync(path, JSON.stringify({ warns: {}, banned: {} }));
  var bans = JSON.parse(fs.readFileSync(path));

  if (!bans.warns[threadID]) bans.warns[threadID] = {};
  if (!bans.banned[threadID]) bans.banned[threadID] = [];

  // --- 1. عرض قائمة المحظورين ---
  if (args[0] == "القائمة") {
    let list = bans.banned[threadID];
    if (list.length == 0) return api.sendMessage("📜 سيدي، سجون هذه المجموعة خالية حالياً.", threadID, messageID);
    let msg = "◈ ───『 سـجـن الإمـبـراطـوريـة 』─── ◈\n\n";
    for (let id of list) {
      let name = (await api.getUserInfo(id))[id].name;
      msg += `👤 الاسم: ${name}\n🆔 الأيدي: ${id}\n\n`;
    }
    return api.sendMessage(msg + "◈ ──────────────── ◈", threadID, messageID);
  }

  // --- 2. إلغاء الحظر ---
  if (args[0] == "الغاء") {
    if (!info.adminIDs.some(item => item.id == senderID)) return api.sendMessage("⚠️ عذراً، هذا الأمر للقيادة العليا فقط.", threadID, messageID);
    let id = args[1] || (type == "message_reply" ? messageReply.senderID : Object.keys(mentions)[0]);
    if (!id || !bans.banned[threadID].includes(parseInt(id))) return api.sendMessage("⚠️ سيدي، هذا الشخص ليس في قائمة المحظورين.", threadID, messageID);
    
    bans.banned[threadID] = bans.banned[threadID].filter(i => i != parseInt(id));
    fs.writeFileSync(path, JSON.stringify(bans, null, 2));
    return api.sendMessage(`✅ تم العفو عن صاحب المعرف ${id} وإخراجه من السجن.`, threadID, messageID);
  }

  // --- 3. ترسيت البيانات ---
  if (args[0] == "ترسيت") {
    if (!info.adminIDs.some(item => item.id == senderID)) return api.sendMessage("⚠️ الصلاحيات غير كافية.", threadID, messageID);
    bans.warns[threadID] = {};
    bans.banned[threadID] = [];
    fs.writeFileSync(path, JSON.stringify(bans, null, 2));
    return api.sendMessage("🔱 تم تصفير سجلات الحظر في مجموعتك سيدي.", threadID, messageID);
  }

  // --- 4. تنفيذ الباند (المقصلة) ---
  let targetIDs = [];
  if (type == "message_reply") targetIDs.push(messageReply.senderID);
  else if (Object.keys(mentions).length != 0) targetIDs = Object.keys(mentions);
  else return api.sendMessage("⚠️ سيدي، حدد الضحية بالتاغ أو الرد على رسالته لإنزال العقوبة.", threadID, messageID);

  if (!info.adminIDs.some(item => item.id == senderID)) return api.sendMessage("⚠️ لا تملك سلطة استخدام المقصلة.", threadID, messageID);

  let reason = args.join(" ").replace(/@\S+/g, "").trim() || "مخالفة أوامر الإمبراطورية";
  let punishedNames = [];

  for (let id of targetIDs) {
    if (id == api.getCurrentUserID()) continue;
    let name = (await api.getUserInfo(id))[id].name;
    punishedNames.push(name);
    
    // الطرد والحظر
    await api.removeUserFromGroup(id, threadID);
    if (!bans.banned[threadID].includes(parseInt(id))) bans.banned[threadID].push(parseInt(id));
  }

  fs.writeFileSync(path, JSON.stringify(bans, null, 2));
  
  let finalMsg = `┏━━━━━━ ⚔️ ━━━━━━┓\n   تـنـفـيـذ الـبـانـد الـمـلـكـي\n┗━━━━━━ ⚔️ ━━━━━━┛\n\n` +
                 `👤 الضحايا: ${punishedNames.join(", ")}\n` +
                 `📝 السبب: ${reason}\n` +
                 `🚫 الحالة: طرد + حظر نهائي\n\n` +
                 `————————————————\n` +
                 `│←› جـلاد الإمـبـراطـوريـة: الـتـوب ايـمـن 👑\n` +
                 `◈ ──────────────── ◈`;

  return api.sendMessage(finalMsg, threadID, messageID);
};
