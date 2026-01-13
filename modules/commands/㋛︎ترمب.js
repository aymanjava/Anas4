const axios = require("axios");
const fs = require("fs-extra");
const { loadImage, createCanvas } = require("canvas");

module.exports.config = {
  name: "ترمب",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "جعل ترمب يغرد بأوامر التوب أيمن",
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
  const reward = 3; // منحة التقشف الملكية
  const text = args.join(" ");
  const pathImg = __dirname + `/cache/trump_${senderID}.png`;

  if (!text) return api.sendMessage("◈ ───『 تـنـبـيـه 』─── ◈\n\n⚠️ سيدي، أكتب النص الذي تريد من ترمب أن يغرد به للإمبراطورية.\n\n◈ ──────────────── ◈", threadID, messageID);

  api.sendMessage("◈ ───『 تـصريح دولـي 』─── ◈\n\n📡 جاري إجبار ترمب على كتابة التغريدة..\n\n◈ ──────────────── ◈", threadID, messageID);

  try {
    // جلب القالب الأصلي
    let response = await axios.get(`https://nekobot.xyz/imagegen/b/2/5/5257c8eb517552857cc5e809ff0fb.png`, { responseType: 'arraybuffer' });
    fs.writeFileSync(pathImg, Buffer.from(response.data, 'utf-8'));

    let baseImage = await loadImage(pathImg);
    let canvas = createCanvas(baseImage.width, baseImage.height);
    let ctx = canvas.getContext("2d");

    ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);
    ctx.font = "400 45px Arial";
    ctx.fillStyle = "#000000";
    
    const lines = await this.wrapText(ctx, text, 1160);
    ctx.fillText(lines.join('\n'), 60, 165);

    const imageBuffer = canvas.toBuffer();
    fs.writeFileSync(pathImg, imageBuffer);

    // صرف منحة التقشف
    await Currencies.increaseMoney(senderID, reward);

    let msg = `◈ ───『 الـقـمة الـدولـيـة 』─── ◈\n\n` +
              `🇺🇸 تـم تزوير الـتغريدة بـنـجاح.\n` +
              `💰 مـنـحـة الـتقـشـف: +${reward}$\n` +
              ` ———————————————\n` +
              `│←› بـإشراف: الـتـوب ايـمـن 👑\n` +
              `◈ ──────────────── ◈`;

    return api.sendMessage({ 
      body: msg, 
      attachment: fs.createReadStream(pathImg) 
    }, threadID, () => fs.unlinkSync(pathImg), messageID);

  } catch (err) {
    console.error(err);
    return api.sendMessage("⚠️ سيدي، حدث فشل في الأجهزة الاستخباراتية أثناء تزوير الصورة.", threadID, messageID);
  }
}
