const axios = require('axios');
const fs = require("fs-extra");
const request = require("request");

module.exports.config = {
  name: "كلمات",
  version: "2.5.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "جلب كلمات الأغاني مع مكافأة تقشفية",
  commandCategory: "خدمات",
  usages: "[اسم الأغنية]",
  cooldowns: 5,
};

module.exports.run = async function({ api, event, args, Currencies }) {
  const { threadID, senderID, messageID } = event;
  const songName = args.join(" ");
  const reward = 4; // مكافأة التقشف (زهيدة جداً سيدي)

  if (!songName) {
    return api.sendMessage(`◈ ───『 تـنـبـيـه 』─── ◈\n\n⚠️ سيدي، يرجى كتابة اسم الأغنية لكي أبحث لك عنها.\n\n◈ ──────────────── ◈`, threadID, messageID);
  }

  api.sendMessage(`◈ ───『 الـمـكتبة الـمـوسـيقـية 』─── ◈\n\n🔍 جاري البحث عن كلمات الأغنية في الأرشيف الملكي..\n\n◈ ──────────────── ◈`, threadID, messageID);

  try {
    const res = await axios.get(`https://api.popcat.xyz/lyrics?song=${encodeURIComponent(songName)}`);
    const data = res.data;

    if (data.error) throw new Error("لم يتم العثور على الأغنية");

    const imagePath = __dirname + `/cache/lyrics_${senderID}.png`;

    let callback = async function() {
      // منح مكافأة التقشف
      await Currencies.increaseMoney(senderID, reward);

      let msg = `◈ ───『 سـجـل الأغـانـي 』─── ◈\n\n` +
                `🎵 الاسم: ${data.title}\n` +
                `👤 الفنان: ${data.artist}\n\n` +
                `📜 الكلمات:\n${data.lyrics}\n\n` +
                `💰 مـنـحـة الـتقـشـف: +${reward}$\n` +
                ` ———————————————\n` +
                `│←› الـمـقـدم: الـتـوب ايـمـن 👑\n` +
                `◈ ──────────────── ◈`;

      return api.sendMessage({
        body: msg,
        attachment: fs.createReadStream(imagePath)
      }, threadID, () => fs.unlinkSync(imagePath), messageID);
    };

    return request(encodeURI(data.image))
      .pipe(fs.createWriteStream(imagePath))
      .on("close", callback);

  } catch (err) {
    return api.sendMessage(`⚠️ عذراً سيدي، لم أجد هذه الأغنية في مكتبتي، تأكد من الاسم.`, threadID, messageID);
  }
};
