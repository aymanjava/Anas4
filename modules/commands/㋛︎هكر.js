module.exports.config = {
  name: "هكر",
  version: "2.5.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "محاكاة اختراق حساب عبر التاغ أو الرد على الرسالة",
  commandCategory: "صور",
  usages: "[@تاغ / بالرد على رسالة]",
  dependencies: {
    "axios": "",
    "fs-extra": "",
    "canvas": ""
  },
  cooldowns: 10
};

module.exports.wrapText = (ctx, name, maxWidth) => {
  return new Promise(resolve => {
    if (ctx.measureText(name).width < maxWidth) return resolve([name]);
    const words = name.split(' ');
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

module.exports.run = async function ({ args, Users, api, event }) {
  const { loadImage, createCanvas } = require("canvas");
  const fs = require("fs-extra");
  const axios = require("axios");
  const { threadID, messageID, senderID, mentions, type, messageReply } = event;

  const out = (msg) => api.sendMessage(msg, threadID, messageID);

  // 🛡️ تحديد الضحية: (رد على رسالة > تاغ > المرسل نفسه)
  let id;
  if (type === "message_reply") {
    id = messageReply.senderID;
  } else if (Object.keys(mentions).length > 0) {
    id = Object.keys(mentions)[0];
  } else {
    id = senderID;
  }

  let name = await Users.getNameUser(id);

  out(`◈ ───『 جـاري الاخـتـراق.. ⚡ 』─── ◈\n\n◯ الـهدف: ${name}\n◉ جـاري سـحـب الـبـيانات..\n———————————————\n◈ ─────────────── ◈`);

  let pathImg = __dirname + `/cache/hacker_${id}.png`;
  let pathAvt = __dirname + `/cache/avt_${id}.png`;

  try {
    let backgroundURL = "https://i.imgur.com/VQXViKI.png";
    let avatarURL = `https://graph.facebook.com/${id}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

    let getAvt = (await axios.get(avatarURL, { responseType: "arraybuffer" })).data;
    let getBg = (await axios.get(backgroundURL, { responseType: "arraybuffer" })).data;

    fs.writeFileSync(pathAvt, Buffer.from(getAvt, "utf-8"));
    fs.writeFileSync(pathImg, Buffer.from(getBg, "utf-8"));

    let baseImage = await loadImage(pathImg);
    let baseAvt = await loadImage(pathAvt);

    let canvas = createCanvas(baseImage.width, baseImage.height);
    let ctx = canvas.getContext("2d");

    ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);
    ctx.font = "400 23px Arial";
    ctx.fillStyle = "#1878F3";
    ctx.textAlign = "start";

    const lines = await this.wrapText(ctx, name, 1160);
    ctx.fillText(lines.join('\n'), 200, 497);
    ctx.drawImage(baseAvt, 83, 437, 100, 101);

    const imageBuffer = canvas.toBuffer();
    fs.writeFileSync(pathImg, imageBuffer);

    let finalMsg = {
      body: `◈ ───『 تـم الاخـتـراق بـنـجـاح 』─── ◈\n\n◯ الـحـالـة: تـم الـتـسـلـل ✅\n◉ الـضـحية: ${name}\n———————————————\n◈ ─────────────── ◈\n│←› بـإشـراف: الإمـبـراطـور أيـمـن`,
      attachment: fs.createReadStream(pathImg)
    };

    return api.sendMessage(finalMsg, threadID, () => {
      if (fs.existsSync(pathImg)) fs.unlinkSync(pathImg);
      if (fs.existsSync(pathAvt)) fs.unlinkSync(pathAvt);
    }, messageID);

  } catch (e) {
    return out("⚠️ سيدي، فشل الاختراق! ربما حساب الضحية محمي بجدار حماية قوي.");
  }
}
