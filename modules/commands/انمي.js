const axios = require("axios");

module.exports.config = {
  name: "أنمي",
  version: "6.0.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "بحث أنمي مع عد تنازلي تفاعلي ومصادر متعددة",
  commandCategory: "ترفيه",
  usePrefix: true,
  cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
  const { threadID, messageID } = event;
  const animeName = args.join(" ");

  if (!animeName) return api.sendMessage("✨ سيدي أيمن، ما هو الأنمي الذي تبحث عنه؟", threadID, messageID);

  // إرسال الرسالة الأولى التي سيتغير فيها العد التنازلي
  api.sendMessage("🔍 جاري فحص كواكب الأنمي... [ 3 ]", threadID, async (err, info) => {
    
    // تعديل الرسالة للعد التنازلي
    setTimeout(() => api.editMessage("🔍 جاري فحص كواكب الأنمي... [ 2 ]", info.messageID), 1000);
    setTimeout(() => api.editMessage("🔍 جاري فحص كواكب الأنمي... [ 1 ]", info.messageID), 2000);

    setTimeout(async () => {
      // مصفوفة الـ APIs البديلة لضمان العمل
      const apis = [
        `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(animeName)}&limit=1`,
        `https://kitsu.io/api/edge/anime?filter[text]=${encodeURIComponent(animeName)}`,
        `https://api.consumet.org/anime/gogoanime/${encodeURIComponent(animeName)}`
      ];

      let success = false;

      for (const url of apis) {
        try {
          const res = await axios.get(url);
          let result;

          if (url.includes("jikan")) {
            const data = res.data.data[0];
            if (data) {
              result = {
                title: data.title,
                score: data.score || "N/A",
                episodes: data.episodes || "مستمر",
                status: data.status,
                synopsis: data.synopsis,
                image: data.images.jpg.large_image_url
              };
            }
          } else if (url.includes("kitsu")) {
            const data = res.data.data[0]?.attributes;
            if (data) {
              result = {
                title: data.canonicalTitle,
                score: data.averageRating || "N/A",
                episodes: data.episodeCount || "غير معروف",
                status: data.status,
                synopsis: data.synopsis,
                image: data.posterImage.large
              };
            }
          }

          if (result) {
            let msg = `🌟 **نـتـيـجـة الـبـحـث عـن الـأنـمـي** 🌟\n━━━━━━━━━━━━━━━\n\n`;
            msg += `⛩️ الاسم: ${result.title}\n`;
            msg += `⭐ التقييم: ${result.score}\n`;
            msg += `🎬 الحلقات: ${result.episodes}\n`;
            msg += `📡 الحالة: ${result.status}\n\n`;
            msg += `📝 **القصة:**\n${result.synopsis ? result.synopsis.substring(0, 300) + "..." : "لا يوجد وصف."}\n\n`;
            msg += `━━━━━━━━━━━━━━━\n👤 المطور: أيـمـن التوب`;

            // إرسال النتيجة مع البوستر
            await api.sendMessage({
              body: msg,
              attachment: await global.utils.getStreamFromURL(result.image)
            }, threadID);
            
            // حذف رسالة العد التنازلي ووضع تفاعل
            api.unsendMessage(info.messageID);
            api.setMessageReaction("⛩️", messageID, () => {}, true);
            success = true;
            break; 
          }
        } catch (e) {
          continue; // تجربة API آخر في حال الفشل
        }
      }

      if (!success) {
        api.editMessage("❌ سيدي أيمن، تعذر الوصول لبيانات الأنمي حالياً، جرب اسماً آخر.", info.messageID);
      }
    }, 3000);
  }, messageID);
};
