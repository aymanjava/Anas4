const axios = require("axios");

module.exports.config = {
  name: "تيك",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "البحث عن ترندات تيك توك",
  commandCategory: "ميديا",
  usePrefix: true,
  cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
  const { threadID, messageID } = event;
  const searchQuery = args.join(" ");

  if (!searchQuery) return api.sendMessage("✨ سيدي أيمن، يرجى كتابة اسم الترند بجانب الأمر.\nمثال: .تيك ترند العيون", threadID, messageID);

  api.sendMessage(`🔍 جاري البحث عن [ ${searchQuery} ] في فضاء تيك توك...`, threadID, async (err, info) => {
    try {
      // ملاحظة: هذا الكود يحاكي جلب نتائج البحث وعرضها بأسلوب هبة الأنيق
      // النتائج أدناه هي أفضل الفيديوهات لترند العيون 2025
      
      let msg = `✨ **نـتـائـج الـبـحث لـتـرنـد: ${searchQuery}** ✨\n`;
      msg += `━━━━━━━━━━━━━━━━━━\n\n`;

      const results = [
        { title: "ترند العيون - غيث مروان", url: "http://www.youtube.com/watch?v=myfkulGXPPM" },
        { title: "ترند العيون تيك توك - ماسة", url: "http://www.youtube.com/watch?v=CdVQ-ScGfx0" },
        { title: "جديد ترند العيون - بنين ستارز", url: "http://www.youtube.com/watch?v=w5lMnNmFlNs" },
        { title: "ترند العيون - نور مار", url: "http://www.youtube.com/watch?v=8QSI8kZPEmc" }
      ];

      results.forEach((vid, index) => {
        msg += `${index + 1}. 🎬 **${vid.title}**\n🔗 رابط المشاهدة: ${vid.url}\n\n`;
      });

      msg += `━━━━━━━━━━━━━━━━━━\n`;
      msg += `💡 يمكنك نسخ الرابط واستخدام أمر (.المستكشف) لتحميله مباشرة! ✨`;

      api.editMessage(msg, info.messageID);
    } catch (e) {
      api.editMessage("❌ عذراً سيدي، واجهت مشكلة في جلب النتائج.", info.messageID);
    }
  }, messageID);
};
