const axios = require("axios");

module.exports.config = {
  name: "تيك",
  version: "2.5.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "بحث تيك توك مع عد تنازلي وتفاعل",
  commandCategory: "ميديا",
  usePrefix: true,
  cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
  const { threadID, messageID } = event;
  const query = args.join(" ");
  if (!query) return api.sendMessage("✨ سيدي أيمن، ماذا ننبش في تيك توك؟", threadID, messageID);

  // إضافة تفاعل البحث
  api.setMessageReaction("🔍", messageID, () => {}, true);

  const msgWait = await api.sendMessage("⏳ جاري البحث... [ 3 ]", threadID);
  
  // تأثير العد التنازلي
  setTimeout(() => api.editMessage("⏳ جاري البحث... [ 2 ]", msgWait.messageID), 1000);
  setTimeout(() => api.editMessage("⏳ جاري البحث... [ 1 ]", msgWait.messageID), 2000);

  try {
    const res = await axios.get(`https://api.shayan-smart.com/tiktok/search?query=${encodeURIComponent(query)}`);
    const videos = res.data.data.slice(0, 4);

    let report = `✨ **نـتـائـج تـيـك تـوك لـلـمـطور أيـمن** ✨\n━━━━━━━━━━━━━━━━━━\n\n`;
    videos.forEach((v, i) => {
      report += `${i + 1}. 🎬 **${v.title || "فيديو بدون عنوان"}**\n👤 الـمؤلف: ${v.author.nickname}\n🔗 الرابط: https://www.tiktok.com/@${v.author.unique_id}/video/${v.video_id}\n\n`;
    });

    setTimeout(() => {
        api.editMessage(report + `━━━━━━━━━━━━━━━━━━\n💡 استخدم (.المستكشف) للتحميل!`, msgWait.messageID);
        api.setMessageReaction("✅", messageID, () => {}, true);
    }, 3000);

  } catch (e) {
    api.editMessage("❌ فشل الاتصال.. الـ API قد يكون تحت الصيانة.", msgWait.messageID);
    api.setMessageReaction("⚠️", messageID, () => {}, true);
  }
};
