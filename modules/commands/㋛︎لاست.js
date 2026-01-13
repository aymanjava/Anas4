module.exports.config = {
  name: "لاست",
  version: '3.0.0',
  credits: 'Ayman',
  hasPermssion: 2, // للمطور (التوب) فقط
  description: 'مركز السيطرة على المجموعات وإحصائيات الثروة',
  commandCategory: 'المطور',
  usages: 'لاست',
  cooldowns: 5
};

module.exports.handleReply = async function({ api, event, Threads, handleReply, Currencies }) {
  const { senderID, body, threadID, messageID } = event;
  if (parseInt(senderID) !== parseInt(handleReply.author)) return;

  const args = body.split(" ");
  const index = parseInt(args[1]) - 1;
  const targetID = handleReply.groupid[index];

  if (!targetID) return api.sendMessage("◯ رقم المجموعة غير صحيح في القائمة!", threadID, messageID);

  switch (args[0]) {
    case "حظر": {
      const data = (await Threads.getData(targetID)).data || {};
      data.banned = true;
      await Threads.setData(targetID, { data });
      global.data.threadBanned.set(targetID, 1);
      api.sendMessage(`✅ [التوب] تم حظر المجموعة بنجاح:\nID: ${targetID}`, threadID, messageID);
      break;
    }

    case "خروج":
    case "غادري": {
      api.removeUserFromGroup(api.getCurrentUserID(), targetID, (err) => {
        if (err) return api.sendMessage("❌ فشل الخروج من المجموعة.", threadID, messageID);
        api.sendMessage(`✅ [التوب] تم الانسحاب من المجموعة:\nID: ${targetID}`, threadID, messageID);
      });
      break;
    }
  }
};

module.exports.run = async function({ api, event, Threads, Currencies }) {
  const { threadID, messageID, senderID } = event;

  // جلب قائمة المجموعات
  let inbox = await api.getThreadList(100, null, ['INBOX']);
  let list = inbox.filter(group => group.isSubscribed && group.isGroup);

  let listthread = [];
  for (let groupInfo of list) {
    let threadData = await Threads.getInfo(groupInfo.threadID);
    
    // إحصائية إضافية: كم يملك أعضاء هذه المجموعة من أموال في الخزينة المركزية؟
    let threadMoney = 0;
    if (threadData && threadData.participantIDs) {
      for (let id of threadData.participantIDs) {
        let money = (await Currencies.getData(id)).money || 0;
        threadMoney += money;
      }
    }

    listthread.push({
      id: groupInfo.threadID,
      name: groupInfo.name || "مجموعة بدون اسم",
      members: groupInfo.participantIDs.length,
      wealth: threadMoney
    });
  }

  // ترتيب المجموعات حسب عدد الأعضاء
  listthread.sort((a, b) => b.members - a.members);

  let msg = `◈ ───『 سـيـطـرة الـتـوب 』─── ◈\n\n`;
  let groupIDs = [];

  listthread.forEach((group, i) => {
    msg += `${i + 1}. ${group.name}\n`;
    msg += `🆔 المعرف: ${group.id}\n`;
    msg += `👥 الأعضاء: ${group.members}\n`;
    msg += `💰 ثروة المجموعة: ${group.wealth.toLocaleString()}$\n\n`;
    groupIDs.push(group.id);
  });

  msg += `◈ ──────────────── ◈\n`;
  msg += `◯ للتحكم رد بـ: [خروج رقم] أو [حظر رقم]\n`;
  msg += `│←› المدير العام: ايـمـن 👑`;

  return api.sendMessage(msg, threadID, (err, info) => {
    global.client.handleReply.push({
      name: this.config.name,
      author: senderID,
      messageID: info.messageID,
      groupid: groupIDs,
      type: 'reply'
    });
  }, messageID);
};
