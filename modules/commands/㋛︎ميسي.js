module.exports.config = {
  name: "ميسي",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "الكتابة على منشور ميسي مع نظام رسوم الخزينة",
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
  return new Promise(resolve => {
    if (ctx.measureText(text).width < maxWidth) return resolve([text]);
    const words = text.split(' ');
    const lines = [];
    let line = '';
    while (words.length > 0) {
      if (ctx.measureText(`${line}${words[0]}`).width < maxWidth) line += `${words.shift()} `;
      else {
        lines.push(line.trim());
        line = '';
      }
      if (words.length === 0) lines.push(line.trim());
    }
    return resolve(lines);
  });
}

module.exports.run = async function({ api, event, args, Currencies }) {
  let { senderID, threadID, messageID } = event;
  const { loadImage, createCanvas } = require("canvas");
  const fs = require("fs-extra");
  const axios = require("axios");
  const isTop = global.config.ADMINBOT.includes(senderID);
  const postFee = 400; // رسوم النشر الإعلامي (صرف)

  let pathImg = __dirname + `/cache/messi_${senderID}.png`;
  var text = args.join(" ");

  if (!text) {
    return api.sendMessage(`◈ ───『 تـنـبـيـه الـمـديـر 』─── ◈\n\n⚠️ يرجى كتابة النص الذي تريد لميسي نشره!\n\n◈ ──────────────── ◈`, threadID, messageID);
  }

  // نظام الصرف والخسارة
  let userMoney = (await Currencies.getData(senderID)).money || 0;
  if (!isTop && userMoney < postFee) {
    return api.sendMessage(`◈ ───『 الـخـزيـنـة 』─── ◈\n\n❌ عذراً، تكلفة الترويج للمنشور هي ${postFee}$. رصيدك لا يكفي!\n\n◈ ──────────────── ◈`, threadID, messageID);
  }

  api.sendMessage(`◈ ───『 غـرفـة الـصـحـافـة 』─── ◈\n\n📸 جاري إعداد منشور الأسطورة ميسي..\n\n◈ ──────────────── ◈`, threadID);

  try {
    let getImg = (await axios.get(`https://i.postimg.cc/SNz6vxYx/Picsart-22-10-16-21-04-30-217.jpg`, { responseType: 'arraybuffer' })).data;
    fs.writeFileSync(pathImg, Buffer.from(getImg, 'utf-8'));
    
    let baseImage = await loadImage(pathImg);
    let canvas = createCanvas(baseImage.width, baseImage.height);
    let ctx = canvas.getContext("2d");
    
    ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);
    ctx.font = "400 45px Arial";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "start";

    const lines = await this.wrapText(ctx, text, 1160);
    ctx.fillText(lines.join('\n'), 60, 170);

    const imageBuffer = canvas.toBuffer();
    fs.writeFileSync(pathImg, imageBuffer);

    // خصم المبلغ (نظام الصرف)
    if (!isTop) await Currencies.decreaseMoney(senderID, postFee);

    let finalMsg = `◈ ───『 مـنـشـور الـأسـطـورة 』─── ◈\n\n` +
                   `✅ تم النشر على حساب ميسي بنجاح\n` +
                   `💰 رسوم النشر: ${isTop ? "0$ (إعفاء للتوب)" : postFee + "$"}\n` +
                   `│←› الـنـاشـر: الـتـوب ايـمـن 👑\n\n` +
                   `◈ ──────────────── ◈`;

    return api.sendMessage({ body: finalMsg, attachment: fs.createReadStream(pathImg) }, threadID, () => fs.unlinkSync(pathImg), messageID);
  } catch (err) {
    return api.sendMessage("❌ حدث خطأ في معالجة الصورة، حاول مجدداً.", threadID, messageID);
  }
}
