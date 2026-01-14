const axios = require('axios');
const fs = require('fs-extra');
const { setTimeout: wait } = require('timers/promises');

module.exports.config = {
  name: "انترو",
  version: "2.6.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "صناعة فيديو انترو باسم الشخص المحدد (تاق/منشن/رد) مرتبط بالخزينة المركزية",
  commandCategory: "خدمات",
  usages: "[منشن / رد / كتابة الاسم]",
  cooldowns: 10,
};

module.exports.run = async ({ api, event, args, Currencies, Users }) => {
  const { threadID, messageID, senderID, mentions, messageReply, type } = event;
  const isTop = global.config.ADMINBOT.includes(senderID);
  const introCost = 250; // تكلفة الانترو للمستخدمين العاديين

  // تحديد الشخص المستهدف (التاق أو الرد)
  let targetID = senderID; // افتراضي البعث للمرسل نفسه
  let targetName = args.join(" ") || "";

  if (type === "message_reply") targetID = messageReply.senderID;
  else if (Object.keys(mentions).length > 0) targetID = Object.keys(mentions)[0];

  if (targetID !== senderID && !targetName) {
    const user = await Users.getData(targetID);
    targetName = user.name;
  }

  if (!targetName) return api.sendMessage("◯ سيدي، يرجى تحديد الشخص أو كتابة النص المراد وضعه في الانترو!", threadID, messageID);

  // التحقق من الرصيد للخزينة المركزية
  if (!isTop) {
    let userMoney = (await Currencies.getData(senderID)).money || 0;
    if (userMoney < introCost) {
      return api.sendMessage(`◯ عذراً، تكلفة صناعة فيديو انترو احترافي هي ${introCost}$ من رصيدك.\nجرب اللعب في (اعلام) لجمع المال!`, threadID, messageID);
    }
  }

  try {
    // رسالة مؤقتة أثناء التوليد
    const tempMsg = await api.sendMessage(`◈ جاري العمل في الاستوديو.. انتظر سيدي التوب 👑\n◯ قد يستغرق الأمر ثوانٍ لتوليد الفيديو.`, threadID, messageID);
    
    // توليد الفيديو
    const path = __dirname + `/cache/intro_${senderID}.mp4`;
    const response = await axios.get(`https://faheem-vip-010.faheem001.repl.co/api/ephoto/intro2?text=${encodeURIComponent(targetName)}&type=video/mp4`, { responseType: "arraybuffer" });
    fs.writeFileSync(path, Buffer.from(response.data, "utf-8"));

    // خصم التكلفة من الرصيد
    if (!isTop) await Currencies.decreaseMoney(senderID, introCost);

    // حذف رسالة الانتظار بعد الإرسال
    await api.unsendMessage(tempMsg.messageID);

    // إرسال الفيديو النهائي
    const msgBody = `◈ ───『 الـإنـتـرو الـمـلكي 』─── ◈\n\n` +
                    `✅ تم تصميم الفيديو بنجاح!\n` +
                    `📝 الاسم: ${targetName}\n` +
                    `💰 الرسوم: ${isTop ? "مجانية للتوب" : introCost + "$"}\n\n` +
                    `│←› بـإدارة الـتـوب ايـمـن 👑\n` +
                    `◈ ─────────────── ◈`;

    await api.sendMessage({ body: msgBody, attachment: fs.createReadStream(path) }, threadID, async () => {
      fs.unlinkSync(path);
    }, messageID);

  } catch (err) {
    console.log("Intro Error:", err);
    return api.sendMessage("❌ فشل الاتصال بمحرك التصميم.. ربما الخادم مشغول حالياً.", threadID, messageID);
  }
};
