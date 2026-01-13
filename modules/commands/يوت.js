const axios = require("axios");

module.exports.config = {
  name: "يوت",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "بحث حقيقي عن فيديوهات يوتيوب",
  commandCategory: "ميديا",
  usePrefix: true,
  cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
  const { threadID, messageID } = event;
  const searchQuery = args.join(" ");

  if (!searchQuery) return api.sendMessage("✨ سيدي أيمن، ما الذي تريد البحث عنه في يوتيوب؟", threadID, messageID);

  api.sendMessage(`🔍 جاري فحص أرشيف يوتيوب عن [ ${searchQuery} ]...`, threadID, async (err, info) => {
    try {
      // استخدام API بحث يوتيوب مجاني وسريع
      const res = await axios.get(`https://api.popcat.xyz/youtube?q=${encodeURIComponent(searchQuery)}`);
      
      // نأخذ أول 4 نتائج كما طلبت
      const videos = res.data.slice(0, 4);

      if (videos.length === 0) {
        return api.editMessage("❌ لم أجد أي نتائج في يوتيوب لهذا البحث.", info.messageID);
      }

      let msg = `✨ **نـتـائـج يـوتيـوب لـلـبـحث: ${searchQuery}** ✨\n`;
      msg += `━━━━━━━━━━━━━━━━━━\n\n`;

      videos.forEach((v, index) => {
        msg += `${index + 1}. 📺 **${v.title}**\n`;
        msg += `👤 الـقـناة: ${v.channel}\n`;
        msg += `⏳ الـمدة: ${v.duration} | المشاهدات: ${v.views}\n`;
        msg += `🔗 الـرابط: ${v.url}\n\n`;
      });

      msg += `━━━━━━━━━━━━━━━━━━\n`;
      msg += `💡 سيدي أيمن، استخدم الرابط مع أمر (.المستكشف) لتحميل الفيديو فوراً! 🎀`;

      api.editMessage(msg, info.messageID);
    } catch (e) {
      console.error(e);
      api.editMessage("❌ فشل الاتصال بيوتيوب، يرجى المحاولة مرة أخرى.", info.messageID);
    }
  }, messageID);
};
