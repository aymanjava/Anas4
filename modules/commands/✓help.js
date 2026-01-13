module.exports.config = {
  name: "اوامر",
  version: "1.0.5",
  hasPermssion: 0,
  credits: "انس & عمر",
  description: "عرض قائمة الأوامر أو تفاصيل أمر معين",
  commandCategory: "نظام",
  usages: "[رقم الصفحة / اسم الأمر]",
  cooldowns: 2
};

module.exports.run = async function({ api, event, args }) {
  const { commands } = global.client;
  const { threadID, messageID } = event;
  const threadSetting = global.data.threadData.get(threadID) || {};
  const prefix = threadSetting.PREFIX || global.config.PREFIX;
  const commandInput = args[0] ? args[0].toLowerCase() : "";

  // 1. إذا كان المستخدم يبحث عن تفاصيل أمر معين
  if (commandInput && commands.has(commandInput)) {
    const command = commands.get(commandInput);
    const config = command.config;
    const msg = "╭─────────────╮\n" +
                `    💎 الأمـر: 『 ${config.name} 』\n` +
                `    ✨ الوصف: ${config.description || "لا يوجد"}\n` +
                "╰─────────────╯\n" +
                `🔳 الاستخدام: ${prefix}${config.name} ${config.usages || ""}\n` +
                `🔳 الفئة: ${config.commandCategory}\n` +
                `🔳 الانتظار: ${config.cooldowns} ثانية\n` +
                `🔳 الصلاحية: ${(config.hasPermssion == 0) ? "الكل" : (config.hasPermssion == 1) ? "أدمن المجموعة" : "المطور"}`;
    
    return api.sendMessage(msg, threadID, messageID);
  }

  // 2. عرض قائمة الأوامر العامة
  const arrayInfo = Array.from(commands.keys());
  const page = parseInt(args[0]) || 1;
  const numberOfOnePage = 15; 
  const totalPages = Math.ceil(arrayInfo.length / numberOfOnePage);

  if (page > totalPages || page < 1) return api.sendMessage(`⚠️ لا توجد صفحة برقم ${page}`, threadID, messageID);

  let msg = "╭─────────────╮\n" +
            "    💎 قـائـمـة الأوامـر 💎\n" +
            "╰─────────────╯\n";

  const startSlice = (page - 1) * numberOfOnePage;
  const returnArray = arrayInfo.slice(startSlice, startSlice + numberOfOnePage);

  for (let i = 0; i < returnArray.length; i++) {
    msg += `  🔳 ${startSlice + i + 1}. 『 ${returnArray[i]} 』\n`;
  }

  msg += `╰─────────────╯\n✨ الصفحة: [ ${page} / ${totalPages} ]\n✨ إجمالي الأوامر: ${arrayInfo.length}\n✨ اطلب [ ${prefix}اوامر اسم_الأمر ] للتفاصيل`;

  return api.sendMessage(msg, threadID, messageID);
};
