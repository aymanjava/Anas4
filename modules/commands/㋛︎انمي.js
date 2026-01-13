const axios = require("axios");

module.exports.config = {
  name: "أنمي",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "البحث عن معلومات الأنمي من MyAnimeList",
  commandCategory: "ترفيه",
  usePrefix: true,
  cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
  const { threadID, messageID } = event;
  const animeName = args.join(" ");

  if (!animeName) return api.sendMessage("✨ سيدي أيمن، ما هو الأنمي الذي تريد استكشافه؟\nمثال: .أنمي نارتو", threadID, messageID);

  api.sendMessage(`🔍 جاري البحث في أرشيف الأوتاكو عن [ ${animeName} ]...`, threadID, async (err, info) => {
    try {
      // الاتصال بـ Jikan API (MyAnimeList Unofficial API)
      const res = await axios.get(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(animeName)}&limit=1`);
      
      if (!res.data.data || res.data.data.length === 0) {
        return api.editMessage("❌ لم أجد هذا الأنمي في كواكب الأنمي.", info.messageID);
      }

      const anime = res.data.data[0];
      const title = anime.title;
      const title_jp = anime.title_japanese;
      const score = anime.score || "غير مقيم";
      const episodes = anime.episodes || "مستمر";
      const status = anime.status;
      const synopsis = anime.synopsis ? anime.synopsis.substring(0, 300) + "..." : "لا يوجد وصف حالياً.";
      const image = anime.images.jpg.large_image_url;

      let msg = `🌟 **مـعـلومـات الأنـمـي** 🌟\n`;
      msg += `━━━━━━━━━━━━━━━━━━\n\n`;
      msg += `⛩️ الاسم: ${title}\n`;
      msg += `🇯🇵 بالياباني: ${title_jp}\n`;
      msg += `⭐ التقييم: ${score}\n`;
      msg += `🎬 الحلقات: ${episodes}\n`;
      msg += `📡 الحالة: ${status}\n\n`;
      msg += `📝 **القصة:**\n${synopsis}\n\n`;
      msg += `━━━━━━━━━━━━━━━━━━\n`;
      msg += `👤 المطور: أيـمن | المصدر: MyAnimeList`;

      // إرسال البوستر مع المعلومات
      api.sendMessage({
        body: msg,
        attachment: await global.utils.getStreamFromURL(image)
      }, threadID, () => {
        api.unsendMessage(info.messageID);
      }, messageID);

    } catch (e) {
      console.error(e);
      api.editMessage("❌ حدث خطأ أثناء الاتصال بموقع MyAnimeList.", info.messageID);
    }
  }, messageID);
};
