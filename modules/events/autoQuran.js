const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "autoQuran",
  version: "6.3.0",
  credits: "Ayman",
  description: "صدقة جارية – إرسال تلاوة MP3 تلقائياً من API كل 30 دقيقة"
};

module.exports.onLoad = async function ({ api }) {
  if (global.autoQuranStarted) return;
  global.autoQuranStarted = true;

  const cacheDir = path.join(__dirname, "cache", "quran");
  if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

  const sendQuran = async () => {
    try {
      // جلب قائمة السور من API
      const res = await axios.get("https://www.mp3quran.net/api/v3/suwar?language=ar");
      const surahs = res.data.data;
      if (!surahs || !surahs.length) return console.log("⚠️ لم يتم جلب السور من API");

      // اختيار سورة عشوائية
      const surah = surahs[Math.floor(Math.random() * surahs.length)];
      const mp3Url = surah.mp3;
      const mp3Path = path.join(cacheDir, `quran_${Date.now()}.mp3`);

      // تحميل الصوت
      const audioRes = await axios.get(mp3Url, { responseType: "arraybuffer" });
      fs.writeFileSync(mp3Path, Buffer.from(audioRes.data, "binary"));

      // جلب قائمة المجموعات
      const threads = await api.getThreadList(50, null, ["INBOX"]);
      for (const t of threads) {
        if (!t.isGroup) continue;

        await api.sendMessage({
          body:
`◈ ───『 صـدقـة جـاريـة 』─── ◈

◯ السورة: ${surah.name}
◯ تلاوة عشوائية كل 30 دقيقة

◈ ─────────────── ◈`,
          attachment: fs.createReadStream(mp3Path)
        }, t.threadID);

        await new Promise(r => setTimeout(r, 1000)); // تأخير بسيط
      }

      // حذف الملف بعد الإرسال
      setTimeout(() => { if (fs.existsSync(mp3Path)) fs.unlinkSync(mp3Path); }, 5000);

    } catch (e) {
      console.log("AutoQuran Error:", e.message);
    }
  };

  await sendQuran(); // إرسال أول دفعة فور التشغيل
  setInterval(sendQuran, 30 * 60 * 1000); // كل 30 دقيقة
};

module.exports.run = async function ({ api, event }) {
  return api.sendMessage("✨ نظام القرآن التلقائي يعمل من API كل 30 دقيقة.", event.threadID);
};
