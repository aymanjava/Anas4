module.exports.config = {
  name: "guard",
  eventType: ["log:thread-admins"],
  version: "2.1.0",
  credits: "Ayman",
  description: "نظام الحماية الملكي - يمنع تغيير المسؤولين ويحافظ على السلطة",
};

module.exports.run = async function ({ event, api, Threads }) {
  const { logMessageType, logMessageData, author, threadID } = event;
  const botID = api.getCurrentUserID();

  // جلب بيانات الكروب والتحقق من تفعيل الحماية
  const threadData = (await Threads.getData(threadID)).data || {};
  if (!threadData.guard) return;

  // الحصانة الملكية: تجاهل الفاعل إذا هو التوب أو البوت نفسه
  const isTopAdmin = global.config.ADMINBOT.includes(author);
  if (isTopAdmin || author == botID) return;

  // التعامل مع تغيير المسؤولين
  if (logMessageType === "log:thread-admins") {
    const targetID = logMessageData.TARGET_ID;

    // محاولة إضافة مسؤول جديد
    if (logMessageData.ADMIN_EVENT === "add_admin") {
      try {
        // سحب رتبة الفاعل والشخص المضاف
        await api.changeAdminStatus(threadID, author, false);
        await api.changeAdminStatus(threadID, targetID, false);

        const msg = 
`◈ ───『 تـدخل الـحـارس الـمـلكي 』─── ◈
⚠️ كـشف مـحاولة تـعيـين مـسؤول جـديد!
🚫 تـم عـزل الـفـاعـل وسـحب الـرتبة مـن الـطرفـين.
🛡️ الـحـالـة: تم إحباط الإنقلاب بنجاح.

│←› بـأوامـر مـن: الـتـوب ايـمـن 👑
◈ ──────────────── ◈`;
        return api.sendMessage(msg, threadID);

      } catch (err) {
        console.log("Guard Add Admin Error:", err.message);
      }
    }

    // محاولة إزالة مسؤول
    else if (logMessageData.ADMIN_EVENT === "remove_admin") {
      try {
        // سحب رتبة الفاعل
        await api.changeAdminStatus(threadID, author, false);
        // إعادة رتبة الشخص الذي تم عزله
        await api.changeAdminStatus(threadID, targetID, true);

        const msg = 
`◈ ───『 تـدخل الـحارس الـمـلكي 』─── ◈
🚨 تـنـبيـه: محاولة عـزل مـسؤول بـدون تفويض!
⚔️ تم طـرد الـخـائن مـن الإدارة وإعادة الحق لأصحابه.

│←› القرار للإمبراطـور: الـتـوب ايـمـن 👑
◈ ──────────────── ◈`;
        return api.sendMessage(msg, threadID);

      } catch (err) {
        console.log("Guard Remove Admin Error:", err.message);
      }
    }
  }
};
