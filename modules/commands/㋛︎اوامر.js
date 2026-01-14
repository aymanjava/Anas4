const { setTimeout } = require("timers/promises");

module.exports.config = {
  name: "اوامر",
  version: "2.2.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "قائمة أوامر البوت بنظام فئات + اختيار بالرد",
  commandCategory: "النظام",
  usages: "",
  cooldowns: 5
};

module.exports.run = async function ({ api, event }) {
  const { threadID, messageID, senderID } = event;

  const msg =
`◈ ───『 اختر رقم الفئة 』─── ◈

1 ⟢ فئة الترفيه
2 ⟢ فئة الذكاء AI
3 ⟢ فئة الإدارة
4 ⟢ فئة الألعاب
5 ⟢ فئة المتفرقات
6 ⟢ فئة اسلاميات

◯ فقط قم بالرد بالرقم
`;

  const sent = await api.sendMessage(msg, threadID, messageID);

  global.client.handleReply.push({
    name: this.config.name,
    messageID: sent.messageID,
    author: senderID
  });

  setTimeout(120000).then(() => api.unsendMessage(sent.messageID));
};

module.exports.handleReply = async function ({ api, event, handleReply, Commands }) {
  const { threadID, messageID, senderID, body } = event;

  if (senderID !== handleReply.author) return;

  const categories = {
    "1": "فئة الترفيه",
    "2": "فئة الذكاء AI",
    "3": "فئة الإدارة",
    "4": "فئة الألعاب",
    "5": "فئة المتفرقات",
    "6": "فئة اسلاميات"
  };

  const chosen = body.trim();
  if (!categories[chosen]) {
    return api.sendMessage("⚠️ رقم غير صحيح، أعد المحاولة.", threadID, messageID);
  }

  const chosenName = categories[chosen];
  const commands = Array.from(Commands.values());

  const cmdList = commands
    .filter(cmd => cmd.config.commandCategory === chosenName)
    .map(cmd => cmd.config.name);

  let msg =
`◈ ───『 ${chosenName} 』─── ◈

`;

  msg += cmdList.length
    ? cmdList.join(" │ ")
    : "لا توجد أوامر حالياً";

  msg += `
  
◈ ─────────────── ◈
│←› عدد الأوامر: ${cmdList.length}
│←› يتم الحذف تلقائياً
│←› Heba System
`;

  const sent = await api.sendMessage(msg, threadID, messageID);
  setTimeout(120000).then(() => api.unsendMessage(sent.messageID));
};
