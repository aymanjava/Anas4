const axios = require('axios');
const request = require('request');
const fs = require("fs-extra");

module.exports.config = {
 name: "سيستا",
 version: "4.0.0",
 hasPermssion: 0,
 credits: "Ayman",
 description: "إصدار صور سيستا الملكية مع مكافأة تقشفية",
 commandCategory: "صور",
 usages: "",
 cooldowns: 10 // زيادة وقت الانتظار لفرض الهيبة
};

module.exports.run = async ({ api, event, Currencies }) => {
 const { threadID, messageID, senderID } = event;
 const reward = 5; // مكافأة قليلة جداً (نظام التقشف)

 try {
  // جلب الصورة من الرابط الاستخباراتي
  const res = await axios.get('https://siesta-api.bhhoang.repl.co');
  const imageUrl = res.data.success;
  const ext = imageUrl.substring(imageUrl.lastIndexOf(".") + 1);
  const path = __dirname + `/cache/siesta_${senderID}.${ext}`;

  api.sendMessage(`◈ ───『 الـمـكتبـة الـمـلكـيـة 』─── ◈\n\n🎨 جاري استخراج صورة سيستا سيدي..\n💎 ستنال مكافأة زهيدة مقابل طلبك.\n\n◈ ──────────────── ◈`, threadID);

  let callback = async () => {
   // منح مكافأة النقاط القليلة
   await Currencies.increaseMoney(senderID, reward);

   let msg = `◈ ───『 الـجـمـال الإمـبـراطور 』─── ◈\n\n` +
             `✅ تـم الـتـوفـير بـنـجـاح\n` +
             `💰 مـنـحـة الـتـوب: +${reward}$\n` +
             ` ———————————————\n` +
             `│←› الـمـمـول: الـتـوب ايـمـن 👑\n` +
             `◈ ──────────────── ◈`;

   api.sendMessage({
    body: msg,
    attachment: fs.createReadStream(path)
   }, threadID, () => fs.unlinkSync(path), messageID);
  };

  request(encodeURI(imageUrl)).pipe(fs.createWriteStream(path)).on("close", callback);

 } catch (err) {
  return api.sendMessage("⚠️ عذراً سيدي، يبدو أن المصدر متوقف حالياً.", threadID, messageID);
 }
};
