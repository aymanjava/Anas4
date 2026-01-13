const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "الرانك",
  version: "2.5.0",
  hasPermssion: 1,
  credits: "Ayman",
  description: "نظام إشعارات ارتقاء المستوى الملكي مع مكافآت الخزينة",
  commandCategory: "مسؤولي المجموعات",
  dependencies: {
    "fs-extra": ""
  },
  cooldowns: 5,
  envConfig: {
    autoUnsend: true,
    unsendMessageAfter: 10 // الحذف بعد 10 ثواني لتقليل الضجيج
  }
};

module.exports.handleEvent = async function({ api, event, Currencies, Users, Threads }) {
  const { threadID, senderID } = event;
  const tid = String(threadID);
  const uid = String(senderID);

  const threadData = global.data.threadData.get(tid) || {};
  if (threadData["rankup"] !== true) return;

  // جلب الخبرة وزيادتها
  let data = await Currencies.getData(uid);
  let exp = data.exp || 0;
  exp = exp + 1;

  // حساب المستوى الحالي والمستوى القادم
  const curLevel = Math.floor((Math.sqrt(1 + (4 * (exp - 1) / 3)) + 1) / 2);
  const level = Math.floor((Math.sqrt(1 + (4 * exp / 3)) + 1) / 2);

  if (level > curLevel && level > 1) {
    const name = global.data.userName.get(uid) || await Users.getNameUser(uid);
    const reward = level * 100; // مكافأة مالية (المستوى × 100)
    
    // إضافة المكافأة للخزينة
    await Currencies.increaseMoney(uid, reward);

    let messsage = `◈ ───『 ارتقاء مـلـكـي 』─── ◈\n\n` +
                   `🎊 تهانينا: ${name}\n` +
                   `📈 لقد ارتفع مستواك إلى: 『 ${level} 』\n` +
                   `💰 مكافأة الخزينة: +${reward}$\n\n` +
                   ` ———————————————\n` +
                   `│←› بـإدارة الـتـوب ايـمـن 👑\n` +
                   `◈ ──────────────── ◈`;

    const gifDir = path.resolve(__dirname, "rankup");
    const gifPath = path.resolve(gifDir, "rankup.gif");

    let arrayContent = { body: messsage, mentions: [{ tag: name, id: uid }] };
    
    if (fs.existsSync(gifPath)) {
      arrayContent.attachment = fs.createReadStream(gifPath);
    }

    const moduleName = this.config.name;
    api.sendMessage(arrayContent, tid, async function (error, info){
      if (global.configModule[moduleName].autoUnsend && info) {
        setTimeout(() => api.unsendMessage(info.messageID), global.configModule[moduleName].unsendMessageAfter * 1000);
      }
    });
  }

  await Currencies.setData(uid, { exp });
}

module.exports.run = async function({ api, event, Threads }) {
  const { threadID, messageID, senderID } = event;
  const isTop = global.config.ADMINBOT.includes(senderID);
  
  // لا يمكن لغير المسؤولين أو التوب التحكم بالنظام
  if (!isTop && event.senderID != threadID) {
     // التحقق من صلاحية المسؤولين في المجموعات (اختياري)
  }

  let data = (await Threads.getData(threadID)).data || {};

  if (data["rankup"] === true) {
    data["rankup"] = false;
  } else {
    data["rankup"] = true;
  }

  await Threads.setData(threadID, { data });
  global.data.threadData.set(threadID, data);

  let statusMsg = data["rankup"] ? "✅ تـم تـفـعـيـل إشعارات المستوى" : "❌ تـم إيقـاف إشعارات المستوى";
  
  return api.sendMessage(`◈ ───『 نـظـام الـرتب 』─── ◈\n\n${statusMsg} في هذه المجموعة سيدي.\n\n◈ ──────────────── ◈`, threadID, messageID);
}
