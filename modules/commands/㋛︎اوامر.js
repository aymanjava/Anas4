module.exports.config = {
  name: "الاوامر",
  version: "26.0.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "قائمة الأوامر بالزخرفة الملكية",
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

  if (!categoryName) return api.sendMessage("❌ الرقم غير موجود في القائمة.", threadID, messageID);

  const cmds = [];
  commands.forEach((cmd, name) => {
    let cat = cmd.config.commandCategory || "الخـدمات";
    // توحيد المسميات لتطابق الفئات
    if (cat.includes("ميديا") || cat.includes("فيديو")) cat = "الوسائط";
    else if (cat.includes("ذكاء") || cat.includes("AI")) cat = "الذكاء AI";
    else if (cat.includes("ترفيه") || cat.includes("العاب")) cat = "اللـعب";
    else if (cat.includes("أدوات") || cat.includes("خدمات")) cat = "الخـدمات";
    
    if (cat === categoryName) cmds.push(`◉ ${name}`);
  });

  let msg = `◈ ───『 فئة ${categoryName} 』─── ◈\n\n`;
  
  // تنسيق الأوامر في صفوف (كل سطر به 2-3 أوامر)
  for (let i = 0; i < cmds.length; i += 2) {
    msg += `${cmds[i]} ${cmds[i+1] ? cmds[i+1] : ""}\n`;
  }

  msg += `\n———————————————\n`;
  msg += `│←› عدد أوامر الفئة: ${cmds.length}\n`;
  msg += `│←› اكتب اسم الأمر لمعرفة استخدامه.`;

  return api.sendMessage(msg, threadID, messageID);
};

module.exports.run = async ({ api, event }) => {
  const { threadID, messageID, senderID } = event;
  const { commands } = global.client;

  const validCategories = ["الوسائط", "الذكاء AI", "الخـدمات", "الآداوات", "اللـعب"];
  
  let msg = `◈ ───『قائمة الاوامر』─── ◈\n\n`;

  validCategories.forEach((cat) => {
    const catCmds = [];
    commands.forEach((cmd, name) => {
      let currentCat = cmd.config.commandCategory || "الخـدمات";
      if (currentCat.includes("ميديا") || currentCat.includes("فيديو")) currentCat = "الوسائط";
      else if (currentCat.includes("ذكاء") || currentCat.includes("AI")) currentCat = "الذكاء AI";
      else if (currentCat.includes("ترفيه") || currentCat.includes("العاب")) currentCat = "اللـعب";
      
      if (currentCat === cat) catCmds.push(name);
    });

    if (catCmds.length > 0) {
      msg += `◯ ${cat} :\n`;
      // عرض أول 4 أوامر كمثال تحت كل فئة
      msg += `◉ ${catCmds.slice(0, 4).join(" ◉ ")}\n`;
      if (catCmds.length > 4) msg += `◉ ...\n`;
      msg += `———————————————\n\n`;
    }
  });

  msg += `◈ ─────────────── ◈\n`;
  msg += `│←› عدد الاوامر هو: ${commands.size}\n`;
  msg += `│←› رد برقم الفئة لفتحها: (1-5)\n`;
  msg += `│←› استمتع بـ هـبـة`;

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
