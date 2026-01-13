module.exports.config = {
  name: "antiout",
  eventType: ["log:unsubscribe"],
  version: "2.0.0",
  credits: "Ayman",
  description: "نظام منع الهروب من المجموعة"
};

module.exports.handleEvent = async ({ api, event, Threads, Users }) => {
  const { threadID, logMessageData } = event;

  if (!logMessageData) return;

  const data = (await Threads.getData(threadID)).data || {};
  if (data.antiout !== true) return;

  const leftID = logMessageData.leftParticipantFbId;
  const actorID = logMessageData.actorFbId;

  // لا تتدخل إذا البوت خرج
  if (leftID == api.getCurrentUserID()) return;

  try {
    const name = await Users.getNameUser(leftID);

    // إذا خرج بنفسه
    if (leftID === actorID) {
      return api.addUserToGroup(leftID, threadID, (err) => {
        if (err) {
          return api.sendMessage(
`◈ ───『 مـنـع الـهـروب 』─── ◈

◯ ${name} حاول يطلع 🏃
◯ بس إعداداته منعتني أرجعه 😔

◈ ─────────────── ◈`,
            threadID
          );
        }

        api.sendMessage(
`◈ ───『 مـمـنـوع الـهـروب 』─── ◈

◯ العضو: ${name}
◯ تم إرجاعه بنجاح ✨
◯ لا تعيدها مرة ثانية 😌

◈ ─────────────── ◈`,
          threadID
        );
      });
    }

    // إذا طُرد من أدمن
    return api.sendMessage(
`◈ ───『 مـغـادرة 』─── ◈

◯ العضو: ${name}
◯ تم إخراجه بواسطة أحد المشرفين 🚪

◈ ─────────────── ◈`,
      threadID
    );

  } catch (e) {
    console.log("AntiOut Error:", e.message);
  }
};

module.exports.run = async ({ api, event, Threads }) => {
  const { threadID, messageID } = event;

  const data = (await Threads.getData(threadID)).data || {};
  data.antiout = !data.antiout;

  await Threads.setData(threadID, { data });

  return api.sendMessage(
`◈ ───『 مـنـع الـهـروب 』─── ◈

◯ الحالة: ${data.antiout ? "مفعل ✅" : "متوقف ❌"}

◈ ─────────────── ◈`,
    threadID,
    messageID
  );
};
