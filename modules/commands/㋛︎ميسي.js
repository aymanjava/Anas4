module.exports.config = {
  name: "منشور ميسي",
  version: "1.1.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "يجعل ميسي ينشر كلامك في منشور مزيف",
  commandCategory: "فئة الصور",
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

module.exports.run = async function({ api, event, args }) {
  let { threadID, messageID } = event;
  const { loadImage, createCanvas } = require("canvas");
  const fs = require("fs-extra");
  const axios = require("axios");
  const path = require("path");
  
  let pathImg = path.join(__dirname, "cache", `messi_${threadID}.png`);
  var text = args.join(" ");

  if (!text) return api.sendMessage("╭──── • 𝑯𝑬𝑩𝑨 • ────╮\n⚠️ يرجى كتابة النص الذي تريد أن ينشره ميسي!\n╰──────────────╯", threadID, messageID);

  try {
    api.setMessageReaction("⌛", messageID, () => {}, true);

    // جلب قالب صورة ميسي
    let response = await axios.get(`https://i.postimg.cc/SNz6vxYx/Picsart-22-10-16-21-04-30-217.jpg`, { responseType: 'arraybuffer' });
    fs.writeFileSync(pathImg, Buffer.from(response.data, 'utf-8'));

    let baseImage = await loadImage(pathImg);
    let canvas = createCanvas(baseImage.width, baseImage.height);
    let ctx = canvas.getContext("2d");

    ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);
    
    // إعدادات الخط
    ctx.font = "400 35px Arial"; 
    ctx.fillStyle = "#000000"; // تغيير اللون للأسود ليلائم المنشور
    ctx.textAlign = "right"; // ليدعم العربية بشكل أفضل

    const lines = await this.wrapText(ctx, text, 1000);
    
    // رسم النص على الصورة
    ctx.fillText(lines.join('\n'), canvas.width - 100, 180);

    const imageBuffer = canvas.toBuffer();
    fs.writeFileSync(pathImg, imageBuffer);

    api.setMessageReaction("✅", messageID, () => {}, true);

    return api.sendMessage({
      body: `╭──── • 𝑯𝑬𝑩𝑨 • ────╮\n\n🐐 ميسي قام بنشر كلامك الآن!\n\n╰──────────────╯`,
      attachment: fs.createReadStream(pathImg)
    }, threadID, () => fs.unlinkSync(pathImg), messageID);

  } catch (e) {
    console.error(e);
    return api.sendMessage("⚠️ حدث خطأ أثناء معالجة الصورة.", threadID, messageID);
  }
}
