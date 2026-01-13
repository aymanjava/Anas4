const axios = require('axios');

module.exports.config = {
  name: "رابط",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "تحويل الصور إلى روابط Imgur مع منحة تقشفية",
  usePrefix: false,
  commandCategory: "خدمات",
  usages: "[رد على صورة]",
  cooldowns: 5,
};

module.exports.run = async ({ api, event, Currencies }) => {
  const { threadID, messageID, senderID, messageReply, attachments } = event;
  const reward = 2; // قمة التقشف (دولاران فقط سيدي)
  let links = [];

  // جلب الروابط من الرد أو الرسالة المباشرة
  if (messageReply && messageReply.attachments.length > 0) {
    for (const attachment of messageReply.attachments) links.push(attachment.url);
  } else if (attachments.length > 0) {
    for (const attachment of attachments) links.push(attachment.url);
  } else {
    return api.sendMessage('◈ ───『 تـنـبـيـه 』─── ◈\n\n⚠️ سيدي، قم بالرد على الصور المراد تحويلها لروابط.\n\n◈ ──────────────── ◈', threadID, messageID);
  }

  api.sendMessage(`◈ ───『 الـمـحـول الـرقمـي 』─── ◈\n\n⚙️ جاري رفع الصور إلى الأرشيف الملكي..\n\n◈ ──────────────── ◈`, threadID);

  try {
    const shortenedLinks = [];
    for (const link of links) {
      // استخدام رابط رفع Imgur مستقر
      const res = await axios.get(`https://api.vyturex.com/imgur?url=${encodeURIComponent(link)}`);
      shortenedLinks.push(res.data.image);
    }

    // منح مكافأة التقشف
    await Currencies.increaseMoney(senderID, reward);

    const formattedLinks = shortenedLinks.map(link => `"${link}",`).join('\n');
    
    let msg = `◈ ───『 روابـط الأرشـيـف 』─── ◈\n\n` +
              `✅ تم الرفع بنجاح سيدي:\n\n${formattedLinks}\n\n` +
              `💰 مـنـحـة الـتقـشـف: +${reward}$\n` +
              ` ———————————————\n` +
              `│←› الـمـطـور: الـتـوب ايـمـن 👑\n` +
              `◈ ──────────────── ◈`;

    return api.sendMessage(msg, threadID, messageID);

  } catch (err) {
    return api.sendMessage(`⚠️ عذراً سيدي، حدث خطأ في خوادم الرفع حالياً.`, threadID, messageID);
  }
};
