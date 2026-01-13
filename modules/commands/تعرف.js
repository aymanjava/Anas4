const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "تعرف",
  version: "1.1.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "التعرف على الموسيقى في الصوت أو الفيديو",
  commandCategory: "ميديا",
  usePrefix: true
};

module.exports.run = async function({ api, event }) {
  const { threadID, messageID } = event;
  let url;

  // التحقق من الرد أو الملفات المرسلة مباشرة
  if (event.type === "message_reply" && event.messageReply && event.messageReply.attachments.length > 0) {
    url = event.messageReply.attachments[0].url;
  } else if (event.attachments && event.attachments.length > 0 && ["audio", "video"].includes(event.attachments[0].type)) {
    url = event.attachments[0].url;
  } else {
    return api.sendMessage("◯ يرجى الرد على مقطع صوتي أو إرسال صوت/فيديو.", threadID, messageID);
  }

  const loading = await api.sendMessage("◈ جاري تحليل الصوت... [ 3 ]", threadID, messageID);
  setTimeout(() => api.editMessage("◈ جاري تحليل الصوت... [ 2 ]", loading.messageID), 1000);
  setTimeout(() => api.editMessage("◈ جاري تحليل الصوت... [ 1 ]", loading.messageID), 2000);

  try {
    // ضع مفتاح API الحقيقي هنا
    const API_TOKEN = "YOUR_AUDD_API_KEY";
    const res = await axios.get(`https://api.audd.io/findLyrics/?q=${encodeURIComponent(url)}&api_token=${API_TOKEN}`);

    if (!res.data.result || res.data.result.length === 0) {
      return api.editMessage("❌ لم يتم التعرف على الموسيقى.", loading.messageID);
    }

    const result = res.data.result[0];
    const title = result.full_title || "غير معروف";
    const artist = result.artist || "غير معروف";
    const lyrics = result.lyrics ? result.lyrics.substring(0, 500) + "..." : "لا توجد كلمات متاحة";

    const msg = `◈ ───『 كـاشـف الـصـوت 』─── ◈\n\n` +
                `🎵 الأغنية: ${title}\n` +
                `🎤 الفنان: ${artist}\n\n` +
                `📝 كلمات الأغنية:\n${lyrics}\n\n` +
                `◈ ─────────────── ◈`;

    api.editMessage(msg, loading.messageID);

  } catch (e) {
    console.error(e);
    api.editMessage("❌ فشل التعرف على الموسيقى، حاول مرة أخرى.", loading.messageID);
  }
};
