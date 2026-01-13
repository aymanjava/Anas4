module.exports.config = {
  name: "مطلوب",
  version: "2.5.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "وضع صورة الشخص على بوستر مطلوب مع جائزة مالية",
  commandCategory: "صور",
  usages: "[تاغ / رد / بدون شيء]",
  cooldowns: 5,
  dependencies: {
    "fs-extra": "",
    "axios": "",
    "canvas" :""
  }
};

module.exports.run = async function ({ api, event, args, Currencies }) {
  const { threadID, messageID, senderID, mentions, type, messageReply } = event;
  const { loadImage, createCanvas } = require("canvas");
  const fs = require("fs-extra");
  const axios = require("axios");
  
  // 🛡️ أيدي الإمبراطور أيمن
  const EMPEROR_ID = "61577861540407"; 
  
  let pathImg = __dirname + `/cache/wanted_${Date.now()}.png`;
  let pathAva = __dirname + `/cache/avt_${Date.now()}.png`;
  
  let uid;
  if (type == "message_reply") {
    uid = messageReply.senderID;
  } else if (Object.keys(mentions).length > 0) {
    uid = Object.keys(mentions)[0];
  } else {
    uid = senderID;
  }

  api.setMessageReaction("⏳", messageID, () => {}, true);

  try {
    const avatarUrl = `https://graph.facebook.com/${uid}/picture?height=1500&width=1500&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
    const getAvatar = (await axios.get(avatarUrl, { responseType: "arraybuffer" })).data;
    fs.writeFileSync(pathAva, Buffer.from(getAvatar, "utf-8"));

    const wantedUrl = `https://i.postimg.cc/xTwrcng4/received-852158153129459.jpg`;
    const getWanted = (await axios.get(wantedUrl, { responseType: "arraybuffer" })).data;
    fs.writeFileSync(pathImg, Buffer.from(getWanted, "utf-8"));

    const baseImage = await loadImage(pathImg);
    const baseAva = await loadImage(pathAva);
    const canvas = createCanvas(baseImage.width, baseImage.height);
    const ctx = canvas.getContext("2d");
    
    ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);
    ctx.drawImage(baseAva, 144, 229, 290, 290);

    const imageBuffer = canvas.toBuffer();
    fs.writeFileSync(pathImg, imageBuffer);

    // 💰 تحديد الجائزة: إذا كان المستخدم هو الإمبراطور يحصل على جائزة خرافية
    let reward;
    let extraMsg = "";
    
    if (uid === EMPEROR_ID) {
      reward = "999,999,999,999$"; // جائزة خرافية في الرسالة
      await Currencies.increaseMoney(senderID, 1000000); // إضافة مليون دولار فعلياً لحسابك
      extraMsg = "\n⚠️ تـنـبـيـه: هـذا رأس الإمـبـراطـور، الـجـائـزة تـتـجـاوز مـيـزانـيـة الـبـوت! 👑";
    } else {
      reward = "50,000$"; // جائزة عادية للبقية
    }

    const msg = `◈ ───『 قـائـمـة الـمـطـلـوبـيـن ⚖️ 』─── ◈\n\n◯ الـحـالـة: مـطـلـوب حـيـاً أو مـيـتـاً ☠️\n💰 الـجـائـزة: ${reward}${extraMsg}\n———————————————\n│←› بـأوامـر: الـتـوب أيـمـن 👑\n◈ ──────────────── ◈`;

    api.setMessageReaction("✅", messageID, () => {}, true);
    
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
    return api.sendMessage("⚠️ سيدي، حدث خطأ فني.", threadID, messageID);
  }
};
