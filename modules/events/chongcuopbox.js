module.exports.config = {
  name: "guard",
  eventType: ["log:thread-admins"],
  version: "2.2.0",
  credits: "Ayman",
  description: "نظام الحماية الملكي - يمنع تغيير المسؤولين ويحافظ على السلطة",
};

module.exports.run = async function ({ event, api, Threads }) {
  const { logMessageType, logMessageData, author, threadID } = event;
  const botID = api.getCurrentUserID();

  // جلب بيانات الكروب للتحقق من تفعيل الحماية
  const threadData = (await Threads.getData(threadID)).data || {};
  if (!threadData.guard) return;

  // الحصانة الملكية: تجاهل الفاعل إذا هو التوب أو البوت
  const isTopAdmin = global.config.ADMINBOT.includes(author);
  if (isTopAdmin || author == botID) return;

  if (logMessageType === "log:thread-admins") {
    const targetID = logMessageData.TARGET_ID;

    // محاولة إضافة مسؤول جديد
    if (logMessageData.ADMIN_EVENT === "add_admin") {
      try {
        await api.changeAdminStatus(threadID, author, false);
        await api.changeAdminStatus(threadID, targetID, false);

        const msg = 
`◈ ───『 تـدخل الـحـارس 』─── ◈
⚠️ تم كشف محاولة تعيين مسؤول جديد!
🚫 تم سحب رتبة الفاعل والمستهدف.
🛡️ الحالة: تم إحباط التغيير بنجاح.
◈ ─────────────── ◈`;
        return api.sendMessage(msg, threadID);

      } catch (err) {
        console.log("Guard Add Admin Error:", err.message);
      }
    }

    // محاولة إزالة مسؤول
    else if (logMessageData.ADMIN_EVENT === "remove_admin") {
      try {
        await api.changeAdminStatus(threadID, author, false);
        await api.changeAdminStatus(threadID, targetID, true);

        const msg = 
`◈ ───『 تـدخل الـحـارس 』─── ◈
🚨 محاولة عزل مسؤول بدون تفويض!
⚔️ تم سحب رتبة الفاعل وإعادة الحق لأصحابه.
◈ ─────────────── ◈`;
        return api.sendMessage(msg, threadID);

      } catch (err) {
        console.log("Guard Remove Admin Error:", err.message);
      }
    }
  }
};
