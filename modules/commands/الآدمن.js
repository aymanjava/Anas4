const fs = require('fs');
const path = require('path');

function readConfig() {
  const configPath = path.join(__dirname, '..', 'json', 'config.json');
  try {
    return JSON.parse(fs.readFileSync(configPath));
  } catch (error) {
    console.error('Error reading config:', error);
    return null;
  }
}

function isadmins(userId) {
  const config = readConfig();
  if (config !== null && config.hasOwnProperty('admins')) {
    const adminsList = config.admins || [];
    return adminsList.includes(userId);
  }
  return false;
}

function adminsCommand(event, api) {
  if (event.body.includes('-مساعدة')) {
    const usage = "كيفية الإستخدام: الآدمن [-إضافة/-إزالة] [آيدي المستخدم]\n\n" +
      "الوصف:\n" +
      "  - الآدمن -إضافة: قم بإضافة العضو إلى قائمة المشرفين.\n" +
      "  - الآدمن -إزالة: قم بإزالة العضو من قائمة المشرفين.\n\n" +
      "ملاحظة ⚠️: فقط الآدمن يمكنهم إستخدام هذا الأمر.";
    api.sendMessage(usage, event.threadID);
    return Promise.resolve();
  }

  const command = event.body.split(' ')[1];

  if (command === '-إضافة' || command === '-إزالة') {
    if (!isadmins(event.senderID)) {
      api.sendMessage(" ⚠️ | ليست لديك الصلاحية لإستخدام هذا الأمر.", event.threadID);
      return Promise.resolve();
    }

    if (command === '-إضافة') {
      return addadmins(event, api);
    } else if (command === '-إزالة') {
      return remadmins(event, api);
    }
  } else {
    const config = readConfig();
    if (config !== null && config.hasOwnProperty('admins')) {
      const adminsList = config.admins.map(userId => `├─⦿ ${userId}`).join('\n');
      const totaladmins = config.admins.length;
      const message = `
┌────[ قائمة المشرفبن ]────⦿
│
${adminsList}
│
└────[ إجمالي عدد المشرفين : ${totaladmins} ]────⦿
`;
      api.sendMessage(message, event.threadID);
    } else {
      api.sendMessage(" ❌ |حدث خطأ أثناء قراءة قائمة المستخدمين المسؤولين.", event.threadID);
    }
    return Promise.resolve();
  }
}

function addadmins(event, api) {
  return new Promise((resolve, reject) => {
    const { threadID, messageReply } = event;
    if (!messageReply) return resolve();

    const configPath = path.join(__dirname, '..', 'json', 'config.json');
    const config = readConfig();
    const adminsList = config.admins || [];

    const userId = messageReply.senderID;

    api.getUserInfo(parseInt(userId), (error, data) => {
      if (error) {
        console.error(error);
        return reject(error);
      }
      const name = data[userId].name;
      if (adminsList.includes(userId)) {
        api.sendMessage(` ⚠️ | ${name} هو بالفعل مشرف .`, threadID);
        resolve();
      } else {
        adminsList.push(userId);
        config.admins = adminsList;
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2), "utf8");
        api.sendMessage(` ✅ | لقد تمت إضافة ${name} في قائمة المشرفين بنجاح .`, threadID);
        resolve();
      }
    });
  });
}

function remadmins(event, api) {
  return new Promise((resolve, reject) => {
    const { threadID, messageReply } = event;
    if (!messageReply) return resolve();

    const configPath = path.join(__dirname, '..', 'json', 'config.json');
    const config = readConfig();
    const adminsList = config.admins || [];

    const userId = messageReply.senderID;

    api.getUserInfo(parseInt(userId), (error, data) => {
      if (error) {
        console.error(error);
        return reject(error);
      }

      const name = data[userId].name;

      if (adminsList.includes(userId)) {
        const removeIndex = adminsList.indexOf(userId);
        adminsList.splice(removeIndex, 1);
        config.admins = adminsList;
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2), "utf8");
        api.sendMessage(` ⚠️ | ${name} هو لم يعد آدمن بعد اليوم .`, threadID);
        resolve();
      } else {
        api.sendMessage(` ⚠️ | لم يتم العثور على ${name} في قائمة المشرفين .`, threadID);
        resolve();
      }
    });
  });
}

module.exports = adminsCommand;
