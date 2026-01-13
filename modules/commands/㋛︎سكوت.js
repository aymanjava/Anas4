module.exports.config = {
  name: "سكوت",
  version: "2.0.0",
  hasPermssion: 1,
  credits: "DRIDI-RAYEN",
  description: "نظام التحذير والطرد لمن يتكلم في وضع السكوت",
  usePrefix: true,
  commandCategory: "〘 ادمن المجموعات 〙",
  usages: "سكوت تشغيل/ايقاف",
  cooldowns: 5
};

// مخزن مؤقت للتحذيرات
if (!global.moduleData) global.moduleData = new Map();
if (!global.moduleData.has("silentMode")) global.moduleData.set("silentMode", new Map());
const warnings = global.moduleData.get("silentMode");

// قائمة المجموعات المفعل فيها السكوت
if (!global.config.silentThreads) global.config.silentThreads = [];

module.exports.handleEvent = async ({ api, event, Users }) => {
  const { threadID, senderID, type } = event;
  const adminBot = global.config.ADMINBOT;

  // التحقق إذا كان الوضع مفعل في هذه المجموعة
  if (!global.config.silentThreads.includes(threadID)) return;

  // استثناء البوت، المطورين، والمسؤولين
  let threadInfo = await api.getThreadInfo(threadID);
  if (senderID == api.getCurrentUserID() || 
      adminBot.includes(senderID) || 
      threadInfo.adminIDs.some(admin => admin.id == senderID)) return;

  if (type === "message") {
    let name = await Users.getNameUser(senderID);
    
    // إدارة نظام التحذيرات
    if (!warnings.has(threadID + senderID)) {
      warnings.set(threadID + senderID, 1);
      return api.sendMessage(`╭─────────────╮\n    ⚠️ تـحـذيـر (1/3)\n    ✨ يـا [ ${name} ] الـسكوت مـفـعـل\n╰─────────────╯`, threadID);
    } 
    else if (warnings.get(threadID + senderID) == 1) {
      warnings.set(threadID + senderID, 2);
      return api.sendMessage(`╭─────────────╮\n    ⚠️ تـحـذيـر (2/3)\n    ✨ [ ${name} ] آخـر تـنـبـيـه لـك\n╰─────────────╯`, threadID);
    } 
    else {
      // التحذير الثالث = طرد
      api.removeUserFromGroup(senderID, threadID);
      warnings.delete(threadID + senderID); // تصغير العداد بعد الطرد
      return api.sendMessage(`╭─────────────╮\n    🚪 طــــــــرد\n    ✨ تـم طـرد [ ${name} ] لـعدم الالتزام\n╰─────────────╯`, threadID);
    }
  }
};

module.exports.run = async function ({ api, args, event }) {
  const { threadID, messageID } = event;

  if (args[0] == "تشغيل") {
    if (global.config.silentThreads.includes(threadID)) return api.sendMessage("✨ وضع السكوت مفعل بالفعل في هذه المجموعة", threadID);
    global.config.silentThreads.push(threadID);
    return api.sendMessage(
      "╭─────────────╮\n    💎 تـم تـشـغـيـل وضـع الـسـكـوت\n    ✨ الـتـحذير 3 = طـرد مـباشـر\n╰─────────────╯",
      threadID,
      messageID
    );
  } 
  else if (args[0] == "ايقاف") {
    const index = global.config.silentThreads.indexOf(threadID);
    if (index > -1) {
      global.config.silentThreads.splice(index, 1);
      // مسح تحذيرات الجميع في المجموعة عند الإيقاف
      return api.sendMessage(
        "╭─────────────╮\n    💎 تـم إيقـاف وضـع الـسـكـوت\n    ✨ تـكـلـمـوا بـراحـتـكـم الآن\n╰─────────────╯",
        threadID,
        messageID
      );
    } else {
      return api.sendMessage("✨ وضع السكوت غير مفعل في هذه المجموعة أصلاً", threadID);
    }
  } 
  else {
    return api.sendMessage(`✨ اسـتخدم: ${global.config.PREFIX}سكوت تشغيل/ايقاف`, threadID, messageID);
  }
};
