const axios = require("axios");

module.exports.config = {
  name: "تعرف",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "التعرف على الموسيقى في الفيديو",
  commandCategory: "ميديا",
  usePrefix: true
};

module.exports.run = async function({ api, event }) {
  const { threadID, messageID, type, messageReply } = event;
  if (type !== "message_reply" || !messageReply.attachments[0]) return api.sendMessage("◯ قم بالرد على مقطع صوتي أو فيديو.", threadID, messageID);

  api.sendMessage("◈ جاري تحليل الصوت... [ 3 ]", threadID, async (err, info) => {
    setTimeout(() => api.editMessage("◈ جاري تحليل الصوت... [ 2 ]", info.messageID), 1000);
    setTimeout(() => api.editMessage("◈ جاري تحليل الصوت... [ 1 ]", info.messageID), 2000);

    try {
      const audioUrl = messageReply.attachments[0].url;
      const res = await axios.get(`https://api.audd.io/findLyrics/?q=${encodeURIComponent(audioUrl)}&api_token=test`); // تجريبي
      
      const title = res.data.result[0].full_title || "غير معروف";
      api.editMessage(`◈ ───『 كـاشـف الـصـوت 』─── ◈\n\n◉ الأغنية: ${title}\n\n◈ ─────────────── ◈`, info.messageID);
    } catch (e) {
      api.editMessage("❌ تعذر التعرف على الموسيقى.", info.messageID);
    }
  }, messageID);
};
