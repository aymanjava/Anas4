const axios = require("axios");

module.exports.config = {
  name: "هبة",
  version: "1.0.1",
  hasPermssion: 0,
  credits: "Ayman",
  description: "ذكاء اصطناعي هبة - نسخة مستقرة وسريعة",
  commandCategory: "〘 الذكاء AI 〙",
  usages: "هبة [سؤالك]",
  cooldowns: 2
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const question = args.join(" ");

  if (!question) {
    return api.sendMessage("◯ يرجى كتابة سؤالك (مثلاً: هبة كيف حالك؟)", threadID, messageID);
  }

  api.setMessageReaction("⌛", messageID, () => {}, true);

  try {
    // استخدام API خارجي سريع ومستقر جداً
    const res = await axios.get(`https://api.samirxpikachu.it.com/blackbox?chat=${encodeURIComponent(question)}`);
    
    // استخراج الجواب (تأكد من مسار البيانات في الـ API)
    const answer = res.data.response || res.data.data || "لم أستطع إيجاد جواب مناسب.";

    let msg = `◈ ───『 الـذكـية هـبـة 』─── ◈\n\n`;
    msg += `${answer}\n\n`;
    msg += `◈ ─────────────── ◈\n`;
    msg += `│ بواسطة المطور أيمن\n`;
    msg += `◈ ─────────────── ◈`;

    api.setMessageReaction("✅", messageID, () => {}, true);
    return api.sendMessage(msg, threadID, messageID);

  } catch (err) {
    console.error(err);
    api.setMessageReaction("❌", messageID, () => {}, true);
    return api.sendMessage("⚠️ عذراً، السيرفر لا يستجيب حالياً، جرب مرة أخرى.", threadID, messageID);
  }
};
