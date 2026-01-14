module.exports.config = {
  name: "autoAdhkar",
  version: "2.1.0",
  credits: "Ayman",
  description: "إرسال أذكار تلقائية (صدقة جارية) كل 30 دقيقة"
};

module.exports.onLoad = async function ({ api }) {

  if (global.autoAdhkarStarted) return;
  global.autoAdhkarStarted = true;

  const adhkarList = [
    "سبحان الله وبحمده",
    "سبحان الله العظيم",
    "أستغفر الله وأتوب إليه",
    "لا إله إلا الله وحده لا شريك له",
    "الحمد لله رب العالمين",
    "الله أكبر كبيراً",
    "لا حول ولا قوة إلا بالله",
    "اللهم صلِ وسلم على نبينا محمد",
    "حسبي الله ونعم الوكيل",
    "رضيت بالله رباً وبالإسلام ديناً",
    "يا حي يا قيوم برحمتك أستغيث",
    "اللهم اغفر لي ولوالدي",
    "اللهم إنك عفو كريم تحب العفو فاعفُ عني",
    "سبحان الله وبحمده عدد خلقه",
    "لا إله إلا أنت سبحانك إني كنت من الظالمين",
    "اللهم آتنا في الدنيا حسنة وفي الآخرة حسنة",
    "سبحان الملك القدوس",
    "اللهم ارحم موتانا وموتى المسلمين",
    "اللهم اشفِ مرضانا ومرضى المسلمين",
    "اللهم اجعل القرآن ربيع قلبي"
  ];

  const sendAdhkar = async () => {
    try {
      const threads = await api.getThreadList(200, null, ["INBOX"]);

      for (const thread of threads) {
        if (!thread.isGroup) continue;

        // اختيار ذكر عشوائي لكل مجموعة لتقليل التكرار
        const randomAdhkar = adhkarList[Math.floor(Math.random() * adhkarList.length)];

        await api.sendMessage(
`◈ ───『 صـدقـة جـاريـة 』─── ◈

◯ ${randomAdhkar}

◈ ─────────────── ◈
│←› بـوت هـبـة
◈ ─────────────── ◈`,
          thread.threadID
        );
      }

      console.log("✅ تم إرسال أذكار تلقائية لجميع المجموعات");
    } catch (e) {
      console.error("⚠️ AutoAdhkar Error:", e);
    }
  };

  // إرسال أول ذكر عند التشغيل
  await sendAdhkar();

  // تكرار كل 30 دقيقة
  setInterval(sendAdhkar, 30 * 60 * 1000);
};

module.exports.handleEvent = () => {};
