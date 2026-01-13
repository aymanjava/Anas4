const axios = require("axios");

module.exports.config = {
  name: "يوت",
  version: "3.0.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "بحث يوتيوب مع تفاعل عد تنازلي",
  commandCategory: "ميديا",
  usePrefix: true,
  cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
  const { threadID, messageID } = event;
  const query = args.join(" ");
  if (!query) return api.sendMessage("✨ سيدي أيمن، ماذا تريد أن نبحث في يوتيوب؟", threadID);

  api.sendMessage("🔎 3...", threadID, (err, info) => {
    setTimeout(() => api.editMessage("🔎 2...", info.messageID), 1000);
    setTimeout(() => api.editMessage("🔎 1...", info.messageID), 2000);
    setTimeout(async () => {
      try {
        const res = await axios.get(`https://api.samirxpikachu.it.com/yts?q=${encodeURIComponent(query)}`);
        const results = res.data.slice(0, 4);

        if (results.length === 0) return api.editMessage("❌ لم أجد نتائج.", info.messageID);

        let msg = `✨ **نـتـائـج يـوتيـوب: ${query}** ✨\n━━━━━━━━━━━━━━\n\n`;
        results.forEach((v, i) => {
          msg += `${i + 1}. 📺 **${v.title}**\n🔗 الرابط: ${v.url}\n\n`;
        });
        msg += `━━━━━━━━━━━━━━\n💡 استخدم (.المستكشف) للتحميل!`;

        api.editMessage(msg, info.messageID);
        api.setMessageReaction("🎬", messageID, () => {}, true);
      } catch (e) {
        api.editMessage("❌ السيرفر لا يستجيب حالياً.", info.messageID);
      }
    }, 3000);
  }, messageID);
};
