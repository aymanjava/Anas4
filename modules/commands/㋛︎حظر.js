module.exports.config = {
  name: "حظر",
  version: "11.0.0",
  hasPermssion: 2,
  credits: "Ayman",
  description: "منع الأعضاء من استخدام البوت مع التفاعل بـ 🚫 على رسائلهم",
  commandCategory: "المطور",
  usages: "[حظر/فك] [بالرد/بالتاق/بالأيدي]",
  cooldowns: 5
};

// --- نظام التفاعل التلقائي مع المحظورين ---
module.exports.handleEvent = async ({ api, event }) => {
    const { threadID, messageID, senderID, body } = event;
    const fs = require("fs-extra");
    const path = require("path");

    // التحقق إذا كان المستخدم محظوراً في قاعدة البيانات
    if (global.data.userBanned.has(senderID)) {
        // إذا كان النص يبدأ ببادئة الأوامر (مثلاً .) أو يحتوي على اسم أمر
        if (body && body.startsWith(global.config.PREFIX)) {
            return api.setMessageReaction("🚫", messageID, (err) => {}, true);
        }
    }
};

module.exports.run = async function ({ api, event, args, Users }) {
  const { threadID, messageID, senderID, messageReply, mentions } = event;
  const isTop = global.config.ADMINBOT.includes(senderID);

  if (!isTop) return api.sendMessage("◈ ───『 تـنـبـيـه 』─── ◈\n\n⚠️ عذراً، سـلـطة الـنـفي والـعفو بـيد الـتـوب ايـمـن فـقـط 👑\n\n◈ ──────────────── ◈", threadID, messageID);

  var targetID, name;

  if (messageReply) {
    targetID = messageReply.senderID;
  } else if (Object.keys(mentions).length > 0) {
    targetID = Object.keys(mentions)[0];
  } else if (args[1]) {
    targetID = args[1];
  }

  if (!targetID) return api.sendMessage("⚠️ سيدي، يرجى تحديد الشخص بالرد أو التاق أو الأيدي.", threadID, messageID);
  
  name = (await Users.getData(targetID)).name || "المستخدم";

  if (args[0] == "حظر") {
    if (global.config.ADMINBOT.includes(targetID)) return api.sendMessage("❌ سيدي، لا يمكن حظر مطور!", threadID, messageID);
    
    let data = (await Users.getData(targetID)).data || {};
    data.banned = true;
    await Users.setData(targetID, { data });
    global.data.userBanned.set(targetID, 1);

    return api.sendMessage(`◈ ───『 الـنـفي الـمـلكـي 』─── ◈\n\n🚫 تـم حـظـر: ${name}\n🆔 الأيدي: ${targetID}\n📜 الـحالة: مـنـبوذ (سـيتم الـتفاعل بـ 🚫 عـلى رسـائـله).\n\n│←› الآمر: الـتـوب ايـمـن 👑\n◈ ──────────────── ◈`, threadID, messageID);
  } 
  
  else if (args[0] == "فك" || args[0] == "رفع") {
    let data = (await Users.getData(targetID)).data || {};
    data.banned = false;
    await Users.setData(targetID, { data });
    global.data.userBanned.delete(targetID);

    return api.sendMessage(`◈ ───『 الـعـفـو الـمـلكـي 』─── ◈\n\n✅ تـم رفـع الـحـظر عـن: ${name}\n📜 الـحالة: عـاد لـرحـمة الإمـبـراطـوريـة.\n\n│←› الآمر: الـتـوب ايـمـن 👑\n◈ ──────────────── ◈`, threadID, messageID);
  } 
  else {
    return api.sendMessage("⚠️ سيدي، استخدم: [حظر] أو [فك].", threadID, messageID);
  }
};
