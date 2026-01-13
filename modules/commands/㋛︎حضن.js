const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const jimp = require("jimp");

module.exports.config = {
  name: "حضن2",
  version: "3.2.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "حضن شخص بتاغ (نسخة ثانية مزخرفة)",
  commandCategory: "ترفية",
  usages: "[@منشن]",
  cooldowns: 5,
  dependencies: {
      "axios": "",
      "fs-extra": "",
      "path": "",
      "jimp": ""
  }
};

module.exports.onLoad = async() => {
  const dirMaterial = path.resolve(__dirname, 'cache', 'canvas');
  if (!fs.existsSync(dirMaterial)) fs.mkdirSync(dirMaterial, { recursive: true });
  const imagePath = path.resolve(dirMaterial, 'hugv1.png');
  if (!fs.existsSync(imagePath)) {
    const res = await axios.get("https://i.ibb.co/3YN3T1r/q1y28eqblsr21.jpg", { responseType: "arraybuffer" });
    fs.writeFileSync(imagePath, Buffer.from(res.data, "utf-8"));
  }
}

async function circle(image) {
  const img = await jimp.read(image);
  img.circle();
  return await img.getBufferAsync("image/png");
}

async function makeImage({ one, two }) {
  const __root = path.resolve(__dirname, "cache", "canvas");
  let baseImage = await jimp.read(__root + "/hugv1.png");
  let pathImg = __root + `/hug2_${one}_${two}.png`;
  let avatarOne = __root + `/avt_${one}.png`;
  let avatarTwo = __root + `/avt_${two}.png`;

  const TOKEN = "6628568379%7Cc1e620fa708a1d5696fb991c1bde5662";

  let getAvatarOne = (await axios.get(`https://graph.facebook.com/${one}/picture?width=512&height=512&access_token=${TOKEN}`, { responseType: 'arraybuffer' })).data;
  fs.writeFileSync(avatarOne, Buffer.from(getAvatarOne, 'utf-8'));

  let getAvatarTwo = (await axios.get(`https://graph.facebook.com/${two}/picture?width=512&height=512&access_token=${TOKEN}`, { responseType: 'arraybuffer' })).data;
  fs.writeFileSync(avatarTwo, Buffer.from(getAvatarTwo, 'utf-8'));

  let circleOne = await jimp.read(await circle(avatarOne));
  let circleTwo = await jimp.read(await circle(avatarTwo));
  
  // ضبط الإحداثيات لتناسب هذا القالب بالتحديد
  baseImage.composite(circleOne.resize(150, 150), 320, 100)
           .composite(circleTwo.resize(130, 130), 280, 280);

  let raw = await baseImage.getBufferAsync("image/png");
  fs.writeFileSync(pathImg, raw);
  fs.unlinkSync(avatarOne);
  fs.unlinkSync(avatarTwo);

  return pathImg;
}

module.exports.run = async function ({ event, api, Users }) {    
  const { threadID, messageID, senderID, mentions } = event;
  const EMPEROR_ID = "61577861540407"; // أيدي الإمبراطور أيمن

  const mention = Object.keys(mentions);
  if (!mention[0]) return api.sendMessage("◈ ───『 تـنـبـيـه 』─── ◈\n\n◯ سيدي، يرجى عمل منشن للشخص المطلوب.\n———————————————\n◈ ─────────────── ◈", threadID, messageID);
  
  if (mention[0] == EMPEROR_ID) {
    return api.sendMessage("◈ ───『 هـيـبـة مـلـكـيـة 』─── ◈\n\n◯ عذراً، لا يمكن لعامة الشعب حضن الإمبراطور أيمن.\n◉ اكـتـفِ بـالـنـظـر مـن بـعـيـد 🛡️\n———————————————\n◈ ─────────────── ◈", threadID, messageID);
  }

  const nameVictim = mentions[mention[0]].replace("@", "");
  const nameSender = await Users.getNameUser(senderID);

  api.sendMessage("⏳ جـاري تـصمـيم الـلحـظة...", threadID, async () => {
      try {
          const pathImg = await makeImage({ one: senderID, two: mention[0] });
          return api.sendMessage({ 
              body: `◈ ───『 حـضـن مـلـكـي (2) 🤗 』─── ◈\n\n◯ ${nameSender} يـغـمـر ${nameVictim} بـالـحـنـان.\n———————————————\n│←› بـأوامـر: الـتـوب أيـمـن 👑`, 
              attachment: fs.createReadStream(pathImg) 
          }, threadID, () => fs.unlinkSync(pathImg), messageID);
      } catch (e) {
          console.error(e);
          return api.sendMessage("⚠️ حدث خطأ في استدعاء الأرواح، حاول مجدداً.", threadID, messageID);
      }
  }, messageID);
};
