module.exports.config = {
  name: "اوامر",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "Hiba",
  description: "قائمة الأوامر بنظام الأرقام والردود",
  commandCategory: "النظام",
  usages: "[رقم الفئة / اسم الأمر]",
  cooldowns: 5
};

module.exports.handleReply = async function ({ api, event, handleReply }) {
  const { commands } = global.client;
  const { threadID, messageID, body } = event;
  const prefix = global.config.PREFIX;

  // إذا كان الرد على قائمة الفئات الرئيسية
  if (handleReply.type === "category") {
    const categoryName = handleReply.allCategories[parseInt(body) - 1];
    if (!categoryName) return api.sendMessage("❌ رقم غير صالح، اختر رقم من القائمة.", threadID, messageID);

    const categoryCommands = Array.from(commands.values()).filter(cmd => cmd.config.commandCategory === categoryName);
    
    let msg = `◈ ───『 فئة: ${categoryName} 』─── ◈\n\n`;
    categoryCommands.forEach((cmd, index) => {
      msg += ` [ ${index + 1} ] ◉ ${cmd.config.name}\n`;
    });
    msg += `\n———————————————\n│←› رد برقم الأمر أو اسمه للتفاصيل\n◈ ─────────────── ◈`;

    return api.sendMessage(msg, threadID, (err, info) => {
      global.client.handleReply.push({
        name: this.config.name,
        messageID: info.messageID,
        type: "commandDetail",
        commands: categoryCommands
      });
    }, messageID);
  }

  // إذا كان الرد لعرض تفاصيل أمر معين
  if (handleReply.type === "commandDetail") {
    let command;
    if (isNaN(body)) {
      command = commands.get(body.toLowerCase());
    } else {
      command = handleReply.commands[parseInt(body) - 1];
    }

    if (!command) return api.sendMessage("❌ الأمر غير موجود.", threadID, messageID);

    const config = command.config;
    let msg = `◈ ───『 تفاصيل الأمر 』─── ◈\n\n`;
    msg += `◉ الاسـم: ${config.name}\n`;
    msg += `◉ الوصـف: ${config.description}\n`;
    msg += `◉ الطريقة: ${prefix}${config.name} ${config.usages || ""}\n`;
    msg += `◉ الانتظار: ${config.cooldowns} ثانية\n\n`;
    msg += `◈ ──────────────── ◈`;
    return api.sendMessage(msg, threadID, messageID);
  }
};

module.exports.run = async function ({ api, event }) {
  const { commands } = global.client;
  const { threadID, messageID } = event;

  const categories = [];
  for (const [name, command] of commands) {
    const cat = command.config.commandCategory || "إضافات";
    if (!categories.includes(cat)) categories.push(cat);
  }

  let msg = `◈ ───『 قائمة الاوامر 』─── ◈\n\n`;
  categories.forEach((cat, index) => {
    msg += ` ◯ [ ${index + 1} ] : ${cat}\n`;
  });

  msg += `\n———————————————\n`;
  msg += `│←› عدد الفئات: ${categories.length}\n`;
  msg += `│←› رد برقم القسم لعرض الأوامر\n`;
  msg += `│←› المطور: 『 ايمن 』\n`;
  msg += `◈ ─────────────── ◈`;

  return api.sendMessage(msg, threadID, (err, info) => {
    global.client.handleReply.push({
      name: this.config.name,
      messageID: info.messageID,
      type: "category",
      allCategories: categories
    });
  }, messageID);
};
