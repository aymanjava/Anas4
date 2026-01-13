module.exports.config = {
  name: "شخصيات",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "لعبة تخمين اسم شخصية الأنمي من الصورة",
  usages: "شخصيات",
  commandCategory: "العاب",
  cooldowns: 5,
  dependencies: {
    "axios": "",
    "fs-extra": ""
  }
};

const fs = require('fs-extra');
const axios = require('axios');

module.exports.handleReply = async function ({ api, event, handleReply, Currencies, Users }) {
  const { body, senderID, threadID, messageID } = event;
  const { correctAnswer, name } = handleReply;

  if (name !== this.config.name) return;

  const userAnswer = body.trim().toLowerCase();
  const cleanCorrectAnswer = correctAnswer.toLowerCase();

  if (userAnswer === cleanCorrectAnswer) {
    const userName = await Users.getNameUser(senderID);
    await Currencies.increaseMoney(senderID, 100); // زيادة الجائزة لـ 100$
    
    api.unsendMessage(handleReply.messageID);
    return api.sendMessage(`◈ ───『 فـوز مـلـكـي 🏆 』─── ◈\n\n◯ أحـسـنـت يـا ${userName}!\n◉ الإجـابـة الـصـحـيـحـة: ${correctAnswer}\n💰 الـجـائـزة: 100 دولـار\n———————————————\n│←› بـأوامـر: الـتـوب أيـمـن 👑`, threadID, messageID);
  } else {
    return api.sendMessage(`❌ خطأ! حاول مجدداً يا بطل أو انتظر سؤالاً آخر.`, threadID, messageID);
  }
};

module.exports.run = async function ({ api, event }) {
  const { threadID, messageID } = event;

  const questions = [
    { image: "https://i.imgur.com/yrEx6fs.jpg", answer: "كورومي" },
    { image: "https://i.imgur.com/cAFukZB.jpg", answer: "الينا" },
    { image: "https://i.pinimg.com/236x/63/c7/47/63c7474adaab4e36525611da528a20bd.jpg", answer: "فوليت" },
    { image: "https://i.pinimg.com/236x/b3/cd/6a/b3cd6a25d9e3451d68628b75da6b2d9e.jpg", answer: "ليفاي" },
    { image: "https://i.pinimg.com/236x/eb/a1/c6/eba1c6ed1611c3332655649ef405490a.jpg", answer: "مايكي" },
    { image: "https://i.pinimg.com/236x/34/81/ba/3481ba915d12d27c1b2a094cb3369b4c.jpg", answer: "كاكاشي" },
    { image: "https://i.pinimg.com/236x/3a/df/87/3adf878c1b6ef2a90ed32abf674b780c.jpg", answer: "ميدوريا" },
    { image: "https://i.pinimg.com/564x/d2/c0/42/d2c042eeb8a92713b3f6e0a6dba2c353.jpg", answer: "وين" },
    { image: "https://i.pinimg.com/236x/f6/85/2b/f6852bfa6a09474771a17aca9018852e.jpg", answer: "نينم" },
    { image: "https://i.pinimg.com/236x/b6/0e/36/b60e36d13d8c11731c85b73e89f63189.jpg", answer: "هانكو" },
    { image: "https://i.pinimg.com/236x/bd/9d/5a/bd9d5a5040e872d4ec9e9607561e22da.jpg", answer: "زيرو تو" },
    { image: "https://i.pinimg.com/236x/5f/e8/f3/5fe8f3b46a33de8ce98927e95e804988.jpg", answer: "ايروين" },
    { image: "https://i.pinimg.com/474x/ab/3f/5e/ab3f5ec03eb6b18d2812f8c13c62bb92.jpg", answer: "تودروكي" },
    { image: "https://i.pinimg.com/236x/26/6e/8d/266e8d8e9ea0a9d474a8316b9ed54207.jpg", answer: "غوجو" },
    { image: "https://i.pinimg.com/474x/e5/2f/a3/e52fa34886b53184b767b04c70ce0885.jpg", answer: "دازاي" },
    { image: "https://i.pinimg.com/236x/03/af/3e/03af3e2769811b62eb75f1a8e63affe5.jpg", answer: "فوتوبا" },
    { image: "https://i.pinimg.com/236x/7f/38/6c/7f386c4afed64d0055205452091a313e.jpg", answer: "سيستا" },
    { image: "https://i.pinimg.com/236x/96/88/1e/96881ef27cbfce1071ff135b5a7e1fc7.jpg", answer: "نيزكو" },
    { image: "https://i.pinimg.com/236x/8a/c8/f9/8ac8f98dd946fefdae4e66020073e5ee.jpg", answer: "كيلوا" },
    { image: "https://i.pinimg.com/236x/e1/6a/5c/e16a5c5f91190ebf407ff3736135cb5a.jpg", answer: "كايل" },
    { image: "https://i.pinimg.com/236x/3b/b5/ef/3bb5efac247e16fe3fc30c9a7478cc07.jpg", answer: "ريوك" },
    { image: "https://i.imgur.com/8QO6Ito.jpg", answer: "ايرين" },
    { image: "https://i.imgur.com/vHq0L9m.jpg", answer: "لوفي" },
    { image: "https://i.imgur.com/rN4mP4A.jpg", answer: "زورو" },
    { image: "https://i.imgur.com/O6S9E9m.jpg", answer: "ايتاتشي" },
    { image: "https://i.imgur.com/zM5oR6B.jpg", answer: "ناروتو" },
    { image: "https://i.imgur.com/uP1D5lK.jpg", answer: "سانجي" },
    { image: "https://i.imgur.com/4N3m7kC.jpg", answer: "مادارا" },
    { image: "https://i.imgur.com/9k7YpT5.jpg", answer: "كيلوا" },
    { image: "https://i.imgur.com/5D6W8j9.jpg", answer: "كانيكي" },
    { image: "https://i.imgur.com/XpL9O2R.jpg", answer: "سايتاما" }
  ];

  const q = questions[Math.floor(Math.random() * questions.length)];
  const path = __dirname + `/cache/char_${threadID}.jpg`;

  try {
    const res = await axios.get(q.image, { responseType: "arraybuffer" });
    fs.writeFileSync(path, Buffer.from(res.data, "utf-8"));

    api.sendMessage({
      body: "◈ ───『 خـمـن الـشـخصيـة 🎭 』─── ◈\n\n◯ مـن هـذه الـشـخصـية فـي الـصورة؟\n◉ أجـب بـالـرد عـلى هـذه الـرسـالـة.\n———————————————\n│←› بـأوامـر: الـتـوب أيـمـن 👑",
      attachment: fs.createReadStream(path)
    }, threadID, (err, info) => {
      fs.unlinkSync(path);
      global.client.handleReply.push({
        name: this.config.name,
        messageID: info.messageID,
        correctAnswer: q.answer
      });
    }, messageID);
  } catch (e) {
    return api.sendMessage("⚠️ عذراً سيدي، هناك مشكلة في استدعاء الشخصيات.", threadID, messageID);
  }
};
