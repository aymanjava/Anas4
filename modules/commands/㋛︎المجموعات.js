module.exports.config = {
  name: "المجموعات",
  version: "3.0.0",
  hasPermssion: 2,
  credits: "Ayman",
  description: "استعراض المجموعات التي يتواجد بها البوت والخروج منها",
  commandCategory: "المطور",
  usages: "",
  cooldowns: 5
};

module.exports.handleReply = async function({ api, event, handleReply }) {
  const { threadID, messageID, senderID, body } = event;
  const isTop = global.config.ADMINBOT.includes(senderID);

  if (!isTop) return;

  const index = parseInt(body);
  if (isNaN(index) || index <= 0 || index > handleReply.allThreads.length) {
    return api.sendMessage("⚠️ سيدي، الرقم الذي أدخلته غير موجود في القائمة.", threadID, messageID);
  }

  const targetThread = handleReply.allThreads[index - 1];
  
  return api.removeUserFromGroup(api.getCurrentUserID(), targetThread.threadID, (err) => {
    if (err) return api.sendMessage(`❌ فشل الخروج من مجموعة: ${targetThread.name}`, threadID, messageID);
    return api.sendMessage(`◈ ───『 انـسـحـاب مـلـكـي 』─── ◈\n\n✅ تم الانسحاب من المجموعة بنجاح:\n🏰 الاسم: ${targetThread.name}\n🆔 الأيدي: ${targetThread.threadID}\n\n◈ ──────────────── ◈`, threadID, messageID);
  });
};

module.exports.run = async function({ api, event, Currencies }) {
  const { threadID, messageID, senderID } = event;
  const isTop = global.config.ADMINBOT.includes(senderID);

  if (!isTop) {
    return api.sendMessage("◈ ───『 تـنـبـيـه 』─── ◈\n\n⚠️ عذراً، لا يحق إلا للـتـوب ايـمـن الاطلاع على خريطة الانتشار الملكي 👑\n\n◈ ──────────────── ◈", threadID, messageID);
  }

  const allThreads = (await api.getThreadList(100, null, ["INBOX"])).filter(t => t.isGroup);
  let msg = `◈ ───『 خـريـطـة الانـتـشـار 』─── ◈\n\n`;
  
  allThreads.forEach((thread, index) => {
    msg += `📍 [${index + 1}] ← ${thread.name}\n🆔 ID: ${thread.threadID}\n\n`;
  });

  msg += ` ———————————————\n`;
  msg += `💬 رد بـرقم المجموعة لـسحب هـبـة مـنـها فوراً.\n`;
  msg += `│←› الـقـائـد الأعـلـى: الـتـوب ايـمـن 👑\n`;
  msg += `◈ ──────────────── ◈`;

  return api.sendMessage(msg, threadID, (err, info) => {
    global.client.handleReply.push({
      name: this.config.name,
      messageID: info.messageID,
      author: senderID,
      allThreads
    });
  }, messageID);
};
