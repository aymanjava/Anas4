module.exports.config = {
  name: "الاوامر",
  version: "25.0.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "ديوان الأوامر الطبقي - فئات ثم أوامر",
  commandCategory: "النظام",
  usages: "[الرد برقم الفئة]",
  cooldowns: 5
};

module.exports.handleReply = async function ({ api, event, handleReply }) {
  const { threadID, messageID, body } = event;
  const { commands } = global.client;

  // منع الرد إذا لم يكن المردود عليه هو قائمة الفئات
  if (handleReply.type !== "listCategory") return;

  const num = parseInt(body);
  const categoryName = handleReply.categories[num - 1];

  if (!categoryName) return api.sendMessage("⚠️ الرقم الذي أدخلته خارج نطاق السجلات الملكية.", threadID, messageID);

  let msg = `◈ ───『 أوامـر فـئـة: ${categoryName} 』─── ◈\n\n`;
  const cmds = [];

  commands.forEach((cmd, name) => {
    let cat = cmd.config.commandCategory || "خدمات";
    // توجيه الفئات للأقرب كما أمرت سيدي
    if (cat.includes("ادمن") || cat.includes("تعديل")) cat = "المطور";
    else if (cat.includes("ترفيه") || cat.includes("تسلية")) cat = "العاب";
    else if (cat.includes("معلومات")) cat = "النظام";
    
    if (cat === categoryName) cmds.push(name);
  });

  msg += `← ${cmds.join(", ")}\n\n`;
  msg += `————————————————\n`;
  msg += `اكتب الامر .. لـمعرفة تـفاصيله.\n`;
  msg += `👑 الـتـوب ايـمـن\n`;
  msg += `◈ ──────────────── ◈`;

  // إرسال الأوامر مع تعطيل الرد الثاني (لا نضع handleReply هنا)
  return api.sendMessage(msg, threadID, messageID);
};

module.exports.run = async ({ api, event }) => {
  const { threadID, messageID, senderID } = event;
  const { commands } = global.client;

  const validCategories = ["المطور", "النظام", "خدمات", "صور", "العاب"];
  let msg = `◈ ───『 ديـوان هـبـة الـمـلكـي 』─── ◈\n\n`;
  
  validCategories.forEach((cat, index) => {
    msg += `📍 [${index + 1}] ← فـئـة ${cat}\n`;
  });

  msg += `\n————————————————\n`;
  msg += `💬 رد بـرقم الـفـئـة لـعرض أوامـرها.\n`;
  msg += `👑 الـسلطة لـلـتـوب ايـمـن\n`;
  msg += `◈ ──────────────── ◈`;

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
