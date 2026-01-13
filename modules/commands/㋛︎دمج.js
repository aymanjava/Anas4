const axios = require('axios');
const fs = require('fs-extra');

module.exports.config = {
  name: "دمج",
  version: "2.1.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "دمج ايموجيين مع بعض لإخراج شكل جديد ومضحك",
  commandCategory: "العاب",
  usages: "[ايموجي 1] [ايموجي 2]",
  cooldowns: 5,
  dependencies: {
    "axios": "",
    "fs-extra": ""
  }
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const emoji1 = args[0];
  const emoji2 = args[1];

  // التحقق من إدخال الإيموجيات
  if (!emoji1 || !emoji2) {
    return api.sendMessage("◈ ──『 تـنـبـيـه 』── ◈\n\n⚠️ سيدي، يرجى وضع ايموجيين بينهما فراغ.\nمثال: دمج 😎 🤣\n\n│←› بـأوامـر: الـتـوب أيـمـن 👑", threadID, messageID);
  }

  api.setMessageReaction("🧪", messageID, () => {}, true);

  try {
    // محاولة جلب الإيموجي المدمج من السيرفر
    const response = await axios.get(`https://goatbotserver.onrender.com/taoanhdep/emojimix`, {
      params: { emoji1, emoji2 },
      responseType: "stream"
    });

    api.setMessageReaction("✨", messageID, () => {}, true);

    const msg = `◈ ───『 نـتـيـجـة الـدمـج 🧪 』─── ◈\n\n◯ تـم خـلـط ${emoji1} مـع ${emoji2} بـنـجـاح!\n———————————————\n│←› بـأوامـر: الـتـوب أيـمـن 👑`;

    return api.sendMessage({
      body: msg,
      attachment: response
    }, threadID, messageID);

  } catch (e) {
    api.setMessageReaction("❌", messageID, () => {}, true);
    return api.sendMessage(`⚠️ عذراً سيدي، لا يمكن دمج هذين الإيموجيين معاً (قد لا يدعمهما النظام حالياً).`, threadID, messageID);
  }
};
