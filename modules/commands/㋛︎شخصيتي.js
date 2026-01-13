module.exports.config = {
  name: "شخصيتي",
  version: "2.5.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "اكتشف من هي شخصية الأنمي التي تشبهك مقابل 500$",
  commandCategory: "صور",
  usages: "شخصيتي",
  cooldowns: 5,
  dependencies: {
    "axios": "",
    "fs-extra": ""
  }
};

module.exports.run = async ({ api, event, Users, Currencies }) => {
  const axios = require("axios");
  const fs = require("fs-extra");
  const { threadID, messageID, senderID } = event;

  const EMPEROR_ID = "61577861540407"; // أيدي الإمبراطور أيمن

  // قائمة الشخصيات الأسطورية (تمت الزيادة)
  const links = [
    "https://i.imgur.com/RRnddBS.jpg", "https://i.imgur.com/4av6OnG.jpg", "https://i.imgur.com/bID48JU.jpg",
    "https://i.imgur.com/Kkc5CZs.jpg", "https://i.imgur.com/T9WwPxL.jpg", "https://i.imgur.com/R7trNF3.jpg",
    "https://i.imgur.com/pp3L51v.jpg", "https://i.imgur.com/nmTpfIV.jpg", "https://i.imgur.com/G7Cmlm5.jpg",
    "https://i.imgur.com/gyk1KTE.jpg", "https://i.imgur.com/0C40VMA.jpg", "https://i.imgur.com/b0YCfBO.jpg",
    "https://i.imgur.com/EF63R6y.jpg", "https://i.imgur.com/uaBmGDh.jpg", "https://i.imgur.com/J68g1dP.jpg",
    "https://i.imgur.com/co4wnOI.jpg", "https://i.imgur.com/rcXzlbD.jpg", "https://i.imgur.com/4K2Lx2E.jpg",
    "https://i.imgur.com/d9KlCjt.jpg", "https://i.imgur.com/KriNOKQ.jpg", "https://i.imgur.com/phrVQXt.jpg",
    "https://i.imgur.com/5j3cTq5.jpg", "https://i.imgur.com/Ot3QVTg.jpg", "https://i.imgur.com/QHZN13e.jpg",
    "https://i.imgur.com/SdO0pM9.jpg", "https://i.imgur.com/ci4PEdV.jpg", "https://i.imgur.com/wJ8Xf7y.jpg",
    "https://i.imgur.com/tWAcRGP.jpg", "https://i.imgur.com/BAydztZ.jpg", "https://i.imgur.com/vMNBrY3.jpg",
    "https://i.imgur.com/h2bGRek.jpg", "https://i.imgur.com/Sg3Ai4Y.jpg", "https://i.imgur.com/KFdJypu.jpg",
    "https://i.imgur.com/PChQ6Ea.jpg", "https://i.imgur.com/pekp4LZ.jpg", "https://i.imgur.com/uKmiejK.jpg",
    "https://i.imgur.com/pXUtKtB.jpg", "https://i.imgur.com/Foi1zGB.jpg", "https://i.imgur.com/iQ3DWx5.jpg",
    "https://i.imgur.com/r8yrFRw.jpg", "https://i.imgur.com/4PqzyWP.jpg", "https://i.imgur.com/vHq0L9m.jpg",
    "https://i.imgur.com/O6S9E9m.jpg", "https://i.imgur.com/4N3m7kC.jpg"
  ];

  // شخصيات فخمة جداً مخصصة للإمبراطور فقط
  const emperorLinks = [
    "https://i.imgur.com/8N6G5X6.jpg", // مادارا
    "https://i.imgur.com/vHq0L9m.jpg", // لوفي (ملك القراصنة)
    "https://i.imgur.com/O6S9E9m.jpg", // ايتاتشي
    "https://i.imgur.com/zM5oR6B.jpg"  // ناروتو (الشهاب)
  ];

  const userData = await Currencies.getData(senderID);
  const money = userData.money;

  if (money < 500 && senderID !== EMPEROR_ID) {
    return api.sendMessage("◈ ───『 عـجز مـالـي 』─── ◈\n\n◯ لـن أعـطـيـك هـويـتـك الـأنـمـيـة مـجـانـاً.\n◉ تـحـتـاج إلـى 500 دولـار لـكـشـف الـقـناع.\n———————————————\n│←› بـأوامـر: الـتـوب أيـمـن 👑", threadID, messageID);
  }

  try {
    api.setMessageReaction("🎭", messageID, () => {}, true);
    
    // اختيار الرابط: إذا كان المستخدم هو أيمن يأخذ من قائمة الفخامة، وإلا فعشوائي
    const finalLinks = (senderID === EMPEROR_ID) ? emperorLinks : links;
    const randomLink = finalLinks[Math.floor(Math.random() * finalLinks.length)];
    const path = __dirname + `/cache/anime_char_${senderID}.png`;
    
    const response = await axios.get(randomLink, { responseType: "arraybuffer" });
    fs.writeFileSync(path, Buffer.from(response.data, "utf-8"));

    if (senderID !== EMPEROR_ID) {
      await Currencies.setData(senderID, { money: money - 500 });
    }

    const userName = await Users.getNameUser(senderID);
    const msg = (senderID === EMPEROR_ID) 
      ? `◈ ──『 هـويـة الإمـبـراطـور أيـمـن 』── ◈\n\n◯ سـيـدي، أنـت تـشـبـه أعـظـم الـقـادة فـي الـأنـمـي.\n✨ الـتـنـاسـق مـثـالـي مـع عـظـمـتـك!` 
      : `◈ ───『 كـشـف الـهـويـة 🎭 』─── ◈\n\n◯ لـو كـان [ ${userName} ] شـخـصيـة أنـمـي سـيـكـون هـذا:\n💰 الـتـكـلـفـة: 500 دولـار\n———————————————\n│←› بـأوامـر: الـتـوب أيـمـن 👑`;

    return api.sendMessage({
      body: msg,
      attachment: fs.createReadStream(path)
    }, threadID, () => fs.unlinkSync(path), messageID);

  } catch (error) {
    return api.sendMessage("⚠️ عذراً سيدي، السيرفر يرفض كشف الهوية حالياً.", threadID, messageID);
  }
};
