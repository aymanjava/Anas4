const axios = require('axios');

module.exports.config = {
  name: "رابط",
  version: "3.0.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "تحويل الوسائط إلى روابط Imgur دائمة مع منحة تقشفية",
  usePrefix: false,
  commandCategory: "خدمات",
  usages: "[رد على صورة/فيديو]",
  cooldowns: 5,
};

module.exports.run = async ({ api, event, Currencies }) => {
  const { threadID, messageID, senderID, messageReply, attachments } = event;
  const reward = 2; // نظام التقشف الصارم

  let mediaLinks = [];

  // تحصيل الروابط من الرد أو المرفقات المباشرة بدقة عالية
  if (messageReply && messageReply.attachments && messageReply.attachments.length > 0) {
    mediaLinks = messageReply.attachments.map(item => item.url);
  } else if (attachments && attachments.length > 0) {
    mediaLinks = attachments.map(item => item.url);
  }

  if (mediaLinks.length === 0) {
    return api.sendMessage('◈ ───『 تـنـبـيـه 』─── ◈\n\n⚠️ سيدي، أين المادة المطلوب رفعها؟ قم بالرد على صور أو فيديوهات.\n\n◈ ──────────────── ◈', threadID, messageID);
  }

  api.sendMessage(`◈ ───『 الـمـحـول الإمـبـراطـوري 』─── ◈\n\n⚙️ جاري نقل ${mediaLinks.length} ملف/ملفات إلى سحابة التوب..\n\n◈ ──────────────── ◈`, threadID, messageID);

  try {
    const results = [];
    
    // معالجة الروابط بالتوازي لسرعة خارقة
    for (const url of mediaLinks) {
      const response = await axios.get(`https://api.vyturex.com/imgur?url=${encodeURIComponent(url)}`);
      if (response.data && response.data.image) {
        results.push(response.data.image);
      }
    }

    if (results.length === 0) throw new Error("فشل الرفع");

    // صرف منحة التقشف للرعية
    await Currencies.increaseMoney(senderID, reward);

    // تنسيق الروابط لسهولة النسخ في الأكواد (بين علامات تنصيص وفواصل)
    const codeFormat = results.map(res => `"${res}",`).join('\n');
    
    let report = `◈ ───『 سـجـلات الأرشـيـف 』─── ◈\n\n` +
                 `✅ تـم اسـتـلام وتـحويـل الروابط:\n\n${codeFormat}\n\n` +
                 `💰 مـنـحـة الـتقـشـف: +${reward}$\n` +
                 ` ———————————————\n` +
                 `│←› الـمـشـرف: الـتـوب ايـمـن 👑\n` +
                 `◈ ──────────────── ◈`;

    return api.sendMessage(report, threadID, messageID);

  } catch (err) {
    console.error(err);
    return api.sendMessage(`⚠️ سيدي، يبدو أن خوادم الرفع الخارجية تتعرض لضغط، حاول مجدداً.`, threadID, messageID);
  }
};
