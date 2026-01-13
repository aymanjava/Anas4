const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "قولي",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "تحويل النص إلى صوت (هبة) مع مكافأة تقشفية",
  commandCategory: "خدمات",
  usages: "[النص]",
  cooldowns: 5,
  dependencies: {
    "path": "",
    "fs-extra": ""
  }
};

module.exports.run = async function({ api, event, args, Currencies }) {
  const { threadID, messageID, senderID } = event;
  const reward = 5; // مكافأة التقشف (نقاط قليلة)

  try {
    let content = (event.type == "message_reply") ? event.messageReply.body : args.join(" ");
    
    if (!content) {
      return api.sendMessage(`◈ ───『 تـنـبـيـه 』─── ◈\n\n⚠️ سيدي، يرجى كتابة النص أو الرد على رسالة لكي أنطقها.\n\n◈ ──────────────── ◈`, threadID, messageID);
    }

    const downloadPath = path.resolve(__dirname, 'cache', `${threadID}_${senderID}.mp3`);
    
    // استخدام محرك جوجل للنطق باللغة العربية
    await global.utils.downloadFile(`https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(content)}&tl=ar&client=tw-ob`, downloadPath);

    // منح مكافأة التقشف
    await Currencies.increaseMoney(senderID, reward);

    let msg = `◈ ───『 صـوت الإمـبـراطـوريـة 』─── ◈\n\n` +
              `🎤 تـم تـحـويـل الـنـص إلـى صـوت هـبـة.\n` +
              `💰 مـنـحة الـتـقـشـف: +${reward}$\n` +
              ` ———————————————\n` +
              `│←› بـأمر مـن: الـتـوب ايـمـن 👑\n` +
              `◈ ──────────────── ◈`;

    return api.sendMessage({ 
      body: msg, 
      attachment: fs.createReadStream(downloadPath)
    }, threadID, () => fs.unlinkSync(downloadPath), messageID);

  } catch (e) { 
    return api.sendMessage("⚠️ حدث خطأ في حنجرة البوت، حاول مجدداً سيدي.", threadID, messageID);
  }
}
