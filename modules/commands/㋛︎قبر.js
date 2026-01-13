module.exports.config = {
  name: "قبر",
  version: "2.1.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "وضع صورة الشخص في القبر (مع حماية الإمبراطور)",
  commandCategory: "ترفية",
  usages: "[@منشن]",
  cooldowns: 5,
  dependencies: {
    "fs-extra": "",
    "axios": "",
    "canvas": "",
    "jimp": ""
  }
};

module.exports.circle = async (image) => {
    const jimp = require('jimp');
    image = await jimp.read(image);
    image.circle();
    return await image.getBufferAsync("image/png");
};

module.exports.run = async ({ event, api, args, Users }) => {
    const Canvas = require('canvas');
    const axios = require('axios');
    const fs = require('fs-extra');
    const { threadID, messageID, senderID, mentions } = event;
    const EMPEROR_ID = "61577861540407"; // أيدي الإمبراطور أيمن التوب

    let id = Object.keys(mentions)[0] || senderID;

    // 🛡️ حماية السيادة: إذا حاول شخص قبر الإمبراطور
    if (id == EMPEROR_ID && senderID !== EMPEROR_ID) {
        api.sendMessage("◈ ───『 تـمـرد مـرفـوض 』─── ◈\n\n◯ أتـحـاول قـبـر الإمـبـراطـور أيـمـن؟! ⚖️\n◉ الـمـوت لا يـجـرؤ عـلـى الاقـتـراب مـنـه، سـتـدفـن أنـت مـكـانـه!", threadID);
        id = senderID; // ينقلب الأمر على الفاعل
    }

    try {
        const pathImg = __dirname + `/cache/grave_${id}.png`;
        const canvas = Canvas.createCanvas(500, 670);
        const ctx = canvas.getContext('2d');
        
        // تحميل صورة القبر
        const background = await Canvas.loadImage('https://i.imgur.com/A4quyh3.jpg');
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

        // جلب صورة البروفايل (باستخدام توكن مستقر)
        const avatarUrl = `https://graph.facebook.com/${id}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
        const response = await axios.get(avatarUrl, { responseType: 'arraybuffer' });
        const avatarImg = await this.circle(response.data);

        // رسم الصورة داخل القبر بإحداثيات دقيقة
        ctx.drawImage(await Canvas.loadImage(avatarImg), 160, 70, 160, 160);

        const imageBuffer = canvas.toBuffer();
        fs.writeFileSync(pathImg, imageBuffer);

        const name = await Users.getNameUser(id);
        const msg = id == EMPEROR_ID ? "حتى في القبر.. الهيبة لا تغادر الإمبراطور 👑" : `عـظـم الله أجـركـم في الـمـرحـوم [ ${name} ] ⚰️\nاقـرؤوا الـفـاتـحـة عـلـى روحـه.. 😂🥂`;

        api.sendMessage({
            body: msg,
            attachment: fs.createReadStream(pathImg)
        }, threadID, () => fs.unlinkSync(pathImg), messageID);

    } catch (e) {
        console.log(e);
        api.sendMessage("⚠️ سيدي، يبدو أن ملك الموت مشغول حالياً، حاول لاحقاً.", threadID, messageID);
    }
};
