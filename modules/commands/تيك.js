const axios = require("axios");

module.exports.config = {
  name: "تيك",
  version: "3.0.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "بحث تيك توك مع تفاعل عد تنازلي",
  commandCategory: "ميديا",
  usePrefix: true,
  cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
  const { threadID, messageID } = event;
  const query = args.join(" ");
  if (!query) return api.sendMessage("✨ سيدي أيمن، ماذا تريد أن نبحث في تيك توك؟", threadID);

  // إرسال رسالة العد التنازلي (التفاعل)
  api.sendMessage("⏳ 3...", threadID, (err, info) => {
    setTimeout(() => api.editMessage("⏳ 2...", info.messageID), 1000);
    setTimeout(() => api.editMessage("⏳ 1...", info.messageID), 2000);
    setTimeout(async () => {
      try {
        // استخدام API جديد ومستقر
        const res = await axios.get(`https://api.samirxpikachu.it.com/tiktok/search?query=${encodeURIComponent(query)}`);
        const videos = res.data.videos.slice(0, 4);

        if (videos.length === 0) return api.editMessage("❌ لم أجد نتائج.", info.messageID);

        let msg = `✨ **نـتـائـج تـيـك تـوك: ${query}** ✨\n━━━━━━━━━━━━━━\n\n`;
        videos.forEach((v, i) => {
          msg += `${i + 1}. 🎬 **${v.title || "فيديو بدون عنوان"}**\n🔗 الرابط: ${v.url}\n\n`;
        });
        msg += `━━━━━━━━━━━━━━\n💡 استخدم (.المستكشف) للتحميل!`;
        
        api.editMessage(msg, info.messageID);
        api.setMessageReaction("✅", messageID, () => {}, true);
      } catch (e) {
        api.editMessage("❌ حدث خطأ في السيرفر، حاول لاحقاً.", info.messageID);
      }
    }, 3000);
  }, messageID);
};
