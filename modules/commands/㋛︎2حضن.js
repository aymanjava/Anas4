const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const jimp = require("jimp");

module.exports.config = {
  name: "حضن",
  version: "7.4.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "عناق دافئ مع من تحب بالصور",
  commandCategory: "صور",
  usages: "[منشن الشخص]",
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
  const imagePath = path.resolve(dirMaterial, 'hugv3.png');
  if (!fs.existsSync(imagePath)) {
    const res = await axios.get("https://i.imgur.com/7lPqHjw.jpg", { responseType: "arraybuffer" });
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
  let baseImage = await jimp.read(__root + "/hugv3.png");
  let pathImg = __root + `/hug_${one}_${two}.png`;
  let avatarOne = __root + `/avt_${one}.png`;
  let avatarTwo = __root + `/avt_${two}.png`;

  const TOKEN = "6628568379%7Cc1e620fa708a1d5696fb991c1bde5662";

  let getAvatarOne = (await axios.get(`https://graph.facebook.com/${one}/picture?width=512&height=512&access_token=${TOKEN}`, { responseType: 'arraybuffer' })).data;
  fs.writeFileSync(avatarOne, Buffer.from(getAvatarOne, 'utf-8'));

  let getAvatarTwo = (await axios.get(`https://graph.facebook.com/${two}/picture?width=512&height=512&access_token=${TOKEN}`, { responseType: 'arraybuffer' })).data;
  fs.writeFileSync(avatarTwo, Buffer.from(getAvatarTwo, 'utf-8'));

  let circleOne = await jimp.read(await circle(avatarOne));
  let circleTwo = await jimp.read(await circle(avatarTwo));
  
  // دمج الصور في الوضعيات الصحيحة
  baseImage.composite(circleOne.resize(220, 220), 200, 50)
           .composite(circleTwo.resize(220, 220), 490, 200);

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
  if (!mention[0]) return api.sendMessage("◈ ───『 تـنـبـيـه 』─── ◈\n\n◯ سيدي، يجب عمل تاغ للشخص الذي تريد ضمه.\n———————————————\n◈ ─────────────── ◈", threadID, messageID);
  
  if (mention[0] == EMPEROR_ID) {
    return api.sendMessage("◈ ───『 تـحـذيـر مـلـكـي 』─── ◈\n\n◯ لا يـجوز لـلـعامـة لـمـس الإمـبـراطـور!\n◉ هـيـبـة أيـمـن تـفـوق كـل شـيء 🛡️\n———————————————\n◈ ─────────────── ◈", threadID, messageID);
  }

  const nameVictim = mentions[mention[0]].replace("@", "");
  const nameSender = await Users.getNameUser(senderID);

  api.sendMessage("⏳ جـاري تـحضـير الـحضن الدافئ...", threadID, async () => {
      try {
          const pathImg = await makeImage({ one: senderID, two: mention[0] });
          return api.sendMessage({ 
              body: `◈ ───『 حـضـن مـلـكـي 🤗 』─── ◈\n\n◯ ${nameSender} يـضـم ${nameVictim} بـقـوة!\n———————————————\n│←› بـأوامـر: الـتـوب أيـمـن 👑`, 
              attachment: fs.createReadStream(pathImg) 
          }, threadID, () => fs.unlinkSync(pathImg), messageID);
      } catch (e) {
          return api.sendMessage("⚠️ عذراً سيدي، حدث خطأ في رسم اللوحة.", threadID, messageID);
      }
  }, messageID);
};
