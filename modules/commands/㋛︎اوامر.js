module.exports.config = {
  name: "الاوامر",
  version: "31.0.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "ديوان الأوامر التفاعلي",
  commandCategory: "النظام",
  usePrefix: true,
  cooldowns: 5
};

module.exports.handleReply = async function ({ api, event, handleReply }) {
  const { threadID, messageID, body } = event;
  const { commands } = global.client;

  if (handleReply.type !== "listCategory") return;

  const num = parseInt(body);
  const categories = handleReply.categories;
  const categoryName = categories[num - 1];

  if (!categoryName) return api.sendMessage("◯ الرقم الذي اخترته غير موجود بالقائمة.", threadID, messageID);

  const cmds = [];
  commands.forEach((cmd, name) => {
    let cat = cmd.config.commandCategory || "أخرى";
    // توحيد المسميات لتطابق الاختيار
    if (cat.includes("ميديا") || cat.includes("وسائط")) cat = "الوسائط";
    else if (cat.includes("العاب") || cat.includes("ترفيه")) cat = "الألعاب";
    else if (cat.includes("صور") || cat.includes("تعديل")) cat = "الصور";
    else if (cat.includes("ذكاء") || cat.includes("AI")) cat = "الذكاء";
    else if (cat.includes("خدمات") || cat.includes("نظام")) cat = "الخدمات";
    else if (cat.includes("مطور") || cat.includes("ادمن")) cat = "المطور";

    if (cat === categoryName) cmds.push(`◉ ${name}`);
  });

  let msg = `◈ ───『 فئة ${categoryName} 』─── ◈\n\n`;
  
  // ترتيب الأوامر في صفوف ثنائية لتصغير الحجم
  for (let i = 0; i < cmds.length; i += 2) {
    msg += `${cmds[i]} ${cmds[i+1] ? cmds[i+1] : ""}\n`;
  }

  msg += `\n————————━━━━━━━\n`;
  msg += `│←› عدد الأوامر: ${cmds.length}\n`;
  msg += `│←› اكتب اسم الأمر لمعرفة استخدامه.`;

  return api.sendMessage(msg, threadID, messageID);
};

module.exports.run = async ({ api, event }) => {
  const { threadID, messageID, senderID } = event;

  const validCategories = ["الوسائط", "الألعاب", "الصور", "الذكاء", "الخدمات", "المطور"];
  const icons = ["🎬", "🎮", "🖼️", "🤖", "🛠️", "👑"];

  let msg = `◈ ───『 قائمة الاوامر 』─── ◈\n\n`;
  msg += `◯ الرجاء اختيار رقم الفئة المراد عرضها:\n\n`;

  validCategories.forEach((cat, index) => {
    msg += `${icons[index]} ${index + 1} ╎ فئة ${cat}\n`;
  });

  msg += `\n————————━━━━━━━\n`;
  msg += `│←› استمتع باستخدام هـبـة\n`;
  msg += `│←› رد برقم الفئة لعرض المحتوى\n`;
  msg += `◈ ─────────────── ◈`;

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
