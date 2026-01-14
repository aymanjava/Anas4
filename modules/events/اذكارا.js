module.exports.config = {
  name: "autoAzkar",
  version: "2.1.0",
  credits: "Ayman",
  description: "إرسال أذكار تلقائية كل ساعة (صدقة جارية)"
};

module.exports.onLoad = async function ({ api }) {

  // ✅ قفل لمنع التكرار عند إعادة التحميل
  if (global.autoAzkarStarted) return;
  global.autoAzkarStarted = true;

  const azkar = [
    "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ ، سُبْحَانَ اللَّهِ الْعَظِيمِ",
    "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ الْعَلِيِّ الْعَظِيمِ",
    "اللَّهُمَّ صَلِّ وَسَلِّمْ وَبَارِكْ عَلَى نَبِيِّنَا مُحَمَّدٍ",
    "أستغفر الله العظيم الذي لا إله إلا هو الحي القيوم وأتوب إليه",
    "لَا إِلَهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ",
    "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ"
  ];

  const sendAzkar = async () => {
    try {
      // جلب قائمة آخر 200 محادثة
      const threads = await api.getThreadList(200, null, ["INBOX"]);
      const zikr = azkar[Math.floor(Math.random() * azkar.length)];

      for (const thread of threads) {
        if (!thread.isGroup) continue; // فقط للمجموعات

        await api.sendMessage(
`◈ ───『 صـدقـة جـاريـة 』─── ◈

◯ ${zikr}

◈ ─────────────── ◈
│←› بـوت هـبـة
◈ ─────────────── ◈`,
          thread.threadID
        );
      }

      console.log(`✅ تم إرسال الذكر تلقائياً لجميع المجموعات: "${zikr}"`);
    } catch (err) {
      console.error("⚠️ AutoAzkar Error:", err);
    }
  };

  // إرسال فوري عند التشغيل
  await sendAzkar();

  // إعداد التكرار كل ساعة (60 دقيقة)
  setInterval(sendAzkar, 60 * 60 * 1000);
};

module.exports.handleEvent = () => {};
