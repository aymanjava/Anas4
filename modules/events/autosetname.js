module.exports.config = {
  name: "autosetname",
  eventType: ["log:subscribe"],
  version: "1.0.5",
  credits: "D-Jukie",
  description: "تغيير لقب الأعضاء الجدد تلقائياً إلى 𖣂 الاسم 𖣂"
};

module.exports.run = async function({ api, event, Users }) {
  const { threadID, logMessageData } = event;
  const moment = require("moment-timezone");
  
  // إعدادات الوقت
  var gio = moment.tz("Asia/Baghdad").format("HH:mm:ss");
  var thu = moment.tz('Asia/Baghdad').format('dddd');
  const days = {
    'Sunday': 'الأحد', 'Monday': 'الاثنين', 'Tuesday': 'الثلاثاء',
    'Wednesday': 'الأربعاء', 'Thursday': 'الخميس', 'Friday': 'الجمعة', 'Saturday': 'السبت'
  };
  thu = days[thu] || thu;

  // جلب قائمة الأعضاء المنضمين
  var memJoin = logMessageData.addedParticipants;

  for (let user of memJoin) {
    const idUser = user.userFbId;
    const nameUser = user.fullName;

    // تأخير بسيط لتجنب حظر الفيس بوك
    await new Promise(resolve => setTimeout(resolve, 1500));

    // تنفيذ تغيير اللقب بالزخرفة المطلوبة
    api.changeNickname(`𖣂 ${nameUser} 𖣂`, threadID, idUser, (err) => {
      if (err) console.log("خطأ في تغيير اللقب لـ " + idUser);
    });
  }

  // رسالة التأكيد المزخرفة
  const msg = "╭─────────────╮\n" +
              "    💎 تـم تـلقـيـب الـعـضـو بـنـجـاح\n" +
              "    ✨ الـنـمـط: [ 𖣂 الاسـم 𖣂 ]\n" +
              "╰─────────────╯\n" +
              `⏰ [ ${thu} || ${gio} ]`;

  return api.sendMessage(msg, threadID);
}
