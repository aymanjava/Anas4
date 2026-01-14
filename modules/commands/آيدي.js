async function uid(event, api) {
  const input = event.body.toLowerCase();

  if (input.includes('-مساعدة')) {
    const usage = "كيفية الإستخدام: آيدي\n\n" +
      "الوصف : يقوم الأمر بجلب آيدي أو معرف الشخص اللذي تتم عمل منشن له أو من إستخدم الأمر .\n\n" +
      "مثال: آيدي\nمثال مع منشن: uid @إسم_المستخدم\n\n" +
      "ملاحظة ⚠️: إذا لم يتم عمل منشن للشخص اللذي تود معرفة الآيدي الخاصة به فسيجلب الآيدي الخصة بك أنت.";
    api.sendMessage(usage, event.threadID, event.messageID);
    return;
  }

  let targetUserID = event.type === "message" ? Object.keys(event.mentions).length !== 0 ? Object.keys(event.mentions)[0] : event.senderID : event.messageReply.senderID;

  try {
    const targetUserInfo = await api.getUserInfo(targetUserID);
    const targetUserName = targetUserInfo[targetUserID].name || targetUserInfo[targetUserID].firstName || "Unknown User";
    const targetUserIDString = targetUserID || "Unknown UID";

    await api.sendMessage({
      body: ` المستخدم: ${targetUserName}\n الآيدي: ${targetUserIDString}`,
      mentions: [{ tag: targetUserName, id: targetUserID }]
    }, event.threadID, event.messageID);
  } catch (err) {
    console.error(err);
    await api.sendMessage("⚠️  |فشلت عملية الحصول على الآيدي.", event.threadID, event.messageID);
  }
}

module.exports = uid;
