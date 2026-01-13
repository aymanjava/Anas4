const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "قران",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "إرسال سورة عشوائية بصوت ياسر الدوسري (صدقة جارية)",
  commandCategory: "فئة المتفرقات",
  usePrefix: true,
  cooldowns: 10
};

module.exports.run = async function({ api, event }) {
  const { threadID, messageID } = event;

  // قائمة الـ 114 سورة (القرعة)
  const surahs = [
    "الفاتحة", "البقرة", "آل عمران", "النساء", "المائدة", "الأنعام", "الأعراف", "الأنفال", "التوبة", "يونس", "هود", "يوسف", "الرعد", "إبراهيم", "الحجر", "النحل", "الإسراء", "الكهف", "مريم", "طه", "الأنبياء", "الحج", "المؤمنون", "النور", "الفرقان", "الشعراء", "النمل", "القصص", "العنكبوت", "الروم", "لقمان", "السجدة", "الأحزاب", "سبأ", "فاطر", "يس", "الصافات", "ص", "الزمر", "غافر", "فصلت", "الشورى", "الزخرف", "الدخان", "الجاثية", "الأحقاف", "محمد", "الفتح", "الحجرات", "ق", "الذاريات", "الطور", "النجم", "القمر", "الرحمن", "الواقعة", "الحديد", "المجادلة", "الحشر", "الممتحنة", "الصف", "الجمعة", "المنافقون", "التغابن", "الطلاق", "التحريم", "الملك", "القلم", "الحاقة", "المعارج", "نوح", "الجن", "المزمل", "المدثر", "القيامة", "الإنسان", "المرسلات", "النبأ", "النازعات", "عبس", "التكوير", "الانفطار", "المطففين", "الانشقاق", "البروج", "الطارق", "الأعلى", "الغاشية", "الفجر", "البلد", "الشمس", "الليل", "الضحى", "الشرح", "التين", "العلق", "القدر", "البينة", "الزلزلة", "العاديات", "القارعة", "التكاثر", "العصر", "الهمزة", "الفيل", "قريش", "الماعون", "الكوثر", "الكافرون", "النصر", "المسد", "الإخلاص", "الفلق", "الناس"
  ];

  api.setMessageReaction("⌛", messageID, () => {}, true);

  try {
    // تنفيذ القرعة
    const randomSurah = surahs[Math.floor(Math.random() * surahs.length)];
    // حصر البحث ليكون قرآن فقط
    const searchQuery = `yasser al dossari surah ${randomSurah} quran recitation`;
    
    const res = await axios.get(`https://api.deezer.com/search?q=${encodeURIComponent(searchQuery)}&limit=1`);
    
    if (!res.data.data || res.data.data.length === 0) {
      return api.sendMessage("❌ لم يتم العثور على السورة، حاول مجدداً.", threadID, messageID);
    }

    const track = res.data.data[0];
    const audioUrl = track.preview;
    const coverUrl = track.album.cover_big;

    const audioPath = path.join(__dirname, "cache", `q_${Date.now()}.mp3`);
    const coverPath = path.join(__dirname, "cache", `c_${Date.now()}.jpg`);

    // تحميل الملفات
    const [audioRes, coverRes] = await Promise.all([
      axios.get(audioUrl, { responseType: "arraybuffer" }),
      axios.get(coverUrl, { responseType: "arraybuffer" })
    ]);

    fs.writeFileSync(audioPath, Buffer.from(audioRes.data, "utf-8"));
    fs.writeFileSync(coverPath, Buffer.from(coverRes.data, "utf-8"));

    api.setMessageReaction("✅", messageID, () => {}, true);

    return api.sendMessage({
      body: `صدقة جارية\n\n╭━━━━• 𝑯𝑬𝑩𝑨 •━━━━╮\n📖 سورة: ${randomSurah}\n🎤 القارئ: ياسر الدوسري\n🛡️ بحث آمن (قرآن فقط)\n╰━━━━━━━━━━━━━━━━╯`,
      attachment: [
        fs.createReadStream(coverPath),
        fs.createReadStream(audioPath)
      ]
    }, threadID, () => {
      // حذف الملفات من الكاش
      setTimeout(() => {
        if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath);
        if (fs.existsSync(coverPath)) fs.unlinkSync(coverPath);
      }, 10000);
    }, messageID);

  } catch (err) {
    console.error(err);
    api.sendMessage("❌ حدث خطأ في الاتصال بسيرفرات الصوت.", threadID, messageID);
  }
};
