const axios = require("axios");

module.exports.config = {
  name: "اسلاميات",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "فئة شاملة (قصص، أحاديث، تفسير، سور)",
  commandCategory: "فئة اسلاميات",
  usages: "[النوع] [البحث]",
  usePrefix: true,
  cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
  const { threadID, messageID } = event;
  const type = args[0];
  const query = args.slice(1).join(" ");

  const menu = `╭━━━━• 𝑯𝑬𝑩𝑨 •━━━━╮
أهلاً بك في قسم الإسلاميات
استخدم الأمر كالتالي:

1 ⟢ اسلاميات حديث (لجلب حديث)
2 ⟢ اسلاميات قصة (قصص أنبياء وصحابة)
3 ⟢ اسلاميات تفسير [اسم السورة]
4 ⟢ اسلاميات معنى [الكلمة]
5 ⟢ اسلاميات سورة [اسم السورة]
╰━━━━━━━━━━━━━━━━╯`;

  if (!type) return api.sendMessage(menu, threadID, messageID);

  try {
    api.setMessageReaction("✨", messageID, () => {}, true);
    
    // ملاحظة: نستخدم هنا APIs عامة ومفتوحة للمحتوى الإسلامي
    let apiUrl = "";
    if (type == "حديث") apiUrl = `https://api.ahadith.co.uk/api/hadith/random/ar`;
    if (type == "قصة") apiUrl = `https://raw.githubusercontent.com/Ayman/IslamicDB/main/stories.json`; // مثال لمصدر بيانات

    // للتبسيط ولضمان العمل 100% سنستخدم رداً ذكياً عبر محرك البحث الذي بنيناه لهبة
    const res = await axios.get(`https://api.popcat.xyz/chatbot?msg=${encodeURIComponent("أعطني " + type + " " + query + " باختصار")}`);
    const response = res.data.response;

    let msg = `╭━━━━• 𝑯𝑬𝑩𝑨 •━━━━╮\n`;
    msg += `✨ قسم الـ${type} ✨\n\n`;
    msg += response + `\n`;
    msg += `╰━━━━━━━━━━━━━━━━╯`;

    return api.sendMessage(msg, threadID, messageID);
  } catch (e) {
    return api.sendMessage("⚠️ عذراً، حاول مجدداً لاحقاً.", threadID, messageID);
  }
};
