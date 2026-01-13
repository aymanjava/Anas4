module.exports.config = {
  name: "الاوامر",
  version: "25.0.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "ديوان الأوامر الأنيق - هبة",
  commandCategory: "النظام",
  usages: "[رقم الفئة]",
  cooldowns: 5
};

module.exports.handleReply = async function ({ api, event, handleReply }) {
  const { threadID, messageID, body } = event;
  const { commands } = global.client;

  if (handleReply.type !== "listCategory") return;

  const num = parseInt(body);
  const categoryName = handleReply.categories[num - 1];

  if (!categoryName) return api.sendMessage("🌸 الرقم غير موجود في السجلات يا عيني.", threadID, messageID);

  let msg = `✨ قـائمة أوامـر: 【 ${categoryName} 】\n\n`;
  const cmds = [];

  commands.forEach((cmd, name) => {
    let cat = cmd.config.commandCategory || "خدمات";
    if (cat.includes("ادمن") || cat.includes("تعديل")) cat = "المطور";
    else if (cat.includes("ترفيه") || cat.includes("تسلية")) cat = "العاب";
    else if (cat.includes("معلومات")) cat = "النظام";
    
    if (cat === categoryName) cmds.push(`• ${name}`);
  });

  msg += cmds.join("\n"); // جعل الأوامر تحت بعضها بشكل أرتب
  msg += `\n\n─━━━━━━⊱🎀⊰━━━━━━─\n`;
  msg += `💡 اكتب (اسم الأمر) لمعرفة تفاصيله.`;

  return api.sendMessage(msg, threadID, messageID);
};

module.exports.run = async ({ api, event }) => {
  const { threadID, messageID, senderID } = event;

  const validCategories = ["المطور", "النظام", "خدمات", "صور", "العاب"];
  
  let msg = `🎀 مرحباً بك في ديوان هـبة 🎀\n`;
  msg += `طلبـاتك أوامر سيدي أيمن.. ✨\n\n`;
  
  const icons = ["👑", "⚙️", "🛠️", "🖼️", "🎮"]; // أيقونات لكل فئة

  validCategories.forEach((cat, index) => {
    msg += `${icons[index]}  ${index + 1} ╎ فـئـة ${cat}\n`;
  });

  msg += `\n─━━━━━━⊱🌸⊰━━━━━━─\n`;
  msg += `💬 رد برقم الفئة لـعرض محتواها.\n`;
  msg += `👤 الـمطور: أيـمن (الـتـوب)`;

  return api.sendMessage(msg, threadID, (err, info) => {
    global.client.handleReply.push({
      name: this.config.name,
      messageID: info.messageID,
      author: senderID,
      type: "listCategory",
      categories: validCategories
    });
  }, messageID);
};
