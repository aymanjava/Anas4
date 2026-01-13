const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "autoQuran",
  version: "6.0.0",
  credits: "Ayman",
  description: "صدقة جارية – تلاوة عشوائية كل 30 دقيقة"
};

module.exports.run = async function ({ api }) {

  // منع التكرار
  if (global.autoQuranStarted) return;
  global.autoQuranStarted = true;

  const cacheDir = path.join(__dirname, "cache");
  if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

  const surahs = [
    "الفاتحة","البقرة","آل عمران","النساء","المائدة","الأنعام","الأعراف",
    "الأنفال","التوبة","يونس","هود","يوسف","الرعد","إبراهيم","الحجر","النحل",
    "الإسراء","الكهف","مريم","طه","الأنبياء","الحج","المؤمنون","النور",
    "الفرقان","الشعراء","النمل","القصص","العنكبوت","الروم","لقمان","السجدة",
    "الأحزاب","سبأ","فاطر","يس","الصافات","ص","الزمر","غافر","فصلت","الشورى",
    "الزخرف","الدخان","الجاثية","الأحقاف","محمد","الفتح","الحجرات","ق",
    "الذاريات","الطور","النجم","القمر","الرحمن","الواقعة","الحديد","المجادلة",
    "الحشر","الممتحنة","الصف","الجمعة","المنافقون","التغابن","الطلاق","التحريم",
    "الملك","القلم","الحاقة","المعارج","نوح","الجن","المزمل","المدثر","القيامة",
    "الإنسان","المرسلات","النبأ","النازعات","عبس","التكوير","الانفطار",
    "المطففين","الانشقاق","البروج","الطارق","الأعلى","الغاشية","الفجر","البلد",
    "الشمس","الليل","الضحى","الشرح","التين","العلق","القدر","البينة","الزلزلة",
    "العاديات","القارعة","التكاثر","العصر","الهمزة","الفيل","قريش","الماعون",
    "الكوثر","الكافرون","النصر","المسد","الإخلاص","الفلق","الناس"
  ];

  const interval = 30 * 60 * 1000;

  setInterval(async () => {
    try {
      const surah = surahs[Math.floor(Math.random() * surahs.length)];

      // مصدر مضمون (archive.org)
      const audioUrl =
        "https://archive.org/download/quran_yasser_aldosari/" +
        encodeURIComponent(`سورة ${surah}.mp3`);

      const audioPath = path.join(cacheDir, `quran_${Date.now()}.mp3`);

      const audio = await axios.get(audioUrl, { responseType: "arraybuffer" });
      fs.writeFileSync(audioPath, audio.data);

      const threads = await api.getThreadList(200, null, ["INBOX"]);

      for (const t of threads) {
        if (!t.isGroup) continue;

        await api.sendMessage({
          body:
`◈ ───『 صـدقـة جـاريـة 』─── ◈

◯ الـسـورة: ${surah}
◯ القارئ: ياسر الدوسري
◯ تلاوة عشوائية كل 30 دقيقة

◈ ─────────────── ◈
│ نسألكم الدعاء
◈ ─────────────── ◈`,
          attachment: fs.createReadStream(audioPath)
        }, t.threadID);
      }

      fs.unlinkSync(audioPath);

    } catch (e) {
      console.log("Quran Auto Error:", e.message);
    }
  }, interval);
};
