const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");

module.exports.config = {
  name: "قران",
  version: "3.0.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "إرسال مقطع مدته 3 دقائق من سور مختارة بصوت ياسر الدوسري",
  commandCategory: "اسلاميات",
  usePrefix: true,
  cooldowns: 20
};

module.exports.run = async function({ api, event }) {
  const { threadID, messageID } = event;

  // قائمة الروابط التي زودتني بها مع أسماء السور
  const quranList = [
    { name: "الفاتحة", url: "https://server11.mp3quran.net/yasser/001.mp3" },
    { name: "البقرة", url: "https://server11.mp3quran.net/yasser/002.mp3" },
    { name: "النساء", url: "https://server11.mp3quran.net/yasser/004.mp3" },
    { name: "المائدة", url: "https://server11.mp3quran.net/yasser/005.mp3" },
    { name: "الأعراف", url: "https://server11.mp3quran.net/yasser/007.mp3" },
    { name: "الأنفال", url: "https://server11.mp3quran.net/yasser/008.mp3" },
    { name: "النمل", url: "https://server11.mp3quran.net/yasser/027.mp3" },
    { name: "سبأ", url: "https://server11.mp3quran.net/yasser/034.mp3" },
    { name: "فصلت", url: "https://server11.mp3quran.net/yasser/041.mp3" },
    { name: "الشورى", url: "https://server11.mp3quran.net/yasser/042.mp3" },
    { name: "الدخان", url: "https://server11.mp3quran.net/yasser/044.mp3" }
  ];

  api.setMessageReaction("⌛", messageID, () => {}, true);

  try {
    const selection = quranList[Math.floor(Math.random() * quranList.length)];
    const coverUrl = `https://i.imgur.com/G55vN66.jpeg`;

    const cachePath = path.join(__dirname, "cache");
    if (!fs.existsSync(cachePath)) fs.mkdirSync(cachePath);

    const inputPath = path.join(cachePath, `input_${Date.now()}.mp3`);
    const outputPath = path.join(cachePath, `quran_${Date.now()}.mp3`);
    const coverPath = path.join(cachePath, `cover_${Date.now()}.jpg`);

    // 1. تحميل الملف الصوتي والغلاف
    const [audioRes, coverRes] = await Promise.all([
      axios.get(selection.url, { responseType: "arraybuffer" }),
      axios.get(coverUrl, { responseType: "arraybuffer" })
    ]);

    fs.writeFileSync(inputPath, Buffer.from(audioRes.data));
    fs.writeFileSync(coverPath, Buffer.from(coverRes.data));

    // 2. معالجة الصوت وقص أول 180 ثانية (3 دقائق)
    ffmpeg(inputPath)
      .setDuration(180) // 180 ثانية = 3 دقائق
      .on('end', async () => {
        api.setMessageReaction("✅", messageID, () => {}, true);

        await api.sendMessage({
          body: `◈ ───『 صـدقـة جـاريـة 』─── ◈\n\n📖 سورة: ${selection.name}\n🎙️ القارئ: ياسر الدوسري\n⏱️ المدة: 3 دقائق مختارة\n\nاسمع وتدبر ✨\n◈ ─────────────── ◈`,
          attachment: [
            fs.createReadStream(coverPath),
            fs.createReadStream(outputPath)
          ]
        }, threadID, () => {
          // تنظيف الملفات
          if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
          if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
          if (fs.existsSync(coverPath)) fs.unlinkSync(coverPath);
        }, messageID);
      })
      .on('error', (err) => {
        console.error(err);
        api.sendMessage("⚠️ حدث خطأ أثناء معالجة الصوت.", threadID, messageID);
      })
      .save(outputPath);

  } catch (err) {
    console.error(err);
    api.sendMessage("⚠️ تعذر جلب السورة، تأكد من اتصال السيرفر.", threadID, messageID);
  }
};
