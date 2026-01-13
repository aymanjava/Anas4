module.exports.config = {
  name: "طرد",
  version: "1.0.1",
  hasPermission: 1,
  credits: "Ayman",
  description: "طرد عضو عن طريق الرد أو التاق أو الآيدي",
  commandCategory: "〘 ادمن المجموعات 〙",
  usages: "[رد | تاق | آيدي]",
  cooldowns: 2
};

module.exports.run = async function ({ api, event, args, Users }) {
  const { threadID, messageID, mentions, messageReply } = event;

  try {
    // معلومات المجموعة
    const threadInfo = await api.getThreadInfo(threadID);

    // تحقق أن البوت أدمن
    if (!threadInfo.adminIDs.some(e => e.id == api.getCurrentUserID())) {
      return api.sendMessage(
        "◯ يجب أن أكون أدمن حتى أستطيع الطرد.",
        threadID,
        messageID
      );
    }

    let victimID;

    // 1️⃣ الرد
    if (messageReply) {
      victimID = messageReply.senderID;
    }
    // 2️⃣ التاق
    else if (Object.keys(mentions).length > 0) {
      victimID = Object.keys(mentions)[0];
    }
    // 3️⃣ الآيدي
    else if (args[0] && !isNaN(args[0])) {
      victimID = args[0];
    } else {
      return api.sendMessage(
        "◯ استخدم الأمر بالرد أو التاق أو كتابة الآيدي.",
        threadID,
        messageID
      );
    }

    // منع طرد البوت
    if (victimID == api.getCurrentUserID()) {
      return api.sendMessage("◯ لا أستطيع طرد نفسي 😂", threadID, messageID);
    }

    // منع طرد المطور
    if (global.config.ADMINBOT?.includes(victimID)) {
      return api.sendMessage("◯ لا يمكن طرد المطور.", threadID, messageID);
    }

    // منع طرد أدمن
    if (threadInfo.adminIDs.some(e => e.id == victimID)) {
      return api.sendMessage("◯ لا يمكن طرد أدمن المجموعة.", threadID, messageID);
    }

    const name = await Users.getNameUser(victimID);

    api.removeUserFromGroup(victimID, threadID, err => {
      if (err) {
        return api.sendMessage(
          "◯ فشل الطرد، ربما العضو غير موجود.",
          threadID,
          messageID
        );
      }

      api.sendMessage(
        `◈ ───『 طـرد 』─── ◈

◯ العضو: ${name}
◯ تم طرده بنجاح من المجموعة

◈ ───────────── ◈
│ بواسطة المطور أيمن
◈ ───────────── ◈`,
        threadID
      );
    });

  } catch (err) {
    console.log(err);
    api.sendMessage("◯ حدث خطأ غير متوقع.", threadID, messageID);
  }
};
