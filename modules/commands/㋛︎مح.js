module.exports.config = {
  name: "مح",
  version: "1.0.0",
  hasPermssion: 1,
  credits: "Ayman",
  description: "طرد العضو عن طريق التاق أو الرد أو الآيدي",
  commandCategory: "〘 ادمن المجموعات 〙",
  usages: "[تاق/رد/آيدي]",
  cooldowns: 2
};

module.exports.run = async function({ api, event, args, Users }) {
  const { threadID, messageID, senderID, messageReply, mentions } = event;

  try {
    // التحقق من صلاحيات البوت في المجموعة
    const threadInfo = await api.getThreadInfo(threadID);
    if (!threadInfo.adminIDs.some(item => item.id == api.getCurrentUserID())) {
      return api.sendMessage("◯ عذراً، يجب أن أكون مسؤولاً (أدمن) لأتمكن من الطرد.", threadID, messageID);
    }

    let victimID;

    // 1. إذا كان الطرد عن طريق الرد على رسالة
    if (event.type == "message_reply") {
      victimID = messageReply.senderID;
    } 
    // 2. إذا كان الطرد عن طريق التاق (المنشن)
    else if (Object.keys(mentions).length > 0) {
      victimID = Object.keys(mentions)[0];
    }
    // 3. إذا كان الطرد عن طريق كتابة الآيدي مباشرة
    else if (args[0] && !isNaN(args[0])) {
      victimID = args[0];
    }
    else {
      return api.sendMessage("◯ يرجى عمل تاق للعضو أو الرد على رسالته لطره.", threadID, messageID);
    }

    // منع طرد المطور أو البوت نفسه أو الأدمنية
    const adminIDs = global.config.ADMINBOT;
    if (victimID == api.getCurrentUserID()) return api.sendMessage("◯ لا يمكنك طردي يا ذكي!", threadID, messageID);
    if (adminIDs.includes(victimID)) return api.sendMessage("◯ عذراً، لا يمكن طرد مطوري 『 ايمن 』.", threadID, messageID);
    if (threadInfo.adminIDs.some(item => item.id == victimID)) {
      return api.sendMessage("◯ لا يمكنني طرد مسؤول المجموعة.", threadID, messageID);
    }

    // تنفيذ الطرد
    const name = await Users.getNameUser(victimID);
    api.removeUserFromGroup(victimID, threadID, (err) => {
      if (err) return api.sendMessage("◯ حدث خطأ أثناء الطرد، ربما العضو غادر بالفعل.", threadID, messageID);
      
      return api.sendMessage({
        body: `◈ ───『 طــــــــرد 』─── ◈\n\n◯ الـعـضـو: [ ${name} ]\n◯ تـم طـرده بـنـجـاح مـن الـمـجـمـوعـة\n\n◈ ─────────────── ◈\n│←› بـواسـطـة الـمـطـور ايـمـن\n◈ ─────────────── ◈`
      }, threadID);
    });

  } catch (e) {
    console.log(e);
    api.sendMessage("◯ حدث خطأ غير متوقع.", threadID, messageID);
  }
};
