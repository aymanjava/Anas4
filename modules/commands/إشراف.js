async function changeAdminStatus(event, api) {
  const input = event.body.toLowerCase().split(' ');

  if (input.length > 1 && input[1] === '-مساعدة') {
    const usage = 'كيفية الإستخدام: إشراف -آدمن [المستخدم1] [المستخدم2] ...  -أو -  إشراف -إزالة_مشرف [المستخدم1] [المستخدم2] ...\n\n' +
      'الوصف : ترقية المستخدمين أو إزالتهم كمسؤولين في المجموعة\n\n' +
      'مثال : إشراف -مشرف @مستخدم1 @مستخدم2\n' +
      'مثال (إزالة): إشراف -إزالة_مشرف @مستخدم1 @مستخدم2\n\n' +
      'ملاحظة ⚠️: يجب عمل منشن المستخدمين باستخدام "@منشن".';
    api.sendMessage(usage, event.threadID);
    return;
  }

  const mentions = event.mentions;
  const mentionedUserIDs = Object.keys(mentions);
  const command = input[1];

  if (mentionedUserIDs.length === 0) {
    api.sendMessage(' ⚠️ |تنسيق الأمر غير صالح. يجب عمل منشن لمستخدم واحد على الأقل.', event.threadID);
    return;
  }

  let adminStatus = true;
  if (command === '-إزالة_مسؤول') {
    adminStatus = false;
  } else if (command !== '-إضافة_مسؤول') {
    api.sendMessage(' ⚠️ | إستخدام غير صالح . إستخدم "إشراف -إضافة_مسؤول [مستخدم1] [مستخدم2] ..." لكي تقود لدعوته ك آدمن "إشراف -إزالة_مسؤول [مستخدم1] [مستخدم2] ..." من أجل إزالة منصب المسؤول للعضو.', event.threadID);
    return;
  }

  const userNames = [];
  for (const userID of mentionedUserIDs) {
    try {
      const userInfo = await api.getUserInfo(userID);
      userNames.push(userInfo[userID].name || 'Unknown User');
    } catch (err) {
      console.error('Error fetching user info:', err);
      userNames.push('Unknown User');
    }
  }

  api.changeAdminStatus(event.threadID, mentionedUserIDs, adminStatus, (err) => {
    if (err) {
      console.error('Error changing admin status:', err);
      api.sendMessage(' ❌ |فشل تحديث حالة المسؤول. الرجاء معاودة المحاولة في وقت لاحق.', event.threadID);
      return;
    }

    const action = adminStatus ?
      'تم دعوته كآدمن' : 'تمت إزالة منصب المسؤول منه';
    const reaction = adminStatus ?
     'بنجاح ❌' : 'بنجاح ✅' ;
    const userList = userNames.join(', ');

    api.sendMessage(`المستخدم ${action} ${reaction} : ${userList}`, event.threadID);
  });
}

module.exports = changeAdminStatus;
