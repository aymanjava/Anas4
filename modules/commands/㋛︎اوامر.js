const fs = require("fs");
const { setTimeout } = require("timers/promises");

module.exports.config = {
  name: "اوامر",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "قائمة أوامر البوت هبة مع فئة اسلاميات، دعم كامل للرد والتاق والايدي والصور",
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

  // إذا لم يُحدد رقم الفئة، عرض القائمة الرئيسية
  if (!args[0] || !categories[args[0]]) {
    let msg = `◈ ───『قائمة الفئات هبة』─── ◈\n\n`;
    msg += `اختر رقم الفئة ليتم عرض أوامرها:\n\n`;

    for (let key in categories) {
      msg += `${key} ⟢ ${categories[key]}\n`;
    }

    msg += `\nارسل [اوامر + رقم الفئة] لرؤيتها`;
    const sentMsg = await api.sendMessage(msg, threadID, messageID);

    // حذف الرسالة بعد دقيقتين
    setTimeout(120000).then(() => {
      api.unsendMessage(sentMsg.messageID);
    });
    return;
  }

  // عرض أوامر الفئة المختارة
  const chosenName = categories[args[0]];
  let cmdList = [];

  const commands = Array.from(Commands.values());
  commands.forEach(cmd => {
    if (cmd.config.commandCategory === chosenName) {
      cmdList.push(cmd.config.name);
    }
  });

  let helpMsg = `◈ ───『${chosenName}』─── ◈\n\n`;

  if (cmdList.length > 0) {
    helpMsg += cmdList.join(" | ");
  } else {
    helpMsg += `لا توجد أوامر في هذه الفئة حالياً`;
  }

  helpMsg += `\n\n◈ ─────────────── ◈\n`;
  helpMsg += `│←› عدد الاوامر هو: ${cmdList.length}\n`;
  helpMsg += `│←› الرسائل تحذف تلقائياً بعد دقيقتين\n`;
  helpMsg += `│←› استمتع بـ هبة`;

  const sentMsg2 = await api.sendMessage(helpMsg, threadID, messageID);

  // حذف الرسالة بعد دقيقتين
  setTimeout(120000).then(() => {
    api.unsendMessage(sentMsg2.messageID);
  });
};
