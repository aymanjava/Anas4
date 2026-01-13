module.exports.config = {
  name: "الاوامر",
  version: "27.0.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "قائمة الأوامر بالفئات المخصصة والزخرفة",
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

  if (!categoryName) return api.sendMessage("❌ الرقم غير موجود في القائمة يا بطل.", threadID, messageID);

  const cmds = [];
  commands.forEach((cmd, name) => {
    let cat = cmd.config.commandCategory || "النظام";
    
    // توحيد المسميات لتطابق فئاتك الجديدة
    if (cat.includes("ميديا") || cat.includes("فيديو") || cat.includes("وسائط")) cat = "ميديا";
    else if (cat.includes("ادمن") || cat.includes("تعديل") || cat.includes("المطور")) cat = "المطور";
    else if (cat.includes("العاب") || cat.includes("لعب")) cat = "العاب";
    else if (cat.includes("ترفيه") || cat.includes("تسلية")) cat = "ترفيه";
    else if (cat.includes("صور") || cat.includes("تصميم")) cat = "صور";
    else cat = "النظام";
    
    if (cat === categoryName) cmds.push(`◉ ${name}`);
  });

  let msg = `◈ ───『 فئة ${categoryName} 』─── ◈\n\n`;
  
  // تنسيق الأوامر في صفوف مرتبة
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

  // الفئات التي طلبتها بالترتيب
  const validCategories = ["ميديا", "العاب", "المطور", "ترفيه", "صور", "النظام"];
  
  let msg = `◈ ───『قائمة الاوامر』─── ◈\n\n`;

  validCategories.forEach((cat) => {
    const catCmds = [];
    commands.forEach((cmd, name) => {
      let currentCat = cmd.config.commandCategory || "النظام";
      
      // مطابقة الفئات للتصنيف الرئيسي
      if (currentCat.includes("ميديا") || currentCat.includes("فيديو") || currentCat.includes("وسائط")) currentCat = "ميديا";
      else if (currentCat.includes("ادمن") || currentCat.includes("تعديل") || currentCat.includes("المطور")) currentCat = "المطور";
      else if (currentCat.includes("العاب") || currentCat.includes("لعب")) currentCat = "العاب";
      else if (currentCat.includes("ترفيه") || currentCat.includes("تسلية")) currentCat = "ترفيه";
      else if (currentCat.includes("صور") || currentCat.includes("تصميم")) currentCat = "صور";
      else currentCat = "النظام";
      
      if (currentCat === cat) catCmds.push(name);
    });

    if (catCmds.length > 0) {
      msg += `◯ ${cat} :\n`;
      // عرض الأوامر بشكل مختصر كما في المثال
      msg += `◉ ${catCmds.slice(0, 4).join(" ◉ ")}\n`;
      if (catCmds.length > 4) msg += `◉ ...\n`;
      msg += `————————━━━━━━━\n\n`;
    }
  });

  msg += `◈ ─────────────── ◈\n`;
  msg += `│←› عدد الاوامر هو: ${commands.size}\n`;
  msg += `│←› رد برقم الفئة لفتحها: (1-6)\n`;
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
