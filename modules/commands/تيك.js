const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "تيك",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "بحث حقيقي عن فيديوهات تيك توك",
  commandCategory: "ميديا",
  usePrefix: true,
  cooldowns: 10
};

module.exports.run = async function({ api, event, args }) {
  const { threadID, messageID } = event;
  const searchQuery = args.join(" ");

  if (!searchQuery) return api.sendMessage("✨ سيدي أيمن، أخبرني ماذا تريد أن أبحث عنه في تيك توك؟", threadID, messageID);

  api.sendMessage(`🔍 جاري البحث عن [ ${searchQuery} ]... ⏳`, threadID, async (err, info) => {
    try {
      // استخدام API بحث تيك توك (TiklyDown أو ما يشابهها)
      const response = await axios.get(`https://api.tiklydown.eu.org/api/main/search?q=${encodeURIComponent(searchQuery)}`);
      
      // نأخذ أول 4 فيديوهات فقط كما طلبت
      const videos = response.data.result.slice(0, 4); 

      if (videos.length === 0) {
        return api.editMessage("❌ للأسف لم أجد نتائج لهذا البحث.", info.messageID);
      }

      let msg = `✨ **نـتـائـج بـحث تـيـك تـوك: ${searchQuery}** ✨\n`;
      msg += `━━━━━━━━━━━━━━━━━━\n\n`;

      for (let i = 0; i < videos.length; i++) {
        const v = videos[i];
        msg += `${i + 1}. 🎬 **${v.title.substring(0, 50)}...**\n`;
        msg += `👤 الـمؤلف: ${v.author.nickname}\n`;
        msg += `🔗 الرابط: https://www.tiktok.com/@${v.author.unique_id}/video/${v.video_id}\n\n`;
      }

      msg += `━━━━━━━━━━━━━━━━━━\n`;
      msg += `💡 انسخ رابط الفيديو واستخدم (.المستكشف) لتحميله فوراً!`;

      api.editMessage(msg, info.messageID);

    } catch (e) {
      console.error(e);
      api.editMessage("❌ حدث خطأ أثناء الاتصال بخوادم تيك توك، حاول لاحقاً.", info.messageID);
    }
  }, messageID);
};
