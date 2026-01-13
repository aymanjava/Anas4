const fs = require("fs-extra");
const pathModule = require("path");
const moment = require("moment-timezone");

module.exports.config = {
  name: "leaveNoti",
  eventType: ["log:unsubscribe"],
  version: "1.1.0",
  credits: "Ayman",
  description: "إشعار مغادرة معرب ومزخرف مع دعم GIF",
};

module.exports.onLoad = function () {
  const cachePath = pathModule.join(__dirname, "cache", "leaveGif", "randomgif");
  if (!fs.existsSync(cachePath)) fs.mkdirSync(cachePath, { recursive: true });
};

module.exports.run = async function () {
  // هذا الأمر فارغ لأن الحدث يعتمد على handleEvent
};

module.exports.handleEvent = async function ({ api, event, Users, Threads }) {
  try {
    const { threadID, logMessageData } = event;
    const leftID = logMessageData.leftParticipantFbId;

    // لا تتدخل إذا البوت هو الذي خرج
    if (leftID == api.getCurrentUserID()) return;

    // جلب اسم المستخدم
    const name = global.data.userName.get(leftID) || await Users.getNameUser(leftID);

    // جلب بيانات الكروب
    const data = global.data.threadData.get(threadID) || (await Threads.getData(threadID)).data;

    // وقت الإشعار
    const time = moment.tz("Asia/Baghdad").format("DD/MM/YYYY || HH:mm:ss");
    const hours = moment.tz("Asia/Baghdad").format("HH");
    const session = hours <= 10 ? "صباحاً" : hours > 10 && hours <= 12 ? "ظهراً" : hours > 12 && hours <= 18 ? "عصراً" : "مساءً";

    // نوع المغادرة
    const type = (event.author == leftID) ? "غادر المجموعة" : "تم طرده من قبل المسؤول";

    // إنشاء رسالة مزخرفة حسب الحالة
    let msg = "";
    if (event.author == leftID) {
      msg = `◈ ───『 وداع لطيف 』─── ◈
◯ ${name} 👋
◯ ${type}
⏰ ${time} | ${session}
◈ ─────────────── ◈`;
    } else {
      msg = `◈ ───『 تم الطرد 』─── ◈
◯ ${name} 🚪
◯ ${type}
⏰ ${time} | ${session}
◈ ─────────────── ◈`;
    }

    // جلب GIF عشوائي إذا موجود
    const gifPath = pathModule.join(__dirname, "cache", "leaveGif", "randomgif");
    let attachment = null;
    if (fs.existsSync(gifPath)) {
      const files = fs.readdirSync(gifPath);
      if (files.length > 0) {
        const randomGif = pathModule.join(gifPath, files[Math.floor(Math.random() * files.length)]);
        attachment = fs.createReadStream(randomGif);
      }
    }

    // إرسال الرسالة
    await api.sendMessage({ body: msg, attachment }, threadID);

  } catch (err) {
    console.log("LeaveNoti Error:", err.message);
  }
};
