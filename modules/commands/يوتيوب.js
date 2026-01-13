const axios = require("axios");
const fs = require("fs-extra");
const ytdl = require("@distube/ytdl-core"); // استخدمت النسخة المثبتة عندك في الملف

module.exports.config = {
  name: "يوتيوب",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "تحميل فيديو من يوتيوب بجودة عالية",
  commandCategory: "ميديا",
  usePrefix: true,
  cooldowns: 15
};

module.exports.run = async function({ api, event, args }) {
  const { threadID, messageID } = event;
  const url = args[0];

  if (!url) return api.sendMessage("✨ يرجى وضع رابط فيديو يوتيوب بعد الأمر.\nمثال: .يوتيوب [رابط الفيديو]", threadID, messageID);

  // بدء العد التنازلي التفاعلي
  api.sendMessage("⏳ جاري المعالجة... [ 3 ]", threadID, async (err, info) => {
    
    setTimeout(() => api.editMessage("⏳ جاري المعالجة... [ 2 ]", info.messageID), 1000);
    setTimeout(() => api.editMessage("⏳ جاري المعالجة... [ 1 ]", info.messageID), 2000);

    setTimeout(async () => {
      try {
        const path = __dirname + `/cache/yt_${Date.now()}.mp4`;
        
        // جلب معلومات الفيديو أولاً للتأكد من حجمه وصلاحيته
        const videoInfo = await ytdl.getInfo(url);
        const title = videoInfo.videoDetails.title;

        api.editMessage(`🚀 جاري تحميل: ${title.substring(0, 30)}...`, info.messageID);

        // عملية التحميل
        const stream = ytdl(url, { filter: 'audioandvideo', quality: 'highest' });
        const fileStream = fs.createWriteStream(path);

        stream.pipe(fileStream);

        fileStream.on("finish", () => {
          api.sendMessage({
            body: `✅ تم تحميل الفيديو بنجاح:\n🎬 ${title}`,
            attachment: fs.createReadStream(path)
          }, threadID, () => {
            fs.unlinkSync(path); // حذف الملف بعد الإرسال
            api.unsendMessage(info.messageID);
          }, messageID);
          api.setMessageReaction("📥", messageID, () => {}, true);
        });

      } catch (e) {
        console.error(e);
        api.editMessage("❌ عذراً، تعذر تحميل هذا الفيديو. تأكد من أن الرابط صحيح أو جرب فيديو آخر.", info.messageID);
      }
    }, 3000);
  }, messageID);
};
