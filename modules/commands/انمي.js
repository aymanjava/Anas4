const axios = require("axios");

module.exports.config = {
  name: "أنمي",
  version: "10.0.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "بحث أنمي بمصادر مضاعفة وعد تنازلي تفاعلي",
  commandCategory: "ترفيه",
  usePrefix: true,
  cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
  const { threadID, messageID } = event;
  const animeName = args.join(" ");

  if (!animeName) return api.sendMessage("✨ سيدي أيمن، ما هو الأنمي الذي تبحث عنه؟", threadID, messageID);

  api.sendMessage("🔍 جاري فحص كواكب الأنمي... [ 3 ]", threadID, async (err, info) => {
    
    setTimeout(() => api.editMessage("🔍 جاري فحص كواكب الأنمي... [ 2 ]", info.messageID), 1000);
    setTimeout(() => api.editMessage("🔍 جاري فحص كواكب الأنمي... [ 1 ]", info.messageID), 2000);

    setTimeout(async () => {
      // مصفوفة المصادر المضاعفة (أكثر من 10 APIs مختلفة)
      const apis = [
        `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(animeName)}&limit=1`,
        `https://kitsu.io/api/edge/anime?filter[text]=${encodeURIComponent(animeName)}`,
        `https://api.consumet.org/anime/gogoanime/${encodeURIComponent(animeName)}`,
        `https://api.anikatsu.com/search/${encodeURIComponent(animeName)}`,
        `https://api.enime.moe/search/${encodeURIComponent(animeName)}`,
        `https://api.consumet.org/anime/anilist/${encodeURIComponent(animeName)}`,
        `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(animeName)}&sfw=true`,
        `https://kitsu.io/api/edge/anime?filter[slug]=${encodeURIComponent(animeName)}`,
        `https://api.consumet.org/meta/anilist/info/${encodeURIComponent(animeName)}`,
        `https://api.myanimelist.net/v2/anime?q=${encodeURIComponent(animeName)}`
      ];

      let success = false;

      for (const url of apis) {
        try {
          const res = await axios.get(url, { timeout: 5000 }); // مهلة 5 ثواني لكل API
          let result;

          // معالجة بيانات Jikan (الأكثر شيوعاً)
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
          } 
          // معالجة بيانات Kitsu (البديل القوي)
          else if (url.includes("kitsu")) {
            const data = res.data.data[0]?.attributes;
            if (data) {
              result = {
                title: data.canonicalTitle,
                score: data.averageRating || "N/A",
                episodes: data.episodeCount || "غير معروف",
                status: data.status,
                synopsis: data.synopsis,
                image: data.posterImage?.large || data.posterImage?.original
              };
            }
          }
          // معالجة بيانات Consumet/Anilist
          else if (url.includes("consumet") || url.includes("anilist")) {
            const data = res.data.results?.[0] || res.data;
            if (data && data.title) {
              result = {
                title: typeof data.title === 'object' ? data.title.english || data.title.romaji : data.title,
                score: data.rating || data.score || "N/A",
                episodes: data.totalEpisodes || data.episodes || "؟",
                status: data.status,
                synopsis: data.description,
                image: data.image || data.cover
              };
            }
          }

          if (result) {
            let msg = `🌟 **نـتـيـجـة الـبـحـث عـن الـأنـمـي** 🌟\n━━━━━━━━━━━━━━━\n\n`;
            msg += `⛩️ الاسم: ${result.title}\n`;
            msg += `⭐ التقييم: ${result.score}\n`;
            msg += `🎬 الحلقات: ${result.episodes}\n`;
            msg += `📡 الحالة: ${result.status}\n\n`;
            msg += `📝 **القصة:**\n${result.synopsis ? result.synopsis.replace(/<[^>]*>/g, '').substring(0, 350) + "..." : "لا يوجد وصف."}\n\n`;
            msg += `━━━━━━━━━━━━━━━\n👤 المطور: أيـمـن التوب | المصادر: متوفرة ✅`;

            await api.sendMessage({
              body: msg,
              attachment: await global.utils.getStreamFromURL(result.image)
            }, threadID);
            
            api.unsendMessage(info.messageID);
            api.setMessageReaction("⛩️", messageID, () => {}, true);
            success = true;
            break; 
          }
        } catch (e) {
          continue; // في حال فشل الرابط، ينتقل للرابط التالي فوراً
        }
      }

      if (!success) {
        api.editMessage("❌ سيدي أيمن، قمت بفحص أكثر من 10 مصادر ولم أجد نتائج دقيقة، حاول تغيير اسم الأنمي.", info.messageID);
      }
    }, 3000);
  }, messageID);
};
