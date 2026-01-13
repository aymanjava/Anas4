const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "autoQuran",
  eventType: ["log:subscribe"],
  version: "5.5.0",
  credits: "Ayman",
  description: "صدقة جارية - تلاوات تلقائية لجميع المجموعات"
};

module.exports.handleEvent = async function({ api }) {
  // منع تكرار التشغيل عند تحديث الكود
  if (global.quranActive) return;
  global.quranActive = true;

  // قائمة الـ 114 سورة كاملة للقرعة
  const surahList = [
    "الفاتحة", "البقرة", "آل عمران", "النساء", "المائدة", "الأنعام", "الأعراف", "الأنفال", "التوبة", "يونس", "هود", "يوسف", "الرعد", "إبراهيم", "الحجر", "النحل", "الإسراء", "الكهف", "مريم", "طه", "الأنبياء", "الحج", "المؤمنون", "النور", "الفرقان", "الشعراء", "النمل", "القصص", "العنكبوت", "الروم", "لقمان", "السجدة", "الأحزاب", "سبأ", "فاطر", "يس", "الصافات", "ص", "الزمر", "غافر", "فصلت", "الشورى", "الزخرف", "الدخان", "الجاثية", "الأحقاف", "محمد", "الفتح", "الحجرات", "ق", "الذاريات", "الطور", "النجم", "القمر", "الرحمن", "الواقعة", "الحديد", "المجادلة", "الحشر", "الممتحنة", "الصف", "الجمعة", "المنافقون", "التغابن", "الطلاق", "التحريم", "الملك", "القلم", "الحاقة", "المعارج", "نوح", "الجن", "المزمل", "المدثر", "القيامة", "الإنسان", "المرسلات", "النبأ", "النازعات", "عبس", "التكوير", "الانفطار", "المطففين", "الانشقاق", "البروج", "الطارق", "الأعلى", "الغاشية", "الفجر", "البلد", "الشمس", "الليل", "الضحى", "الشرح", "التين", "العلق", "القدر", "البينة", "الزلزلة", "العاديات", "القارعة", "التكاثر", "العصر", "الهمزة", "الفيل", "قريش", "الماعون", "الكوثر", "الكافرون", "النصر", "المسد", "الإخلاص", "الفلق", "الناس"
  ];

  const interval = 30 * 60 * 1000; // توقيت 30 دقيقة

  setInterval(async () => {
    try {
      const randomSurah = surahList[Math.floor(Math.random() * surahList.length)];
      const query = `ياسر الدوسري سورة ${randomSurah}`;
      
      const res = await axios.get(`https://api.deezer.com/search?q=${encodeURIComponent(query)}&limit=1`);
      
      if (res.data.data && res.data.data.length > 0) {
        const item = res.data.data[0];
        const audioUrl = item.preview;
        const coverUrl = item.album.cover_big;

        const audioPath = path.join(__dirname, "cache", `q_${Date.now()}.mp3`);
        const coverPath = path.join(__dirname, "cache", `c_${Date.now()}.jpg`);

        // تحميل الملفات
        const [audioRes, coverRes] = await Promise.all([
          axios.get(audioUrl, { responseType: "arraybuffer" }),
          axios.get(coverUrl, { responseType: "arraybuffer" })
        ]);

        fs.writeFileSync(audioPath, Buffer.from(audioRes.data, "utf-8"));
        fs.writeFileSync(coverPath, Buffer.from(coverRes.data, "utf-8"));

        // جلب قائمة كافة المحادثات (المجموعات)
        const threads = await api.getThreadList(100, null, ["INBOX"]);

        for (const thread of threads) {
          if (thread.isGroup) {
            api.sendMessage({
              body: `صدقة جارية\n\n╭━━━━• 𝑯𝑬𝑩𝑨 •━━━━╮\n📖 سورة: ${randomSurah}\n🎤 القارئ: ياسر الدوسري\n⏱️ يتم الإرسال لكل المجموعات\n╰━━━━━━━━━━━━━━━━╯`,
              attachment: [
                fs.createReadStream(coverPath),
                fs.createReadStream(audioPath)
              ]
            }, thread.threadID);
          }
        }

        // حذف الملفات المؤقتة بعد الإرسال بـ 30 ثانية
        setTimeout(() => {
          if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath);
          if (fs.existsSync(coverPath)) fs.unlinkSync(coverPath);
        }, 30000);
      }
    } catch (error) {
      console.log("Error in Quran Event: " + error.message);
    }
  }, interval);
};
