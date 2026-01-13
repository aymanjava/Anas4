const axios = require('axios');
const fs = require('fs-extra');

module.exports.config = {
  name: "فيس",
  version: "2.1.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "تحميل فيديو أو صوت من فيسبوك عبر الروابط أو المرفقات",
  commandCategory: "خدمات",
  usages: "[صوت/فيديو] (مع الرابط أو الرد على فيديو)",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, args, Currencies }) {
  const { threadID, messageID, senderID, messageReply, attachments } = event;
  const isTop = global.config.ADMINBOT.includes(senderID);
  const cost = 100; // تكلفة التحميل للمستخدمين العاديين

  // التحقق من الرصيد في الخزينة المركزية
  if (!isTop) {
    let userMoney = (await Currencies.getData(senderID)).money || 0;
    if (userMoney < cost) return api.sendMessage(`◯ عذراً، تكلفة التحميل هي ${cost}$ من رصيدك الموحد. اجمع المال من (اعلام/محاكي) ثم عد!`, threadID, messageID);
  }

  try {
    let url = "";
    // جلب الرابط سواء كان رداً على فيديو أو رابطاً نصياً
    if (messageReply && messageReply.attachments[0]) {
      url = messageReply.attachments[0].playableUrl;
    } else if (attachments[0]) {
      url = attachments[0].playableUrl;
    } else if (args[1]) {
      url = args[1];
    }

    if (!url) return api.sendMessage("◯ يرجى الرد على فيديو فيسبوك أو وضع رابط الفيديو!", threadID, messageID);

    if (args[0] == 'صوت') {
      api.sendMessage(`◈ جاري استخراج الصوت.. انتظر سيدي التوب 👑`, threadID, (err, info) => setTimeout(() => api.unsendMessage(info.messageID), 3000));
      
      const path = __dirname + `/cache/fb_audio_${senderID}.mp3`;
      let getAudio = (await axios.get(url, { responseType: 'arraybuffer' })).data;
      fs.writeFileSync(path, Buffer.from(getAudio, "utf-8"));

      if (!isTop) await Currencies.decreaseMoney(senderID, cost); // خصم التكلفة

      return api.sendMessage({
        body: `◈ ──『 تـم الـتـنـزيل 』── ◈\n\n◯ تم استخراج الصوت بنجاح\n◯ التكلفة: ${isTop ? "مجاناً للتوب" : cost + "$"}\n\n│←› بـواسطة هبة بـوت 👑`,
        attachment: fs.createReadStream(path)
      }, threadID, () => fs.unlinkSync(path), messageID);
    }

    if (args[0] == 'فيديو') {
      api.sendMessage(`◈ جاري سحب الفيديو من الخادم.. ⚡`, threadID, (err, info) => setTimeout(() => api.unsendMessage(info.messageID), 3000));
      
      const path = __dirname + `/cache/fb_video_${senderID}.mp4`;
      let getVideo = (await axios.get(url, { responseType: 'arraybuffer' })).data;
      fs.writeFileSync(path, Buffer.from(getVideo, "utf-8"));

      if (!isTop) await Currencies.decreaseMoney(senderID, cost); // خصم التكلفة

      return api.sendMessage({
        body: `◈ ──『 تـم الـتـحـمـيل 』── ◈\n\n◯ فيديو فيسبوك جاهز للمشاهدة\n◯ تم الخصم من رصيدك الموحد\n\n│←› بـإدارة الـتـوب ايـمـن 👑`,
        attachment: fs.createReadStream(path)
      }, threadID, () => fs.unlinkSync(path), messageID);
    }

  } catch (e) {
    return api.sendMessage(`❌ فشل التحميل: تأكد أن الفيديو "عام" (Public) وليس في مجموعة مغلقة.`, threadID, messageID);
  }
};
