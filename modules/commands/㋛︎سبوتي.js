const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "سبوتي",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "البحث عن الأغاني وإرسالها كصوت مباشر",
  commandCategory: "ميديا",
  usePrefix: true,
  cooldowns: 10
};

module.exports.run = async function({ api, event, args }) {
  const { threadID, messageID, senderID } = event;
  const songName = args.join(" ");

  if (!songName) return api.sendMessage("✨ سيدي أيمن، ما هي الأغنية التي تريد سماعها؟", threadID, messageID);

  // 1. التفاعل مع الرسالة فوراً
  api.setMessageReaction("🎵", messageID, () => {}, true);

  try {
    // 2. البحث عن الأغنية (استخدام API يجلب رابط تحميل مباشر)
    const res = await axios.get(`https://api.deezer.com/search?q=${encodeURIComponent(songName)}&limit=1`);
    
    if (!res.data.data || res.data.data.length === 0) {
      return api.sendMessage("❌ لم أجد هذه الأغنية في كواكب الموسيقى.", threadID, messageID);
    }

    const song = res.data.data[0];
    const audioUrl = song.preview; // رابط مقطع الصوت (أو البحث عن API تحميل كامل)
    const title = song.title;
    const artist = song.artist.name;
    const cover = song.album.cover_big;

    // 3. إرسال الرسالة الأولى (المعلومات)
    let msg = `🎧 **تـم الـعـثـور عـلى الأغـنـيـة**\n`;
    msg += `━━━━━━━━━━━━━━━━━━\n`;
    msg += `🎤 الـفنان: ${artist}\n`;
    msg += `🎼 الأغـنية: ${title}\n`;
    msg += `━━━━━━━━━━━━━━━━━━\n`;
    msg += `⏳ جاري إرسال المقطع الصوتي...`;

    api.sendMessage({
      body: msg,
      attachment: await getStream(cover)
    }, threadID, async () => {
      
      // 4. إرسال الرسالة الثانية (ملف الصوت)
      if (audioUrl) {
        const filePath = path.join(__dirname, "cache", `${Date.now()}_${senderID}.mp3`);
        const getAudio = await axios.get(audioUrl, { responseType: "arraybuffer" });
        fs.writeFileSync(filePath, Buffer.from(getAudio.data, "utf-8"));

        api.sendMessage({
          body: `🎵 مقطع صـوتي لـ: ${title}`,
          attachment: fs.createReadStream(filePath)
        }, threadID, () => {
          fs.unlinkSync(filePath); // حذف الملف بعد الإرسال
        });
      }
    }, messageID);

  } catch (e) {
    console.error(e);
    api.sendMessage("❌ عذراً سيدي، حدث خطأ في جلب الصوت.", threadID, messageID);
  }
};

// وظيفة مساعدة لجلب الصورة
async function getStream(url) {
  const res = await axios.get(url, { responseType: "stream" });
  return res.data;
}
