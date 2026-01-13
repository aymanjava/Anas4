const axios = require("axios");

module.exports.config = {
  name: "هبة",
  version: "5.0.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "ذكاء اصطناعي هبة - نسخة مجانية تعمل بدون مفاتيح",
  usePrefix: false,
  commandCategory: "الذكاء",
  usages: "[سؤالك]",
  cooldowns: 2,
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID, senderID } = event;
  const prompt = args.join(" ");

  // إذا لم يكتب المستخدم شيئاً
  if (!prompt) {
    return api.sendMessage("◯ نعم؟ أنا هبة، اسألني أي شيء وسأجيبك فوراً.", threadID, messageID);
  }

  // وضع تفاعل الانتظار
  api.setMessageReaction("⌛", messageID, () => {}, true);

  try {
    // الاتصال بالذكاء الاصطناعي عبر رابط مجاني ومستقر
    const res = await axios.get(`https://api.popcat.xyz/chatbot?msg=${encodeURIComponent(prompt)}&botname=Heba&owner=Ayman`);
    
    // استخراج الإجابة من البيانات القادمة
    const response = res.data.response;

    if (!response) throw new Error("No Response");

    let msg = `◈ ───『 الـذكـية هـبـة 』─── ◈\n\n`;
    msg += `${response}\n\n`;
    msg += `◈ ─────────────── ◈\n`;
    msg += `│ بواسطة المطور أيمن\n`;
    msg += `◈ ─────────────── ◈`;

    // تغيير التفاعل عند النجاح وإرسال الرسالة
    api.setMessageReaction("✨", messageID, () => {}, true);
    return api.sendMessage(msg, threadID, messageID);

  } catch (error) {
    console.error(error);
    api.setMessageReaction("❌", messageID, () => {}, true);
    return api.sendMessage("⚠️ عذراً أيمن، السيرفر المجاني مضغوط حالياً، حاول مجدداً بعد ثوانٍ.", threadID, messageID);
  }
};
