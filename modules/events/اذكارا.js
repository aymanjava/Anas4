module.exports.config = {
  name: "autoAzkar",
  eventType: ["log:subscribe"],
  version: "1.0.0",
  credits: "Ayman",
  description: "إرسال أذكار تلقائية كل ساعة"
};

module.exports.handleEvent = async function({ api }) {
  if (global.azkarActive) return;
  global.azkarActive = true;

  const azkar = [
    "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ ، سُبْحَانَ اللَّهِ الْعَظِيمِ",
    "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ الْعَلِيِّ الْعَظِيمِ",
    "اللَّهُمَّ صَلِّ وَسَلِّمْ وَبَارِكْ عَلَى نَبِيِّنَا مُحَمَّدٍ",
    "أستغفر الله العظيم الذي لا إله إلا هو الحي القيوم وأتوب إليه",
    "لَا إِلَهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ",
    "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ"
  ];

  setInterval(async () => {
    const zikr = azkar[Math.floor(Math.random() * azkar.length)];
    const threads = await api.getThreadList(100, null, ["INBOX"]);

    for (const thread of threads) {
      if (thread.isGroup) {
        api.sendMessage(`╭━━━━• 𝑶𝒁𝑲𝑨𝑹 •━━━━╮\n\n✨ ${zikr} ✨\n\n╰━━━━━━━━━━━━━━━━╯`, thread.threadID);
      }
    }
  }, 60 * 60 * 1000); // كل ساعة
};
