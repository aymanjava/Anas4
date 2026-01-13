const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const jimp = require("jimp");

module.exports.config = {
  name: "شنق",
  version: "3.2.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "تنفيذ حكم الشنق بمنشن (نسخة العدالة الملكية)",
  commandCategory: "العاب",
  usages: "[@منشن]",
  cooldowns: 10,
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
  const imagePath = path.resolve(dirMaterial, 'smto.png');
  if (!fs.existsSync(imagePath)) {
    const res = await axios.get("https://i.postimg.cc/brq6rDDB/received-1417994055426496.jpg", { responseType: "arraybuffer" });
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
  let baseImage = await jimp.read(__root + "/smto.png");
  let pathImg = __root + `/hang_${one}_${two}.png`;
  let avatarOne = __root + `/avt_${one}.png`;
  let avatarTwo = __root + `/avt_${two}.png`;

  const TOKEN = "6628568379%7Cc1e620fa708a1d5696fb991c1bde5662";

  let getAvatarOne = (await axios.get(`https://graph.facebook.com/${one}/picture?width=512&height=512&access_token=${TOKEN}`, { responseType: 'arraybuffer' })).data;
  fs.writeFileSync(avatarOne, Buffer.from(getAvatarOne, 'utf-8'));

  let getAvatarTwo = (await axios.get(`https://graph.facebook.com/${two}/picture?width=512&height=512&access_token=${TOKEN}`, { responseType: 'arraybuffer' })).data;
  fs.writeFileSync(avatarTwo, Buffer.from(getAvatarTwo, 'utf-8'));

  let circleOne = await jimp.read(await circle(avatarOne));
  let circleTwo = await jimp.read(await circle(avatarTwo));
  
  // تعديل الإحداثيات لتكون دقيقة (رأس الجلاد ورأس المشنوق)
  baseImage.composite(circleOne.resize(150, 150), 300, 180) // الجلاد
           .composite(circleTwo.resize(140, 140), 550, 480); // المشنوق

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
  if (!mention[0]) return api.sendMessage("◈ ──『 تـنـبـيـه 』── ◈\n\n◯ سيدي، حدد الخائن الذي تريد شنقه بالمنشن.\n———————————————\n◈ ────────────── ◈", threadID, messageID);
  
  let victimID = mention[0];
  let executionerID = senderID;

  // 🛡️ حماية السيادة
  if (victimID == EMPEROR_ID && senderID !== EMPEROR_ID) {
    api.sendMessage("◈ ───『 خـيـانـة عـظـمـى 』─── ◈\n\n◯ أتـحـاول شـنـق الإمـبـراطـور أيـمـن؟! ⚖️\n◉ لـقـد انـقـلـب الـسـحـر عـلـى الـسـاحـر، سـتـُشـنـق أنـت بـتـهـمـة الـتـمـرد!", threadID);
    victimID = senderID;
    executionerID = EMPEROR_ID;
  }

  const nameVictim = await Users.getNameUser(victimID);

  api.sendMessage("⏳ يـتـم الآن نـصـب الـمـشـنـقـة وتـجـهـيـز الـحـبـل...", threadID, async () => {
      try {
          const pathImg = await makeImage({ one: executionerID, two: victimID });
          return api.sendMessage({ 
              body: `◈ ───『 تـنـفـيـذ الـإعـدام ⚖️ 』─── ◈\n\n◯ تـم تـنـفـيـذ حـكـم الـشـنـق بـحـق: ${nameVictim}.\n◉ الـعـدالـة لا تـعـرف الـرحـمـة مـع الـخـونـة.\n———————————————\n│←› بـأوامـر: الـتـوب أيـمـن 👑`, 
              attachment: fs.createReadStream(pathImg) 
          }, threadID, () => fs.unlinkSync(pathImg), messageID);
      } catch (e) {
          return api.sendMessage("⚠️ حدث خطأ في حبل المشنقة، الخائن نجا هذه المرة!", threadID, messageID);
      }
  }, messageID);
};
