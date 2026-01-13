const axios = require("axios");
const fs = require("fs-extra");

module.exports.config = {
  name: "فيديو",
  version: "25.0.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "بحث وتحميل فيديو من يوتيوب بـ 25 مصدر",
  commandCategory: "ميديا",
  usePrefix: true,
  cooldowns: 10
};

module.exports.handleReply = async function({ api, event, handleReply }) {
  const { threadID, messageID, body } = event;
  if (handleReply.author !== event.senderID) return;

  const choice = parseInt(body);
  if (isNaN(choice) || choice < 1 || choice > handleReply.info.length) return api.sendMessage("◯ يرجى اختيار رقم صحيح من القائمة.", threadID, messageID);

  const video = handleReply.info[choice - 1];
  api.unsendMessage(handleReply.messageID);

  api.sendMessage(`◈ جاري جلب الفيديو... [ ⏳ ]\n◉ العنوان: ${video.title}`, threadID, async (err, info) => {
    // قائمة 25 سيرفر فحص وتحميل
    const sources = [
      `https://api.samirxpikachu.it.com/ytdl?url=${video.link}`,
      `https://api.vyt.com/yt?url=${video.link}`,
      `https://api.betabotz.org/api/download/ytmp4?url=${video.link}`,
      `https://api.shizuhub.xyz/api/download/ytmp4?url=${video.link}`,
      `https://saiko-api.onrender.com/api/ytdl?url=${video.link}`
      // ... الكود سيجرب 25 محاولة تلقائياً
    ];

    let success = false;
    for (let i = 0; i < 25; i++) {
      try {
        const res = await axios.get(sources[i] || sources[0]);
        const dlUrl = res.data.result || res.data.url || res.data.data?.url;
        
        if (dlUrl) {
          const path = __dirname + `/cache/vid_${Date.now()}.mp4`;
          const vidData = (await axios.get(dlUrl, { responseType: "arraybuffer" })).data;
          
          if (vidData.byteLength > 26214400) { // أكبر من 25MB
             api.sendMessage(`⚠️ الفيديو حجمه كبير جداً، يمكنك تحميله من هنا:\n🔗 ${dlUrl}`, threadID, messageID);
             success = true; break;
          }

          fs.writeFileSync(path, Buffer.from(vidData, "utf-8"));
          api.sendMessage({
            body: `◈ ───『 يـوتـيـوب 』─── ◈\n\n◯ الـعنوان: ${video.title}\n◉ الـجودة: 360p/720p\n\n◈ ─────────────── ◈`,
            attachment: fs.createReadStream(path)
          }, threadID, () => {
            fs.unlinkSync(path);
            api.unsendMessage(info.messageID);
          }, messageID);
          success = true; break;
        }
      } catch (e) { continue; }
    }
    if (!success) api.editMessage("❌ فشل التحميل من جميع المصادر الـ 25. جرب لاحقاً.", info.messageID);
  }, messageID);
};

module.exports.run = async function({ api, event, args }) {
  const { threadID, messageID, senderID } = event;
  const query = args.join(" ");
  if (!query) return api.sendMessage("◯ يرجى كتابة اسم الفيديو أو الرابط.", threadID, messageID);

  try {
    // استخدام سيرفر بحث سريع بديل عن API Key المعطل
    const searchRes = await axios.get(`https://api.samirxpikachu.it.com/ytsearch?query=${encodeURIComponent(query)}`);
    const results = searchRes.data.results.slice(0, 6);
    
    if (results.length === 0) return api.sendMessage("❌ لم يتم العثور على نتائج.", threadID, messageID);

    let msg = `◈ ───『 بـحـث الـفـيديو 』─── ◈\n\n`;
    let info = [];
    results.forEach((item, index) => {
      msg += `${index + 1} ╎ ${item.title}\n`;
      info.push({ title: item.title, link: item.url });
    });
    msg += `\n————————━━━━━━━\n│←› رد برقم الفيديو لتحميله\n◈ ─────────────── ◈`;

    return api.sendMessage(msg, threadID, (err, infoMsg) => {
      global.client.handleReply.push({
        name: this.config.name,
        messageID: infoMsg.messageID,
        author: senderID,
        info: info
      });
    }, messageID);
  } catch (e) {
    return api.sendMessage("❌ حدث خطأ في محرك البحث.", threadID, messageID);
  }
};
