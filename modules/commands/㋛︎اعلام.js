const axios = require("axios");
const fs = require("fs-extra");

module.exports.config = {
  name: "اعلام",
  version: "2.1.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "لعبة تخمين الأعلام مربوطة بالخزينة المركزية",
  commandCategory: "العاب",
  usages: " ",
  cooldowns: 2
};

module.exports.handleReply = async function ({ api, event, handleReply, Currencies }) {
  const { senderID, body, threadID, messageID } = event;
  if (handleReply.author != senderID) return;

  const isTop = global.config.ADMINBOT.includes(senderID);
  const reward = isTop ? 1000 : 200; // مكافأة التوب دائماً أضخم

  if (body.toLowerCase() == handleReply.answer.toLowerCase()) {
    // إضافة الجائزة للخزينة المركزية الموحدة
    await Currencies.increaseMoney(senderID, reward);
    
    api.unsendMessage(handleReply.messageID);
    return api.sendMessage(`◈ ───『 إجـابـة صـحـيـحـة 』─── ◈\n\n◯ أحسنت يا ${isTop ? "سيدي التوب" : "بطل"}\n◯ العلم هو: ${handleReply.answer}\n◯ الجائزة: ${reward}$ أضيفت لرصيدك الموحد 💰\n\n◈ ─────────────── ◈`, threadID, messageID);
  } else {
    return api.sendMessage("◯ إجابة خاطئة! حاول مرة أخرى يا بطل..", threadID, messageID);
  }
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID, senderID } = event;

  // جلب بيانات الأعلام من مصدر موثق
  const res = await axios.get(`https://raw.githubusercontent.com/AymanSource/Flags/main/flags.json`);
  const data = res.data;
  const randomFlag = data[Math.floor(Math.random() * data.length)];

  const msg = {
    body: `◈ ───『 لـعـبـة الأعلام 』─── ◈\n\n◯ خمن اسم هذا العلم؟\n\n◈ ─────────────── ◈`,
    attachment: (await axios.get(randomFlag.link, { responseType: "stream" })).data
  };

  return api.sendMessage(msg, threadID, (err, info) => {
    global.client.handleReply.push({
      name: this.config.name,
      messageID: info.messageID,
      author: senderID,
      answer: randomFlag.name
    });
  }, messageID);
};
