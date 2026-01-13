const axios = require("axios");

module.exports.config = {
  name: "تيك",
  version: "4.0.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "بحث تيك توك حقيقي مع عد تنازلي وتفاعل",
  commandCategory: "ميديا",
  usePrefix: true,
  cooldowns: 10
};

module.exports.run = async function({ api, event, args }) {
  const { threadID, messageID } = event;
  const query = args.join(" ");

  if (!query) return api.sendMessage("✨ سيدي أيمن، ماذا تريد أن نبحث في تيك توك؟", threadID, messageID);

  // إرسال رسالة العد التنازلي الاحترافية
  api.sendMessage("⏳ 3...", threadID, (err, info) => {
    setTimeout(() => api.editMessage("⏳ 2...", info.messageID), 1000);
    setTimeout(() => api.editMessage("⏳ 1...", info.messageID), 2000);
    
    setTimeout(async () => {
      try {
        // استخدام API بحث مباشر وفعال
        const searchRes = await axios.get(`https://api.tiklydown.eu.org/api/main/search?q=${encodeURIComponent(query)}`);
        
        // التأكد من وجود نتائج
        if (!searchRes.data || !searchRes.data.result || searchRes.data.result.length === 0) {
          return api.editMessage("❌ عذراً سيدي، لم أجد نتائج لهذا البحث حالياً.", info.messageID);
        }

        const videos = searchRes.data.result.slice(0, 4); // جلب 4 فيديوهات فقط
        let msg = `✨ **نـتـائـج بـحث تـيـك تـوك: ${query}** ✨\n`;
        msg += `━━━━━━━━━━━━━━━━━━\n\n`;

        videos.forEach((v, i) => {
          msg += `${i + 1}. 🎬 **${v.title.substring(0, 40)}...**\n`;
          msg += `👤 الـمؤلف: ${v.author.nickname}\n`;
          msg += `🔗 الرابط: https://www.tiktok.com/@${v.author.unique_id}/video/${v.video_id}\n\n`;
        });

        msg += `━━━━━━━━━━━━━━━━━━\n`;
        msg += `💡 انسخ الرابط واستخدم (.المستكشف) لتحميله فوراً!`;

        api.editMessage(msg, info.messageID);
        api.setMessageReaction("✅", messageID, () => {}, true);

      } catch (e) {
        console.error(e);
        api.editMessage("❌ السيرفر مشغول حالياً، يرجى المحاولة مرة أخرى بعد قليل.", info.messageID);
      }
    }, 3000);
  }, messageID);
};
