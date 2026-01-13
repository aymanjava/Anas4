module.exports.config = {
  name: "فيديو",
  version: "4.0.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "البحث عن فيديوهات يوتيوب وتحميلها",
  commandCategory: "خدمات",
  usages: "[اسم الفيديو]",
  cooldowns: 10,
  dependencies: {
    "axios": "",
    "fs-extra": "",
    "path": ""
  }
};

module.exports.handleReply = async function ({ api, event, handleReply }) {
  const axios = require("axios");
  const fs = require("fs-extra");
  const { threadID, messageID, body, senderID } = event;

  if (handleReply.author != senderID) return;

  const choice = parseInt(body);
  if (isNaN(choice) || choice < 1 || choice > handleReply.list.length) {
    return api.sendMessage("⚠️ سيدي، يرجى اختيار رقم من القائمة (مثلاً: 1)", threadID, messageID);
  }

  api.unsendMessage(handleReply.messageID);
  api.setMessageReaction("⏳", messageID, () => {}, true);

  const videoInfo = handleReply.list[choice - 1];
  const videoID = videoInfo.id;
  const videoTitle = videoInfo.title;

  try {
    // استخدام API تحميل مباشر وسريع
    const res = await axios.get(`https://api.popcat.xyz/itunes?q=${encodeURIComponent(videoTitle)}`); // مثال لتبسيط الحصول على داتا
    // ملاحظة: يفضل استخدام سيرفرات YT المباشرة مثل samirxpikachu
    const downloadRes = await axios.get(`https://samirxpikachu.onrender.com/ytdl?url=https://www.youtube.com/watch?v=${videoID}`);
    const downloadUrl = downloadRes.data.video_url || downloadRes.data.link;

    if (!downloadUrl) throw new Error("Link not found");

    const path = __dirname + `/cache/video_${senderID}.mp4`;
    const videoStream = await axios.get(downloadUrl, { responseType: "arraybuffer" });
    fs.writeFileSync(path, Buffer.from(videoStream.data, "utf-8"));

    if (fs.statSync(path).size > 26214400) { // 25MB
      fs.unlinkSync(path);
      return api.sendMessage("⚠️ سيدي، الفيديو حجمه كبير جداً (أكبر من 25MB)، لا يمكن إرساله عبر ماسنجر.", threadID, messageID);
    }

    api.setMessageReaction("✅", messageID, () => {}, true);
    return api.sendMessage({
      body: `◈ ───『 تـم الـتـحـمـيـل 🎬 』─── ◈\n\n◯ الـعـنـوان: ${videoTitle}\n———————————————\n│←› بـأوامـر: الـتـوب أيـمـن 👑`,
      attachment: fs.createReadStream(path)
    }, threadID, () => fs.unlinkSync(path), messageID);

  } catch (error) {
    api.setMessageReaction("❌", messageID, () => {}, true);
    return api.sendMessage("⚠️ عذراً سيدي، فشل تحميل الفيديو. قد يكون محمياً بحقوق الطبع والنشر.", threadID, messageID);
  }
};

module.exports.run = async function ({ api, event, args }) {
  const axios = require("axios");
  const fs = require("fs-extra");
  const { threadID, messageID, senderID } = event;

  const searchQuery = args.join(" ");
  if (!searchQuery) return api.sendMessage("◈ ──『 تـنـبـيـه 』── ◈\n\n◯ سيدي، يرجى كتابة اسم الفيديو الذي تبحث عنه.\n◉ مثال: فيديو نصرت البدر\n———————————————\n│←› بـأوامـر: الـتـوب أيـمـن 👑", threadID, messageID);

  api.setMessageReaction("🔍", messageID, () => {}, true);

  try {
    // استخدام API بحث يوتيوب سريع لا يحتاج Key
    const res = await axios.get(`https://api.vinhbeat.icu/youtube?search=${encodeURIComponent(searchQuery)}`);
    const results = res.data.data.slice(0, 6);

    if (results.length === 0) return api.sendMessage("⚠️ لم أجد أي نتائج لهذا البحث سيدي.", threadID, messageID);

    let msg = `◈ ──『 نـتـائـج الـبـحـث 🔎 』── ◈\n\n◯ لـقـد وجدت هذه الفيديوهات لـ [ ${searchQuery} ]:\n`;
    const listVideos = [];

    for (let i = 0; i < results.length; i++) {
      const video = results[i];
      msg += `\n${i + 1}. ${video.title}\n⏰ الـمدة: ${video.duration || 'غير معروف'}\n`;
      listVideos.push({ id: video.id, title: video.title });
    }

    msg += `\n———————————————\n👈 سيدي، رد على الرسالة برقم الفيديو لتحميله.\n│←› بـأوامـر: الـتـوب أيـمـن 👑`;

    return api.sendMessage(msg, threadID, (error, info) => {
      global.client.handleReply.push({
        name: this.config.name,
        messageID: info.messageID,
        author: senderID,
        list: listVideos
      });
    }, messageID);

  } catch (error) {
    console.log(error)
    return api.sendMessage("⚠️ حدث خطأ أثناء الاتصال بسيرفرات يوتيوب.", threadID, messageID);
  }
};
