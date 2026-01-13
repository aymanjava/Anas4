const axios = require('axios');
const fs = require('fs-extra');

module.exports.config = {
  name: "انترو",
  version: "2.5.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "صناعة فيديو انترو باسمك مرتبطة بالخزينة المركزية",
  commandCategory: "خدمات",
  usages: "[النص المراد كتابته]",
  cooldowns: 10,
};

module.exports.run = async ({ api, event, args, Currencies }) => {
  const { threadID, messageID, senderID } = event;
  const isTop = global.config.ADMINBOT.includes(senderID);
  const introCost = 250; // تكلفة صناعة الانترو للمستخدمين العاديين

  let query = args.join(" ");
  if (!query) return api.sendMessage("◯ سيدي، يرجى كتابة النص المراد وضعه في الانترو!\nمثال: .انترو AYMAN", threadID, messageID);

  // نظام الخزينة المركزية
  if (!isTop) {
    let userMoney = (await Currencies.getData(senderID)).money || 0;
    if (userMoney < introCost) {
      return api.sendMessage(`◯ عذراً، تكلفة صناعة فيديو انترو احترافي هي ${introCost}$ من رصيدك الموحد.\nجرب اللعب في (اعلام) لجمع المال!`, threadID, messageID);
    }
  }

  try {
    api.sendMessage(`◈ جاري العمل في الاستوديو.. انتظر سيدي التوب 👑\n◯ قد يستغرق الأمر ثوانٍ لتوليد الفيديو.`, threadID, (err, info) => setTimeout(() => api.unsendMessage(info.messageID), 5000));

    let path = __dirname + `/cache/intro_${senderID}.mp4`;

    // الاتصال بمحرك التوليد (تأكد من عمل الرابط أو استبداله بـ API متاح)
    const response = await axios.get(`https://faheem-vip-010.faheem001.repl.co/api/ephoto/intro2?text=${encodeURIComponent(query)}&type=video/mp4`, {
      responseType: "arraybuffer",
    });

    fs.writeFileSync(path, Buffer.from(response.data, "utf-8"));

    // خصم التكلفة من الخزينة المركزية
    if (!isTop) await Currencies.decreaseMoney(senderID, introCost);

    return api.sendMessage({
      body: `◈ ───『 الـإنـتـرو الـمـلكي 』─── ◈\n\n` +
            `✅ تم تصميم الفيديو بنجاح!\n` +
            `📝 النص: ${query}\n` +
            `💰 الرسوم: ${isTop ? "مجانية للتوب" : introCost + "$"}\n\n` +
            `│←› بـإدارة الـتـوب ايـمـن 👑\n` +
            `◈ ───────────────── ◈`,
      attachment: fs.createReadStream(path)
    }, threadID, () => fs.unlinkSync(path), messageID);

  } catch (err) {
    console.log(err);
    return api.sendMessage(`❌ فشل الاتصال بمحرك التصميم.. ربما الخادم مشغول حالياً.`, threadID, messageID);
  }
};
