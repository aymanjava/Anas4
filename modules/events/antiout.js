module.exports.config = {
  name: "منع_الهروب",
  version: "2.5.0",
  hasPermssion: 1, // للمشرفين فقط لتشغيله
  credits: "Ayman",
  description: "يمنع أعضاء المجموعة من المغادرة ويرجعهم تلقائياً",
  commandCategory: "🛡️ حماية المجموعات",
  usages: "تشغيل/ايقاف",
  cooldowns: 5,
};

module.exports.handleEvent = async function({  api, event, Threads }) {
    const { threadID, logMessageType, logMessageData } = event;

    // التأكد أن الحدث هو خروج عضو
    if (logMessageType !== "log:unsubscribe") return;

    // جلب بيانات المجموعة للتأكد هل النظام مفعل أم لا
    let data = (await Threads.getData(threadID)).data || {};
    if (data.antiout !== true) return;

    // إذا كان البوت هو من خرج، لا يفعل شيء
    const leftID = logMessageData.leftParticipantFbId;
    if (leftID == api.getCurrentUserID()) return;

    const actorID = logMessageData.actorFbId;

    // إذا كان الشخص هو من خرج بنفسه (هروب)
    if (leftID == actorID) {
        api.addUserToGroup(leftID, threadID, (err) => {
            if (err) {
                return api.sendMessage(`╭──── • 𝑯𝑬𝑩𝑨 • ────╮\n\n🏃 حاول أحدهم الهروب ولكن خصوصية حسابه تمنعني من إعادته!\n\n╰──────────────╯`, threadID);
            }
            return api.sendMessage(`╭──── • 𝑯𝑬𝑩𝑨 • ────╮\n\n🛡️ ممنوع الهروب من هنا!\n✅ تم إعادة العضو إلى المجموعة بنجاح.\n\n╰──────────────╯`, threadID);
        });
    }
};

module.exports.run = async function({ api, event, Threads }) {
    const { threadID, messageID } = event;
    let data = (await Threads.getData(threadID)).data || {};

    // تبديل الحالة
    if (typeof data.antiout == "undefined" || data.antiout == false) {
        data.antiout = true;
    } else {
        data.antiout = false;
    }

    await Threads.setData(threadID, { data });
    global.data.threadData.set(threadID, data);

    return api.sendMessage(`╭──── • 𝑯𝑬𝑩𝑨 • ────╮\n\n🛡️ نظام منع الهروب\n⚙️ الحالة الآن: ${data.antiout ? "مـفـعـل ✅" : "مـتـوقـف ❌"}\n\n╰──────────────╯`, threadID, messageID);
};
