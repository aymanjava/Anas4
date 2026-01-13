const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "قرآن",
  version: "2.5.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "إرسال تلاوة كاملة (حتى 4 دقائق) بصوت ياسر الدوسري",
  commandCategory: "فئة اسلاميات",
  usePrefix: true,
  cooldowns: 15
};

module.exports.run = async function({ api, event }) {
  const { threadID, messageID } = event;

  // تم اختيار هذه السور بعناية لأن مدتها كاملة (بصوت الدوسري) لا تتجاوز 4-5 دقائق
  const shortSurahs = [
    { name: "النبأ", no: "078" }, { name: "النازعات", no: "079" }, { name: "عبس", no: "080" },
    { name: "التكوير", no: "081" }, { name: "الانفطار", no: "082" }, { name: "المطففين", no: "083" },
    { name: "الانشقاق", no: "084" }, { name: "البروج", no: "085" }, { name: "الطارق", no: "086" },
    { name: "الأعلى", no: "087" }, { name: "الغاشية", no: "088" }, { name: "الفجر", no: "089" },
    { name: "البلد", no: "090" }, { name: "الشمس", no: "091" }, { name: "الليل", no: "092" },
    { name: "الضحى", no: "093" }, { name: "الشرح", no: "094" }, { name: "التين", no: "095" },
    { name: "العلق", no: "096" }, { name: "القدر", no: "097" }, { name: "البينة", no: "098" },
    { name: "الزلزلة", no: "099" }, { name: "العاديات", no: "100" }, { name: "القارعة", no: "101" },
    { name: "التكاثر", no: "102" }, { name: "العصر", no: "103" }, { name: "الهمزة", no: "104" },
    { name: "الفيل", no: "105" }, { name: "قريش", no: "106" }, { name: "الماعون", no: "107" },
    { name: "الكوثر", no: "108" }, { name: "الكافرون", no: "109" }, { name: "النصر", no: "110" },
    { name: "المسد", no: "111" }, { name: "الإخلاص", no: "112" }, { name: "الفلق", no: "113" },
    { name: "الناس", no: "114" }
  ];

  api.setMessageReaction("⌛", messageID, () => {}, true);

  try {
    const randomSurah = shortSurahs[Math.floor(Math.random() * shortSurahs.length)];
    const audioUrl = `https://server11.mp3quran.net/yasser/${randomSurah.no}.mp3`;
    const coverUrl = `https://i.imgur.com/G55vN66.jpeg`; // صورة الشيخ ياسر

    const audioPath = path.join(__dirname, "cache", `quran_${randomSurah.no}.mp3`);
    const coverPath = path.join(__dirname, "cache", `cover_${randomSurah.no}.jpg`);

    // تحميل بجودة عالية
    const [audioRes, coverRes] = await Promise.all([
      axios.get(audioUrl, { responseType: "arraybuffer" }),
      axios.get(coverUrl, { responseType: "arraybuffer" })
    ]);

    fs.writeFileSync(audioPath, Buffer.from(audioRes.data, "utf-8"));
    fs.writeFileSync(coverPath, Buffer.from(coverRes.data, "utf-8"));

    api.setMessageReaction("✅", messageID, () => {}, true);

    return api.sendMessage({
      body: `صدقة جارية\n\n╭━━━━• 𝑯𝑬𝑩𝑨 •━━━━╮\n📖 سورة: ${randomSurah.name}\n🎤 القارئ: ياسر الدوسري\n🛡️ تلاوة كاملة مختارة بعناية\n╰━━━━━━━━━━━━━━━━╯`,
      attachment: [
        fs.createReadStream(coverPath),
        fs.createReadStream(audioPath)
      ]
    }, threadID, () => {
      setTimeout(() => {
        if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath);
        if (fs.existsSync(coverPath)) fs.unlinkSync(coverPath);
      }, 20000);
    }, messageID);

  } catch (err) {
    console.error(err);
    api.sendMessage("⚠️ حدث خطأ في جلب التلاوة، حاول مجدداً.", threadID, messageID);
  }
};
