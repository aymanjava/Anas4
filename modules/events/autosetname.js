module.exports.config = {
  name: "autosetname",
  eventType: ["log:subscribe"],
  version: "1.1.0",
  credits: "Ayman",
  description: "تغيير لقب الأعضاء الجدد تلقائياً إلى 𖣂 الاسم 𖣂"
};

module.exports.run = async function({ api, event, Users }) {
  const { threadID, logMessageData } = event;
  const moment = require("moment-timezone");

  // ضبط الوقت والتاريخ
  const gio = moment.tz("Asia/Baghdad").format("HH:mm:ss");
  const dayEn = moment.tz('Asia/Baghdad').format('dddd');
  const days = {
    'Sunday': 'الأحد', 'Monday': 'الاثنين', 'Tuesday': 'الثلاثاء',
    'Wednesday': 'الأربعاء', 'Thursday': 'الخميس', 'Friday': 'الجمعة', 'Saturday': 'السبت'
  };
  const thu = days[dayEn] || dayEn;

  // جلب قائمة الأعضاء الجدد
  const memJoin = logMessageData.addedParticipants;

  for (let user of memJoin) {
    const idUser = user.userFbId;
    const nameUser = user.fullName;

    // تأخير بسيط لتجنب حظر الفيسبوك
    await new Promise(resolve => setTimeout(resolve, 1500));

    // تغيير اللقب بالزخرفة المطلوبة
    api.changeNickname(`𖣂 ${nameUser} 𖣂`, threadID, idUser, (err) => {
      if (err) console.log(`⚠️ خطأ في تغيير اللقب لـ ${idUser}`);
    });
  }

  // رسالة التأكيد المزخرفة
  const msg = `◈ ───『 تلقـيـب الأعضاء 』─── ◈\n\n` +
              `✅ تم تلقـيـب ${memJoin.length} عضو بنجاح\n` +
              `✨ النمط: [ 𖣂 الاسم 𖣂 ]\n` +
              `———————————————\n` +
              `⏰ [ ${thu} || ${gio} ]\n` +
              `◈ ─────────────── ◈`;

  return api.sendMessage(msg, threadID);
};
