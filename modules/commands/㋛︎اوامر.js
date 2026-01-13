module.exports.config = {
  name: "اوامر",
  version: "1.0.2",
  hasPermssion: 0,
  credits: "Mirai Team",
  description: "عرض قائمة الأوامر مقسمة حسب الفئات",
  commandCategory: "النظام",
  usages: "[اسم الأمر]",
  cooldowns: 5,
  envConfig: {
    autoUnsend: true,
    delayUnsend: 60
  }
};

module.exports.run = async function ({ api, event, args, getText }) {
  const { commands } = global.client;
  const { threadID, messageID } = event;
  const prefix = global.config.PREFIX;

  // إذا طلب المستخدم تفاصيل أمر معين
  if (args[0]) {
    const command = commands.get(args[0].toLowerCase());
    if (!command) return api.sendMessage(`⚠️ الأمر [ ${args[0]} ] غير موجود.`, threadID, messageID);

    const config = command.config;
    let msg = `╭─────────────╮\n`;
    msg += `    💎 الأمـر: ${config.name}\n`;
    msg += `    ✨ الـفـئة: ${config.commandCategory}\n`;
    msg += `    📝 الـوصف: ${config.description}\n`;
    msg += `    🛠 الـطريقة: ${prefix}${config.name} ${config.usages || ""}\n`;
    msg += `    ⏳ الـتبريد: ${config.cooldowns} ثانية\n`;
    msg += `╰─────────────╯`;
    return api.sendMessage(msg, threadID, messageID);
  }

  // إنشاء قائمة الأوامر المقسمة
  const categories = {};
  for (const [name, command] of commands) {
    const category = command.config.commandCategory || "أخرى";
    if (!categories[category]) categories[category] = [];
    categories[category].push(name);
  }

  let helpMsg = "╭─────────────╮\n";
  helpMsg += "    ✨ قـائـمـة الأوامـر ✨\n";
  helpMsg += "╰─────────────╯\n";

  for (const category in categories) {
    helpMsg += `\n『 ${category.toUpperCase()} 』\n`;
    helpMsg += `⮕ ${categories[category].join(", ")}\n`;
    helpMsg += `──────────────`;
  }

  helpMsg += `\n\n🔳 إجـمالي الأوامـر: [ ${commands.size} ]\n`;
  helpMsg += `🔳 اكـتب [ ${prefix}اوامر + اسم الأمر ] للتفاصيل`;

  return api.sendMessage(helpMsg, threadID, messageID);
};
