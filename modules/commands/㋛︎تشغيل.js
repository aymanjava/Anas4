const fs = require('fs-extra');
const path = require('path');

module.exports.config = {
    name: "تشغيل",
    version: "2.0.0",
    hasPermssion: 2,
    credits: "Ayman",
    description: "إلغاء وضع الصمت وإعادة البوت للخدمة العامة",
    commandCategory: "نظام",
    usages: " ",
    cooldowns: 3,
    usePrefix: false
};

module.exports.run = async function({ api, event }) {
    const { threadID, messageID, senderID } = event;
    const EMPEROR_ID = "61577861540407"; // أيدي السيادة
    const { ADMINBOT, NDH } = global.config;
    
    // 🛡️ التحقق من صلاحيات (الإمبراطور أو الأدمن)
    if (senderID !== EMPEROR_ID && !ADMINBOT.includes(senderID) && !NDH.includes(senderID)) {
        return api.sendMessage("◈ ───『 تـنـبـيـه مـلـكـي 』─── ◈\n\n◯ هـذا الأمـر يـخـص الإمـبـراطـور وأركـان حـربـه فـقـط.\n———————————————\n◈ ─────────────── ◈", threadID, messageID);
    }
    
    const statusPath = path.join(__dirname, 'cache', 'bot_status.json');
    
    // 🟢 إعادة الحالة لنشط (Active)
    const botStatus = { status: "active", lastUpdate: Date.now() };
    fs.writeJsonSync(statusPath, botStatus);
    
    let msg = `◈ ───『 عـودة الـنظـام 🟢 』─── ◈\n\n` +
              `◯ تـم إلـغاء وضـع الـصمـت بـنـجـاح.\n` +
              `◉ الـحالـة: الـبـوت يـسـتجـيب لـلـجـمـيـع الآن ✅\n` +
              `———————————————\n` +
              `│←› بـأوامـر: الإمـبـراطـور أيـمـن 👑\n` +
              `◈ ──────────────── ◈`;

    return api.sendMessage(msg, threadID, messageID);
};
