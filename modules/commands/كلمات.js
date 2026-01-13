const axios = require("axios");

module.exports.config = {
  name: "كلمات",
  version: "1.3.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "جلب كلمات الأغاني العربية والأجنبية بزخرفة فخمة",
  commandCategory: "فئة المتفرقات",
  usePrefix: true,
  cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
  const { threadID, messageID } = event;
  const song = args.join(" ");
  
  if (!song) return api.sendMessage("╭──── • 𝑯𝑬𝑩𝑨 • ────╮\n⚠️ يرجى كتابة اسم الأغنية بعد الأمر\n╰──────────────╯", threadID, messageID);

  api.sendMessage("⌛ جاري البحث عن الكلمات... [ 3 ]", threadID, async (err, info) => {
    setTimeout(() => api.editMessage("⏳ جاري البحث عن الكلمات... [ 2 ]", info.messageID), 1000);
    setTimeout(() => api.editMessage("⏳ جاري البحث عن الكلمات... [ 1 ]", info.messageID), 2000);

    try {
      const res = await axios.get(`https://lyrist.xyz/api/${encodeURIComponent(song)}`);
      const { lyrics, title, artist } = res.data;

      if (!lyrics || lyrics.trim() === "") throw new Error("No lyrics found");

      let finalLyrics = lyrics.length > 2000 ? lyrics.substring(0, 2000) + "...\n(النص طويل جداً)" : lyrics;

      const msg = `╭──── • 𝑯𝑬𝑩𝑨 • ────╮\n\n` +
                  `🎵 العنوان: ${title || song}\n` +
                  `🎤 الفنان: ${artist || "غير معروف"}\n` +
                  `─── · · · ───\n\n` +
                  `${finalLyrics}\n\n` +
                  `╰──────────────╯`;

      api.editMessage(msg, info.messageID);
    } catch (e) {
      console.error(e);
      api.editMessage("╭──── • 𝑯𝑬𝑩𝑨 • ────╮\n❌ عذراً، لم أتمكن من العثور على كلمات هذه الأغنية حالياً\n🔹 جرب كتابة اسم الأغنية والفنان بشكل أدق\n╰──────────────╯", info.messageID);
    }
  }, messageID);
};
