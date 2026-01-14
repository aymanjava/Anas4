module.exports.config = {
  name: "الاوامر",
  version: "1.5.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "عرض كافة أوامر البوت مباشرة",
  commandCategory: "النظام",
  usages: "الاوامر",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
  const { commands } = global.client;
  const { threadID, messageID } = event;

  // تنظيم الأوامر حسب الفئة
  const categories = {};
  for (const [name, command] of commands.entries()) {
    const category = command.config.commandCategory || "أخرى";
    if (!categories[category]) categories[category] = [];
    categories[category].push(name);
  }

  let msg = `◈ ───『 قـائـمـة الأوامـر 』─── ◈\n\n`;

  // بناء الرسالة لعرض كل الفئات والأوامر تحتها
  for (const category in categories) {
    msg += `📂 ┠──『 ${category.toUpperCase()} 』\n`;
    msg += `│ 💠 ${categories[category].join(" ، ")}\n`;
    msg += `│\n`;
  }

  msg += `◈ ─────────────── ◈\n`;
  msg += `◯ إجمالي الأوامر: ${commands.size}\n`;
  msg += `◯ المطور: أيـمـن\n`;
  msg += `◈ ─────────────── ◈`;

  return api.sendMessage(msg, threadID, messageID);
};
