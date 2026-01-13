const fs = require("fs-extra");
const axios = require("axios");
const { loadImage, createCanvas } = require("canvas");

module.exports.config = {
  name: "مي",
  version: "3.0.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "إنشاء تعليق ملكي باسمك مع نظام رسوم الخزينة",
  commandCategory: "صور",
  usages: "[النص]",
  cooldowns: 10,
  dependencies: {
    "canvas": "",
    "axios": "",
    "fs-extra": ""
  }
};

module.exports.wrapText = (ctx, text, maxWidth) => {
  return new Promise((resolve) => {
    if (ctx.measureText(text).width < maxWidth) return resolve([text]);
    const words = text.split(" ");
    const lines = [];
    let line = "";
    while (words.length > 0) {
      if (ctx.measureText(`${line}${words[0]}`).width < maxWidth)
        line += `${words.shift()} `;
      else {
        lines.push(line.trim());
        line = "";
      }
      if (words.length === 0) lines.push(line.trim());
    }
    return resolve(lines);
  });
};

module.exports.run = async function ({ api, event, args, Users, Currencies }) {
  let { senderID, threadID, messageID } = event;
  const isTop = global.config.ADMINBOT.includes(senderID);
  const commentFee = 350; // رسوم التعليق (صرف)

  const text = args.join(" ");
  if (!text) {
    return api.sendMessage(`◈ ───『 تـنـبـيـه الـمـديـر 』─── ◈\n\n⚠️ سيدي، يرجى كتابة النص المراد وضعه في التعليق.\n\n◈ ──────────────── ◈`, threadID, messageID);
  }

  // نظام الصرف والخسارة
  let userMoney = (await Currencies.getData(senderID)).money || 0;
  if (!isTop && userMoney < commentFee) {
    return api.sendMessage(`◈ ───『 الـخـزيـنـة 』─── ◈\n\n❌ عذراً، رسوم توثيق التعليق هي ${commentFee}$. رصيدك غير كافٍ!\n\n◈ ──────────────── ◈`, threadID, messageID);
  }

  api.sendMessage(`◈ ───『 الـمـطـبـعـة الـمـلـكـيـة 』─── ◈\n\n📸 جاري تصميم تعليقك الخاص سيدي..\n\n◈ ──────────────── ◈`, threadID);

  try {
    const pathImg = __dirname + `/cache/comment_${senderID}.png`;
    const pathAva = __dirname + `/cache/avt_${senderID}.png`;

    // جلب البيانات (الأفاتار والخلفية)
    const [avatarRes, bgRes, userData] = await Promise.all([
      axios.get(`https://graph.facebook.com/${senderID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: "arraybuffer" }),
      axios.get(`https://i.postimg.cc/9FX3QVXf/Picsart-22-07-31-17-43-49-198.jpg`, { responseType: "arraybuffer" }),
      Users.getData(senderID)
    ]);

    fs.writeFileSync(pathAva, Buffer.from(avatarRes.data, "utf-8"));
    fs.writeFileSync(pathImg, Buffer.from(bgRes.data, "utf-8"));

    const baseImage = await loadImage(pathImg);
    const baseAva = await loadImage(pathAva);
    const canvas = createCanvas(baseImage.width, baseImage.height);
    const ctx = canvas.getContext("2d");

    // رسم الخلفية والأفاتار
    ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);
    ctx.drawImage(baseAva, 40, 50, 122, 122);

    // اسم المستخدم
    ctx.font = "bold 40px Arial";
    ctx.fillStyle = isTop ? "#FFD700" : "#FF9900"; // ذهبي للتوب
    ctx.textAlign = "start";
    ctx.fillText(userData.name, 170, 97);

    // معالجة النص
    ctx.font = "700 75px Arial";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "right";

    const lines = await this.wrapText(ctx, text, 1160);
    ctx.fillText(lines.join("\n"), 1250, 263);

    const imageBuffer = canvas.toBuffer();
    fs.writeFileSync(pathImg, imageBuffer);

    // خصم المبلغ (نظام الصرف)
    if (!isTop) await Currencies.decreaseMoney(senderID, commentFee);

    let finalMsg = `◈ ───『 اكـتـمـال الـتـعـلـيـق 』─── ◈\n\n` +
                   `✅ تم إصدار تعليقك الفخم بنجاح\n` +
                   `💰 رسوم التوثيق: ${isTop ? "0$ (إعفاء ملكي)" : commentFee + "$"}\n` +
                   `│←› الـمـشرف: الـتـوب ايـمـن 👑\n\n` +
                   `◈ ──────────────── ◈`;

    return api.sendMessage({ body: finalMsg, attachment: fs.createReadStream(pathImg) }, threadID, () => {
      fs.unlinkSync(pathImg);
      fs.unlinkSync(pathAva);
    }, messageID);

  } catch (err) {
    console.log(err);
    return api.sendMessage("❌ حدث خطأ تقني في المطبوعة، حاول مجدداً.", threadID, messageID);
  }
};
