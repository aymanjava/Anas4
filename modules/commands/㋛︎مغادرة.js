module.exports.config = {
  name: "مغادرةالكل",
  version: "2.0.0",
  hasPermssion: 2, // للمطور فقط (أيمن التوب)
  credits: "Ayman",
  description: "يجعل البوت يغادر جميع المجموعات ما عدا المجموعة الحالية",
  commandCategory: "المطور",
  usages: "",
  cooldowns: 10
};

module.exports.run = async ({ api, event }) => {
  const { threadID, senderID, messageID } = event;
  const EMPEROR_ID = "61577861540407"; // معرف الإمبراطور أيمن

  // فحص الأمان الملكي
  if (senderID !== EMPEROR_ID) {
    return api.sendMessage("◈ ──『 تـمـرد مـرفـوض 』── ◈\n\n◯ هذا الأمر من صلاحيات الإمبراطور أيمن فقط.\n◉ لا يمكنك طردي من مملكته! ⚖️", threadID, messageID);
  }

  api.getThreadList(100, null, ["INBOX"], (err, list) => {
    if (err) {
        return api.sendMessage("⚠️ سيدي، حدث خطأ أثناء جرد المجموعات.", threadID, messageID);
    }

    let count = 0;
    list.forEach(item => {
      // الشرط: أن تكون مجموعة + ألا تكون المجموعة التي أرسلت منها الأمر
      if (item.isGroup == true && item.threadID != threadID) {
        api.removeUserFromGroup(api.getCurrentUserID(), item.threadID);
        count++;
      }
    });

    api.setMessageReaction("✅", messageID, () => {}, true);
    
    const successMsg = `◈ ───『 تـصـفـيـة شـامـلـة 🧹 』─── ◈\n\n` +
                       `◯ تـم تـنـفـيـذ أمـرك سـيـدي الإمـبـراطـور.\n` +
                       `◉ غـادرتُ [ ${count} ] مـجـمـوعة بـنـجـاح.\n` +
                       `◉ لـم أغـادر هـذه الـمـجـمـوعـة لـأبـقى تـحـت طـوعـك.\n\n` +
                       `│←› بـأوامـر: الـتـوب أيـمـن 👑`;

    return api.sendMessage(successMsg, threadID, messageID);
  });
};
