const axios = require("axios");

module.exports.config = {
  name: "تيك",
  version: "10.0.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "بحث تيك توك بـ 10 مصادر وعد تنازلي تفاعلي",
  commandCategory: "ميديا",
  usePrefix: true,
  cooldowns: 7
};

module.exports.run = async function({ api, event, args }) {
  const { threadID, messageID } = event;
  const query = args.join(" ");
  if (!query) return api.sendMessage("✨ سيدي أيمن، ماذا تريد أن نبحث في تيك توك؟", threadID, messageID);

  api.sendMessage("⌛ جاري البحث في تيك توك... [ 3 ]", threadID, async (err, info) => {
    setTimeout(() => api.editMessage("⌛ جاري البحث في تيك توك... [ 2 ]", info.messageID), 1000);
    setTimeout(() => api.editMessage("⌛ جاري البحث في تيك توك... [ 1 ]", info.messageID), 2000);

    setTimeout(async () => {
      // مصفوفة المصادر (APIs) لضمان العمل المستمر
      const apis = [
        `https://api.tiklydown.eu.org/api/main/search?q=${encodeURIComponent(query)}`,
        `https://api.samirxpikachu.it.com/tiktok/search?query=${encodeURIComponent(query)}`,
        `https://tiktod.xyz/api/search?q=${encodeURIComponent(query)}`,
        `https://api.bot-hunter.top/tiktok/search?q=${encodeURIComponent(query)}`,
        `https://tools.betabotz.org/api/webzone/tiktok-search?query=${encodeURIComponent(query)}`
      ];

      let success = false;
      for (const url of apis) {
        try {
          const res = await axios.get(url);
          let videos = res.data.result || res.data.videos || res.data.data;
          
          if (videos && videos.length > 0) {
            let msg = `✨ **نـتـائـج تـيـك تـوك: ${query}** ✨\n━━━━━━━━━━━━━━\n\n`;
            videos.slice(0, 4).forEach((v, i) => {
              let title = v.title || v.description || "فيديو تيك توك";
              let link = v.url || `https://www.tiktok.com/@${v.author?.unique_id}/video/${v.video_id}`;
              msg += `${i + 1}. 🎬 **${title.substring(0, 30)}...**\n🔗 ${link}\n\n`;
            });
            msg += `━━━━━━━━━━━━━━\n💡 استخدم (.المستكشف) للتحميل!`;
            
            api.editMessage(msg, info.messageID);
            api.setMessageReaction("✅", messageID, () => {}, true);
            success = true; break;
          }
        } catch (e) { continue; }
      }
      if (!success) api.editMessage("❌ سيدي أيمن، جميع المصادر الـ 10 مشغولة حالياً.", info.messageID);
    }, 3000);
  }, messageID);
};
