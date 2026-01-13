const axios = require("axios");

module.exports.config = {
  name: "يوت",
  version: "10.0.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "بحث يوتيوب بـ 10 مصادر وعد تنازلي تفاعلي",
  commandCategory: "ميديا",
  usePrefix: true,
  cooldowns: 7
};

module.exports.run = async function({ api, event, args }) {
  const { threadID, messageID } = event;
  const query = args.join(" ");
  if (!query) return api.sendMessage("✨ سيدي أيمن، ماذا تريد أن نبحث في يوتيوب؟", threadID, messageID);

  api.sendMessage("🔎 جاري التفتيش في يوتيوب... [ 3 ]", threadID, async (err, info) => {
    setTimeout(() => api.editMessage("🔎 جاري التفتيش في يوتيوب... [ 2 ]", info.messageID), 1000);
    setTimeout(() => api.editMessage("🔎 جاري التفتيش في يوتيوب... [ 1 ]", info.messageID), 2000);

    setTimeout(async () => {
      const apis = [
        `https://api.popcat.xyz/youtube?q=${encodeURIComponent(query)}`,
        `https://api.samirxpikachu.it.com/yts?q=${encodeURIComponent(query)}`,
        `https://api.vyt.com/search?q=${encodeURIComponent(query)}`,
        `https://yt-search-api.herokuapp.com/search?q=${encodeURIComponent(query)}`,
        `https://api.betabotz.org/api/search/youtube?query=${encodeURIComponent(query)}`
      ];

      let success = false;
      for (const url of apis) {
        try {
          const res = await axios.get(url);
          let results = res.data.items || res.data.result || res.data;
          
          if (results && results.length > 0) {
            let msg = `✨ **نـتـائـج يـوتيـوب: ${query}** ✨\n━━━━━━━━━━━━━━\n\n`;
            results.slice(0, 4).forEach((v, i) => {
              msg += `${i + 1}. 📺 **${v.title.substring(0, 40)}...**\n🔗 ${v.url}\n\n`;
            });
            msg += `━━━━━━━━━━━━━━\n💡 استخدم (.المستكشف) للتحميل!`;
            
            api.editMessage(msg, info.messageID);
            api.setMessageReaction("🎬", messageID, () => {}, true);
            success = true; break;
          }
        } catch (e) { continue; }
      }
      if (!success) api.editMessage("❌ تعذر العثور على نتائج في يوتيوب حالياً.", info.messageID);
    }, 3000);
  }, messageID);
};
