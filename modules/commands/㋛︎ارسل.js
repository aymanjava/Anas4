const moment = require("moment-timezone");

module.exports.config = {
  name: "ارسل",
  version: "3.0.0",
  hasPermssion: 2,
  credits: "Ayman",
  description: "إصدار المراسيم الملكية للمستخدمين أو المجموعات",
  commandCategory: "المطور",
  usages: "[للمستخدم / للكروب] [الأيدي] [الرسالة]",
  cooldowns: 5,
};

module.exports.run = async function({ api, event, args, Currencies }) {
    const { threadID, messageID, senderID } = event;
    const isTop = global.config.ADMINBOT.includes(senderID);

    // التحقق من السيادة (التوب فقط)
    if (!isTop) {
        return api.sendMessage(`◈ ───『 تـنـبـيـه 』─── ◈\n\n⚠️ عذراً، المراسيم الملكية تصدر فقط من الـتـوب ايـمـن 👑\n\n◈ ──────────────── ◈`, threadID, messageID);
    }

    const type = args[0];
    const targetID = args[1];
    const messageContent = args.slice(2).join(" ");
    const time = moment.tz("Asia/Baghdad").format("HH:mm:ss - D/MM/YYYY");
    const gift = 50; // مكافأة رمزية للمستلم (أخذ نقاط قليلة)

    if (!type || !targetID || !messageContent) {
        return api.sendMessage(`◈ ───『 مـسـاعـد الـإرسـال 』─── ◈\n\nيرجى استخدام الصيغة التالية:\n│←› ارسل للمستخدم [ID] [النص]\n│←› ارسل للكروب [ID] [النص]\n\n◈ ──────────────── ◈`, threadID, messageID);
    }

    const formattedMsg = `◈ ───『 مـرسـوم مـلـكـي 』─── ◈\n\n` +
                         `📜 الـرسـالة: ${messageContent}\n\n` +
                         `⏰ الـتـوقـيـت: ${time}\n` +
                         `💰 هـديـة وصول: +${gift}$\n` +
                         ` ———————————————\n` +
                         `│←› الآمر: الـتـوب ايـمـن 👑\n` +
                         `◈ ──────────────── ◈`;

    try {
        await api.sendMessage(formattedMsg, targetID);
        
        // منح مكافأة للمستلم لتعزيز الولاء للتوب
        await Currencies.increaseMoney(targetID, gift);

        return api.sendMessage(`◈ ───『 تـم الـتـنـفـيـذ 』─── ◈\n\n✅ تم إيصال المرسوم إلى ${type == 'للمستخدم' ? 'العضو' : 'المجموعة'}: [ ${targetID} ]\n\n◈ ──────────────── ◈`, threadID, messageID);
    } catch (error) {
        return api.sendMessage(`❌ فشل الإرسال، سيدي. تأكد من الأيدي أو أن البوت موجود في تلك المجموعة.`, threadID, messageID);
    }
};
