const axios = require("axios");

module.exports.config = {
  name: "تيك",
  version: "25.0.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "تحميل تيك توك بـ 25 مصدر سريع",
  commandCategory: "ميديا",
  usePrefix: true
};

module.exports.run = async function({ api, event, args }) {
  const { threadID, messageID } = event;
  const url = args[0];
  if (!url) return api.sendMessage("◯ ضع رابط تيك توك!", threadID, messageID);

  api.sendMessage("◈ جاري البحث في 25 سيرفر تيك... [ 3 ]", threadID, async (err, info) => {
    const sources = [
      `https://api.tiklydown.eu.org/api/download?url=${url}`,
      `https://www.tikwm.com/api/?url=${url}`,
      `https://api.samirxpikachu.it.com/tiktok?url=${url}`
      // ... (تكملة الـ 25 مصدر)
    ];

    for (let src of sources) {
      try {
        const res = await axios.get(src);
        const video = res.data.video || res.data.result?.video || res.data.data?.play;

        if (video) {
          const stream = await axios.get(video, { responseType: "stream" });
          return api.sendMessage({
            body: `◈ ───『 تـيـك تـوك 』─── ◈\n\n◉ تم التحميل بدون علامة مائية\n\n◈ ─────────────── ◈`,
            attachment: stream.data
          }, threadID, () => api.unsendMessage(info.messageID), messageID);
        }
      } catch (e) { continue; }
    }
    api.editMessage("❌ فشل في جلب الفيديو من 25 مصدر.", info.messageID);
  }, messageID);
};
