module.exports.config = {
  name: "سين",
  version: "5.0.0",
  hasPermssion: 2,
  credits: "Ayman",
  description: "نظام الرقابة الملكي وقراءة الرسائل فوراً",
  commandCategory: "النظام",
  usages: "",
  cooldowns: 0
};

module.exports.handleEvent = async ({ api, event, Currencies }) => {
    const { threadID, senderID } = event;
    const botID = api.getCurrentUserID();

    // تجاهل رسائل البوت نفسه
    if (senderID == botID) return;

    // تنفيذ القراءة الفورية (Seen) لفرض الهيبة
    api.markAsReadAll(() => {});

    // مكافأة الخدمة الزهيدة جداً (نظام التقشف الإمبراطوري)
    // العضو يحصل على 1$ فقط مقابل كل رسالة يقرأها البوت
    await Currencies.increaseMoney(senderID, 1);
};

module.exports.run = async function({ api, event, Currencies }) {
    const { threadID, messageID, senderID } = event;
    const isTop = global.config.ADMINBOT.includes(senderID);

    if (!isTop) return; // الأمر السيادي للتوب فقط

    return api.sendMessage(`◈ ───『 الـرقـابة الـمـلكـيـة 』─── ◈\n\n👁️ نـظام الـرؤية الـشاملة قيد الـتـشغيل..\n💰 الـمكافأة: تـم تـقنين الـعطاء (1$ لـكل فـعل).\n\n◈ ──────────────── ◈`, threadID, messageID);
}
