const axios = require("axios");

module.exports.config = {
  name: "كلمات",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "جلب كلمات الأغاني",
  commandCategory: "الوسائط",
  usePrefix: true
};

module.exports.run = async function({ api, event, args }) {
  const { threadID, messageID } = event;
  const song = args.join(" ");
  if (!song) return api.sendMessage("◯ يرجى كتابة اسم الأغنية.", threadID, messageID);

  api.sendMessage("◈ جاري جلب الكلمات... [ 3 ]", threadID, async (err, info) => {
    setTimeout(() => api.editMessage("◈ جاري جلب الكلمات... [ 2 ]", info.messageID), 1000);
    setTimeout(() => api.editMessage("◈ جاري جلب الكلمات... [ 1 ]", info.messageID), 2000);

    try {
      const res = await axios.get(`https://api.lyrics.ovh/v1/${encodeURIComponent(song)}`);
      const lyrics = res.data.lyrics || "لم يتم العثور على كلمات.";

      let msg = `◈ ───『 كـلـمـات الـأغـانـي 』─── ◈\n\n`;
      msg += `◯ الأغنية: ${song}\n\n${lyrics.substring(0, 1000)}...\n\n`;
      msg += `◈ ─────────────── ◈`;

      api.editMessage(msg, info.messageID);
    } catch (e) {
      api.editMessage("❌ عذراً، لم أجد كلمات هذه الأغنية.", info.messageID);
    }
  }, messageID);
};
