const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "autoQuran",
  version: "6.0.0",
  hasPermssion: 2,
  credits: "Ayman",
  description: "صدقة جارية – تلاوة عشوائية كل 30 دقيقة",
  commandCategory: "النظام"
};

// وظيفة onLoad هي السر في جعل الأمر يعمل تلقائياً عند تشغيل البوت
module.exports.onLoad = async function ({ api }) {

  // منع التكرار في حال إعادة تحميل الأوامر
  if (global.autoQuranStarted) return;
  global.autoQuranStarted = true;

  console.log("✔️ تم تفعيل نظام القرآن التلقائي بنجاح - الإرسال كل 30 دقيقة");

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

  // التوقيت: 30 دقيقة
  const interval = 30 * 60 * 1000;

  setInterval(async () => {
    try {
      const surah = surahs[Math.floor(Math.random() * surahs.length)];

      // رابط الصوت (ياسر الدوسري)
      const audioUrl =
        "https://archive.org/download/quran_yasser_aldosari/" +
        encodeURIComponent(`سورة ${surah}.mp3`);

      const audioPath = path.join(cacheDir, `quran_${Date.now()}.mp3`);

      const res = await axios.get(audioUrl, { responseType: "arraybuffer" });
      fs.writeFileSync(audioPath, Buffer.from(res.data, "binary"));

      const threads = await api.getThreadList(100, null, ["INBOX"]);

      for (const t of threads) {
        // الإرسال للمجموعات النشطة فقط
        if (t.isGroup && t.isSubscribed) {
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
          
          // تأخير بسيط بين كل مجموعة لتجنب الحظر
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      // حذف الملف بعد الإرسال
      setTimeout(() => { if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath); }, 5000);

    } catch (e) {
      console.log("Quran Auto Error:", e.message);
    }
  }, interval);
};

module.exports.run = async function ({ api, event }) {
  // هذا السطر ليتمكن المطور من معرفة أن النظام يعمل عند كتابة الأمر
  return api.sendMessage("✨ نظام القرآن التلقائي يعمل بالفعل كل 30 دقيقة في الخلفية.", event.threadID);
};
