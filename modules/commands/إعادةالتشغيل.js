const path = require('path');
const fs = require('fs');

const configFilePath = path.join(__dirname, '..', 'json', 'config.json');

function loadConfig() {
  try {
    const data = fs.readFileSync(configFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return { admins: [], vips: [] };
  }
}

async function restart(event, api) {
  const config = loadConfig();
  const admins = config.admins;
  const senderID = event.senderID;

  if (!admins.includes(senderID)) {
    api.sendMessage('⛔️ | تم الرفض. أنت غير مسموح لك بإستخدام هذا الأمر.', event.threadID);
    return;
  }

  api.sendMessage('⚙️ | يتم الآن إعادة التشغيل...', event.threadID);
  setTimeout(() => {
    api.sendMessage('✅ |اكتملت عملية إعادة تشغيل البوت. عاد البوت ليصبح متصلا.', event.threadID);
    setTimeout(() => {
      process.exit(0);
    }, 1000);
  }, 4000);
}

module.exports = restart;
