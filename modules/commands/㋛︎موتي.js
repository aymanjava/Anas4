const axios = require("axios");
const fs = require("fs-extra");
const canvas = require("canvas");

module.exports.config = {
  name: "موتي",
  version: "4.0.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "تنبؤ بمصيرك الأسود مع صورة مدمجة لبروفايلك",
  commandCategory: "ترفية",
  usages: "",
  cooldowns: 5
};

module.exports.run = async function({ api, event, Users }) {
  const { threadID, messageID, senderID } = event;

  // قائمة أسباب الموت الضخمة
  const causes = ["حادث قطار مرعب", "رصاصة طائشة", "سكتة قلبية من الضحك", "هجوم من قطط شرسة", "انفجار هاتف صيني", "تسمم بوجبة شاورما", "سقوط من ناطحة سحاب", "اختناق أثناء النوم", "صاعقة برق إمبراطورية"];
  
  const randomCause = causes[Math.floor(Math.random() * causes.length)];
  const day = Math.floor(Math.random() * 30) + 1;
  const month = Math.floor(Math.random() * 12) + 1;
  const year = Math.floor(Math.random() * (2100 - 2026 + 1)) + 2026;

  api.sendMessage("⏳ جاري استحضار سجلات الوفاة الإمبراطورية...", threadID, messageID);

  try {
    // 1. جلب صورة بروفايل المستخدم
    const avatarUrl = `https://graph.facebook.com/${senderID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
    
    // 2. استخدام قالب صورة الموت (شاهد قبر مثلاً)
    const backgroundUrl = "https://i.postimg.cc/7L4jV9zV/death-template.jpg"; // رابط صورة شاهد قبر أو جنازة

    const [avatarBuffer, backgroundBuffer] = await Promise.all([
      axios.get(avatarUrl, { responseType: 'arraybuffer' }).then(res => res.data),
      axios.get(backgroundUrl, { responseType: 'arraybuffer' }).then(res => res.data)
    ]);

    const img = await canvas.loadImage(backgroundBuffer);
    const avatar = await canvas.loadImage(avatarBuffer);
    const cv = canvas.createCanvas(img.width, img.height);
    const ctx = cv.getContext("2d");

    ctx.drawImage(img, 0, 0, cv.width, cv.height);
    
    // دمج صورة البروفايل داخل إطار شاهد القبر (إحداثيات افتراضية تناسب القالب)
    ctx.save();
    ctx.beginPath();
    ctx.arc(cv.width / 2, cv.height / 3, 100, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar, (cv.width / 2) - 100, (cv.height / 3) - 100, 200, 200);
    ctx.restore();

    const path = __dirname + `/cache/death_${senderID}.png`;
    fs.writeFileSync(path, cv.toBuffer("image/png"));

    let msg = `┏━━━━━━ ⚰️ ━━━━━━┓\n   سِـجـل الـوفـاة الـمـلـكـي\n┗━━━━━━ ⚰️ ━━━━━━┛\n\n` +
              `💀 سـبب الـمـوت: ${randomCause}\n` +
              `📅 تـاريـخ الـرحـيـل: ${day}/${month}/${year}\n\n` +
              `————————————————\n` +
              `│←› مـلـك الـمـوت: الـتـوب ايـمـن 👑\n` +
              `◈ ──────────────── ◈`;

    return api.sendMessage({ body: msg, attachment: fs.createReadStream(path) }, threadID, () => fs.unlinkSync(path), messageID);

  } catch (e) {
    console.log(e);
    return api.sendMessage("⚠️ سيدي، الضحية ترفض الموت حالياً (خطأ في دمج الصور).", threadID, messageID);
  }
};
