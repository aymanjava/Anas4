module.exports.config = {
  name: "سجن",
  version: "2.1.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "وضع الشخص خلف قضبان السجن",
  commandCategory: "صور",
  usages: "[تاغ / رد / بدون شيء]",
  cooldowns: 5,
  dependencies: {
    "fs-extra": "",
    "axios": "",
    "canvas": ""
  }
};

module.exports.run = async function ({ api, event, args, Users }) {
  const { senderID, threadID, messageID, mentions, type, messageReply } = event;
  const { loadImage, createCanvas } = require("canvas");
  const fs = require("fs-extra");
  const axios = require("axios");

  const EMPEROR_ID = "61577861540407"; // أيدي الإمبراطور أيمن
  
  let uid;
  if (type == "message_reply") {
    uid = messageReply.senderID;
  } else if (Object.keys(mentions).length > 0) {
    uid = Object.keys(mentions)[0];
  } else {
    uid = senderID;
  }

  // 🛡️ حماية السيادة: إذا حاول أحد سجن الإمبراطور، يتم سجنه هو!
  if (uid === EMPEROR_ID && senderID !== EMPEROR_ID) {
    api.sendMessage("◈ ───『 تـنـبـيـه مـلـكـي 』─── ◈\n\n◯ أتـحـاول سـجـن الإمـبـراطـور أيـمـن؟!\n◉ بـأوامـر مـن الـعـرش، سـيـتـم سـجـنـك أنـت بـدلاً عـنـه ⚖️", threadID);
    uid = senderID; 
  }

  api.setMessageReaction("⏳", messageID, () => {}, true);

  const pathImg = __dirname + `/cache/jail_${uid}.png`;
  const pathAva = __dirname + `/cache/avt_${uid}.png`;

  try {
    // جلب صورة الشخص (الضحية)
    const avatarUrl = `https://graph.facebook.com/${uid}/picture?height=1000&width=1000&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
    const getAvatar = (await axios.get(avatarUrl, { responseType: "arraybuffer" })).data;
    fs.writeFileSync(pathAva, Buffer.from(getAvatar, "utf-8"));

    // جلب صورة قضبان السجن الشفافة
    const jailUrl = `https://i.postimg.cc/1zmxGQTS/8uv38cfmc74ur1p5rtntitrddi.png`;
    const getJail = (await axios.get(jailUrl, { responseType: "arraybuffer" })).data;
    fs.writeFileSync(pathImg, Buffer.from(getJail, "utf-8"));

    const baseAva = await loadImage(pathAva);
    const baseJail = await loadImage(pathImg);

    // إنشاء الكانفاس بنفس أبعاد صورة الشخص
    const canvas = createCanvas(baseAva.width, baseAva.height);
    const ctx = canvas.getContext("2d");

    // 1. رسم وجه الشخص أولاً
    ctx.drawImage(baseAva, 0, 0, canvas.width, canvas.height);
    // 2. رسم القضبان فوق الوجه
    ctx.drawImage(baseJail, 0, 0, canvas.width, canvas.height);

    const imageBuffer = canvas.toBuffer();
    fs.writeFileSync(pathImg, imageBuffer);

    api.setMessageReaction("✅", messageID, () => {}, true);

    const name = await Users.getNameUser(uid);
    const msg = uid === EMPEROR_ID ? "سيدي الإمبراطور، حتى خلف القضبان هيبتك لا تكسر! 👑" : `◈ ──『 الـعـدالـة تـتـحـقـق 』── ◈\n\n◯ الـمـسـجـون: ${name}\n◉ الـحـالـة: ريـثـمـا يـقـرر أيـمـن مـصـيـرك ⛓️`;

    return api.sendMessage({
      body: msg,
      attachment: fs.createReadStream(pathImg)
    }, threadID, () => {
      if (fs.existsSync(pathImg)) fs.unlinkSync(pathImg);
      if (fs.existsSync(pathAva)) fs.unlinkSync(pathAva);
    }, messageID);

  } catch (err) {
    console.error(err);
    api.setMessageReaction("❌", messageID, () => {}, true);
    return api.sendMessage("⚠️ حدث خطأ أثناء إغلاق الزنزانة.", threadID, messageID);
  }
};
