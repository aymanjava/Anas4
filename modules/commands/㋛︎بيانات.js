const fs = require("fs-extra");
const pidusage = require("pidusage");

module.exports.config = {
  name: "بيانات",
  version: "2.5.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "لوحة تحكم المدير العام والإحصائيات المركزية",
  commandCategory: "خدمات",
  cooldowns: 5
};

function byte2mb(bytes) {
  const units = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  let l = 0, n = parseInt(bytes, 10) || 0;
  while (n >= 1024 && ++l) n = n / 1024;
  return `${n.toFixed(2)} ${units[l]}`;
}

module.exports.run = async ({ api, event, Currencies }) => {
  const { threadID, messageID, senderID } = event;
  const isTop = global.config.ADMINBOT.includes(senderID);

  // حساب وقت التشغيل
  const uptime = process.uptime();
  const hours = Math.floor(uptime / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = Math.floor(uptime % 60);

  // جلب بيانات النظام
  const stats = await pidusage(process.pid);
  const timeStart = Date.now();

  // حساب إجمالي الأموال في الخزينة المركزية (إمبراطورية التوب)
  const allData = await Currencies.getAll();
  let totalWealth = 0;
  allData.forEach(user => { if(user.money) totalWealth += user.money; });

  const msg = `◈ ───『 لـوحـة تـحـكـم الـتـوب 』─── ◈\n\n` +
    `👑 الـمـديـر الـعـام: ايـمـن\n` +
    `⏱️ وقـت الـتـشـغـيل: ${hours}س ${minutes}د ${seconds}ث\n\n` +
    `📊 ── إحصائيات الإمبراطورية ──\n` +
    `👥 عـدد الـمـواطـنـين: ${global.data.allUserID.length}\n` +
    `Groups الـمـجـموعـات: ${global.data.allThreadID.length}\n` +
    `💰 إجمالي ثـروة الـخـزيـنـة: ${totalWealth.toLocaleString()}$\n\n` +
    `💻 ── أداء الـنـظـام ──\n` +
    `⚙️ الـمـعـالـج: ${stats.cpu.toFixed(1)}%\n` +
    `🧠 الـرام: ${byte2mb(stats.memory)}\n` +
    `📡 الـبـيـنـج: ${Date.now() - timeStart}ms\n\n` +
    `◈ ───『 ${isTop ? "أهلاً بك سيدي التوب" : "هبة بـوت"} 』─── ◈`;

  return api.sendMessage(msg, threadID, messageID);
};
