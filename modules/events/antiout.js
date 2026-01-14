module.exports.config = {
  name: "منع_الهروب",
  version: "2.6.0",
  hasPermssion: 1, // للمشرفين فقط
  credits: "Ayman",
  description: "يمنع أعضاء المجموعة من المغادرة ويعيدهم تلقائياً",
  commandCategory: "🛡️ حماية المجموعات",
  usages: "تشغيل/ايقاف",
  cooldowns: 5,
};

module.exports.handleEvent = async function({ api, event, Threads }) {
  const { threadID, logMessageType, logMessageData } = event;

  if (logMessageType !== "log:unsubscribe") return;

  let data = (await Threads.getData(threadID)).data || {};
  if (!data.antiout) return;

  const leftID = logMessageData.leftParticipantFbId;
  if (leftID == api.getCurrentUserID()) return;

  const actorID = logMessageData.actorFbId;

  if (leftID === actorID) {
    api.addUserToGroup(leftID, threadID, (err) => {
      if (err) {
        return api.sendMessage(
          `◈ ───『 منع الهروب 』─── ◈\n\n🏃 لا يمكن إعادة العضو، خصوصية الحساب تمنعني من ذلك.\n◈ ─────────────── ◈`,
          threadID
        );
      }
      return api.sendMessage(
        `◈ ───『 منع الهروب 』─── ◈\n\n🛡️ ممنوع الهروب!\n✅ تم إعادة العضو إلى المجموعة بنجاح.\n◈ ─────────────── ◈`,
        threadID
      );
    });
  }
};

module.exports.run = async function({ api, event, Threads }) {
  const { threadID, messageID } = event;
  let data = (await Threads.getData(threadID)).data || {};

  data.antiout = !data.antiout;

  await Threads.setData(threadID, { data });
  global.data.threadData.set(threadID, data);

  return api.sendMessage(
    `◈ ───『 منع الهروب 』─── ◈\n\n🛡️ نظام منع الهروب\n⚙️ الحالة الآن: ${data.antiout ? "مـفـعـل ✅" : "مـتـوقـف ❌"}\n◈ ─────────────── ◈`,
    threadID,
    messageID
  );
};
