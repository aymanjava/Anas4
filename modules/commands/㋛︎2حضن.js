const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const jimp = require("jimp");

module.exports.config = {
  name: "حضن",
  version: "5.0.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "حضن شخص مع تركيب صور البروفايل (10 وضعيات شغالة)",
  commandCategory: "فئة الترفيه",
  usages: "[@منشن]",
  cooldowns: 5
};

// تم اختيار روابط مباشرة لضمان العمل الدائم مع إحداثيات دقيقة
const hugTemplates = [
  { url: "https://i.postimg.cc/mD7tN2G1/hug2.jpg", p1: [150, 50, 140], p2: [350, 50, 140] },
  { url: "https://i.ibb.co/3YN3T1r/q1y28eqblsr21.jpg", p1: [320, 100, 150], p2: [280, 280, 130] },
  { url: "https://i.postimg.cc/8P89GZ9S/hug3.jpg", p1: [100, 100, 120], p2: [250, 100, 120] },
  { url: "https://i.postimg.cc/L6S9x0Y7/hug4.jpg", p1: [200, 80, 130], p2: [400, 80, 130] },
  { url: "https://i.postimg.cc/9Fm8n6m1/hug5.jpg", p1: [50, 50, 150], p2: [300, 50, 150] },
  { url: "https://i.postimg.cc/hGvXy8N0/hug6.jpg", p1: [120, 120, 140], p2: [320, 120, 140] },
  { url: "https://i.postimg.cc/7Z0m7mXp/hug7.jpg", p1: [80, 40, 130], p2: [280, 40, 130] },
  { url: "https://i.postimg.cc/Bv3vLzXW/hug8.jpg", p1: [180, 180, 120], p2: [380, 180, 120] },
  { url: "https://i.postimg.cc/dtD7Xm9t/hug9.jpg", p1: [60, 60, 140], p2: [260, 60, 140] },
  { url: "https://i.postimg.cc/Xv7p4N5G/hug10.jpg", p1: [220, 100, 135], p2: [420, 100, 135] }
];

module.exports.run = async function ({ event, api, args }) {
  const { threadID, messageID, senderID } = event;
  const mention = Object.keys(event.mentions);

  if (!mention[0]) return api.sendMessage("╭──── • 𝑯𝑬𝑩𝑨 • ────╮\n⚠️ يرجى عمل منشن للشخص!\n╰──────────────╯", threadID, messageID);

  api.setMessageReaction("⏳", messageID, () => {}, true);

  try {
    const one = senderID;
    const two = mention[0];
    
    // اختيار قالب عشوائي
    const temp = hugTemplates[Math.floor(Math.random() * hugTemplates.length)];

    // روابط صور البروفايل (طريقة مباشرة بدون توكين معقد)
    const avt1 = `https://graph.facebook.com/${one}/picture?width=512&height=512`;
    const avt2 = `https://graph.facebook.com/${two}/picture?width=512&height=512`;

    // معالجة الصور
    const [base, p1, p2] = await Promise.all([
      jimp.read(temp.url),
      jimp.read(avt1),
      jimp.read(avt2)
    ]);

    // قص دائري
    p1.circle();
    p2.circle();

    // تركيب الوجوه على القالب حسب الإحداثيات
    base.composite(p1.resize(temp.p1[2], temp.p1[2]), temp.p1[0], temp.p1[1])
        .composite(p2.resize(temp.p2[2], temp.p2[2]), temp.p2[0], temp.p2[1]);

    const outPath = path.join(__dirname, "cache", `hug_${one}_${two}.png`);
    await base.writeAsync(outPath);

    api.setMessageReaction("✅", messageID, () => {}, true);

    // إرسال الصورة مع تاغ ورد
    return api.sendMessage({
      body: `╭──── • 𝑯𝑬𝑩𝑨 • ────╮\n\n🥰 تم إعطاء حضن دافئ لـ ${event.mentions[two]}\n\n╰──────────────╯`,
      mentions: [{ tag: event.mentions[two], id: two }],
      attachment: fs.createReadStream(outPath)
    }, threadID, () => fs.unlinkSync(outPath), messageID);

  } catch (err) {
    console.error(err);
    return api.sendMessage("⚠️ عذراً، حدث خطأ في معالجة الصور. تأكد أن حساباتكم تسمح بظهور صورة البروفايل.", threadID, messageID);
  }
};
