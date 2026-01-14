const fs = require("fs-extra");
const path = require("path");
const moment = require("moment-timezone");

module.exports.config = {
  name: "leaveNoti",
  eventType: ["log:unsubscribe"],
  version: "1.2.0",
  credits: "Ayman",
  description: "إشعار مغادرة مزخرف مع دعم GIF"
};

// التأكد من وجود مجلد الـ GIF عند تحميل البوت
module.exports.onLoad = function () {
  const cachePath = path.join(__dirname, "cache", "leaveGif", "randomgif");
  if (!fs.existsSync(cachePath)) fs.mkdirSync(cachePath, { recursive: true });
};

module.exports.run = async function () {
  // فارغ لأن الحدث يعتمد على handleEvent
};

module.exports.handleEvent = async function ({ api, event, Users, Threads }) {
  try {
    const { threadID, logMessageData, author } = event;
    const leftID = logMessageData.leftParticipantFbId;

    // تجاهل إذا البوت هو الذي خرج
    if (leftID == api.getCurrentUserID()) return;

    // جلب اسم المستخدم
    const name = global.data.userName.get(leftID) || await Users.getNameUser(leftID);

    // جلب بيانات الكروب
    const threadData = global.data.threadData.get(threadID) || (await Threads.getData(threadID)).data;

    // الوقت بصيغة جميلة
    const time = moment.tz("Asia/Baghdad").format("DD/MM/YYYY || HH:mm:ss");
    const hours = parseInt(moment.tz("Asia/Baghdad").format("HH"));
    const session = hours < 12 ? "صباحاً" : hours < 16 ? "ظهراً" : hours < 19 ? "عصراً" : "مساءً";

    // تحديد نوع المغادرة
    const type = (author == leftID) ? "غادر المجموعة" : "تم طرده من قبل المسؤول";

    // إنشاء رسالة مزخرفة
    const msg = `◈ ───『 وداع لطيف 』─── ◈
◯ الاسم: ${name} 👋
◯ الحالة: ${type}
⏰ الوقت: ${time} | ${session}
◈ ─────────────── ◈`;

    // جلب GIF عشوائي إن وجد
    let attachment = null;
    const gifDir = path.join(__dirname, "cache", "leaveGif", "randomgif");
    if (fs.existsSync(gifDir)) {
      const files = fs.readdirSync(gifDir).filter(f => f.endsWith(".gif"));
      if (files.length > 0) {
        const randomGif = path.join(gifDir, files[Math.floor(Math.random() * files.length)]);
        attachment = fs.createReadStream(randomGif);
      }
    }

    // إرسال الرسالة مع GIF إذا وجد
    api.sendMessage({ body: msg, attachment }, threadID);

  } catch (err) {
    console.log("LeaveNoti Error:", err.message);
  }
};
