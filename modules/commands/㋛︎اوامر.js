const fs = require("fs");
const { setTimeout } = require("timers/promises");

module.exports.config = {
  name: "اوامر",
  version: "2.1.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "قائمة أوامر البوت هبة مع فئة اسلاميات، اختيار سريع بالرقم فقط",
  commandCategory: "النظام",
  usages: "[رقم الفئة]",
  usePrefix: true,
  cooldowns: 5
};

module.exports.run = async function ({ api, event, args, Commands }) {
  const { threadID, messageID } = event;

  // تنظيم الأوامر حسب الفئات (مع فئة اسلاميات)
  const categories = {
    "1": "فئة الترفيه",
    "2": "فئة الذكاء AI",
    "3": "فئة الإدارة والأنظمة",
    "4": "فئة الألعاب",
    "5": "فئة المتفرقات",
    "6": "فئة اسلاميات"
  };

  // إذا الرقم غير صحيح أو فارغ، عرض رسالة تذكيرية
  const chosen = args[0];
  if (!chosen || !categories[chosen]) {
    const msg = "◈ ───『أدخل رقم الفئة فقط』─── ◈\n\n" +
                "1 ⟢ فئة الترفيه\n" +
                "2 ⟢ فئة الذكاء AI\n" +
                "3 ⟢ فئة الإدارة والأنظمة\n" +
                "4 ⟢ فئة الألعاب\n" +
                "5 ⟢ فئة المتفرقات\n" +
                "6 ⟢ فئة اسلاميات\n\n" +
                "اكتب الرقم فقط لرؤية الأوامر";
    const sentMsg = await api.sendMessage(msg, threadID, messageID);
    return setTimeout(120000).then(() => api.unsendMessage(sentMsg.messageID));
  }

  // جلب قائمة أوامر الفئة المختارة
  const chosenName = categories[chosen];
  const commands = Array.from(Commands.values());
  const cmdList = commands
    .filter(cmd => cmd.config.commandCategory === chosenName)
    .map(cmd => cmd.config.name);

  let helpMsg = `◈ ───『${chosenName}』─── ◈\n\n`;
  helpMsg += cmdList.length > 0 ? cmdList.join(" | ") : "لا توجد أوامر في هذه الفئة حالياً";
  helpMsg += `\n\n◈ ─────────────── ◈\n`;
  helpMsg += `│←› عدد الاوامر: ${cmdList.length}\n`;
  helpMsg += `│←› الرسائل تحذف تلقائياً بعد دقيقتين\n`;
  helpMsg += `│←› استمتع بـ هبة`;

  const sentMsg2 = await api.sendMessage(helpMsg, threadID, messageID);
  setTimeout(120000).then(() => api.unsendMessage(sentMsg2.messageID));
};
