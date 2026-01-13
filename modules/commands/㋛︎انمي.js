module.exports.config = {
  name: "انمي",
  version: "2.5.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "اقتراحات أنمي إمبراطورية عشوائية بجودة HD",
  commandCategory: "ترفيه",
  usages: " ",
  cooldowns: 5,
  dependencies: {
      "axios": "",
      "fs-extra": ""
  }
};

module.exports.run = async ({ api, event, Currencies }) => {
  const axios = require("axios");
  const fs = require("fs-extra");
  const { threadID, messageID, senderID } = event;

  // 🌟 قائمة ضخمة ومنوعة من اقتراحات الأنمي (روابط مباشرة بجودة عالية)
  const animeImages = [
    "https://i.imgur.com/7Igy9Gx.png", "https://i.imgur.com/RzqMjeX.png", "https://i.imgur.com/vnFHbIM.png",
    "https://i.imgur.com/gsoou4a.png", "https://i.imgur.com/T1v9j7b.png", "https://i.imgur.com/OZRYY3g.png",
    "https://i.imgur.com/DBW1EEn.png", "https://i.imgur.com/ljCSZoO.png", "https://i.imgur.com/ulgfKma.png",
    "https://i.imgur.com/pYcfLna.png", "https://i.imgur.com/wn17fDi.png", "https://i.imgur.com/16o7E9o.png",
    "https://i.imgur.com/YGZLoC5.png", "https://i.imgur.com/UPxK6Dh.png", "https://i.imgur.com/6AoJ67h.png",
    "https://i.imgur.com/oEogoDj.png", "https://i.imgur.com/Kub8Cbq.png", "https://i.imgur.com/igDXTw8.png",
    "https://i.imgur.com/BNPkxUe.png", "https://i.imgur.com/q59UneJ.png", "https://i.imgur.com/EMvZMij.png",
    "https://i.imgur.com/1ktsYZI.png", "https://i.imgur.com/Lt5PDuX.png", "https://i.imgur.com/432WO10.png",
    "https://i.imgur.com/qU42gAs.png", "https://i.imgur.com/UaoTDy4.png", "https://i.imgur.com/ehRBBYR.png",
    "https://i.imgur.com/hyfBRha.png", "https://i.imgur.com/hArtSkk.png", "https://i.imgur.com/p7xefuo.png",
    "https://i.imgur.com/wl4Ga6o.png", "https://i.imgur.com/VS8vu5A.png", "https://i.imgur.com/EA3Mx66.png",
    "https://i.imgur.com/2C680hc.png", "https://i.imgur.com/aWF6CWn.png", "https://i.imgur.com/l0j838L.png",
    "https://i.imgur.com/uPLDDzo.png", "https://i.imgur.com/MjkDxCu.png", "https://i.imgur.com/cs8yJvG.png",
    "https://i.imgur.com/Z6qqbwY.png", "https://i.imgur.com/k5oHtrW.png", "https://i.imgur.com/Iyte9Pb.png",
    "https://i.imgur.com/SjjkQBb.png", "https://i.imgur.com/uvPGlxd.png", "https://i.imgur.com/J8lUuN7.png",
    "https://i.imgur.com/CkNatzu.png", "https://i.imgur.com/TvhNcQ0.png", "https://i.imgur.com/V0P09B9.png",
    "https://i.imgur.com/6EyWX0O.png", "https://i.imgur.com/fMFKoZ2.png", "https://i.imgur.com/KaskMM1.png",
    "https://i.imgur.com/wvHyk6i.png", "https://i.imgur.com/mcPpCWu.png", "https://i.imgur.com/zdvEKEj.png",
    "https://i.imgur.com/5mLIDAM.png", "https://i.imgur.com/0Y7LDq8.png", "https://i.imgur.com/20irZwl.png",
    "https://i.imgur.com/44TGlM9.png", "https://i.imgur.com/ZSlCWrx.png", "https://i.imgur.com/vH9XkL7.jpg",
    "https://i.imgur.com/p6HId9p.jpg", "https://i.imgur.com/9n9uBof.jpg", "https://i.imgur.com/L1pEayR.jpg",
    "https://i.imgur.com/vXyY7Gf.jpg", "https://i.imgur.com/K3pWpXk.jpg", "https://i.imgur.com/7YfE7hI.jpg",
    "https://i.imgur.com/y690xJv.jpg", "https://i.imgur.com/5qG4I2O.jpg", "https://i.imgur.com/8mR4TIn.jpg"
  ];

  api.sendMessage("◈ ───『 جـاري اخـتيار أنـمي.. 』─── ◈", threadID, messageID);

  try {
    const randomAnime = animeImages[Math.floor(Math.random() * animeImages.length)];
    const path = __dirname + `/cache/anime_${senderID}.png`;
    
    const imageBuffer = (await axios.get(randomAnime, { responseType: 'arraybuffer' })).data;
    fs.writeFileSync(path, Buffer.from(imageBuffer, 'utf-8'));

    // منح مكافأة بسيطة لمشاهد الأنمي
    await Currencies.increaseMoney(senderID, 20);

    const msg = {
      body: `◈ ───『 اقـتراح إمـبـراطـوري 』─── ◈\n\n◯ سـيدي، إليـك هـذا الأنـمي الـرهيب:\n◉ لـجودة أفـضل اضـغط عـلى الـصورة.\n———————————————\n💰 مـكافأة الـمـشاهدة: +20$\n———————————————\n◈ ─────────────── ◈\n│←› بـأوامـر: الـتـوب أيـمـن 👑`,
      attachment: fs.createReadStream(path)
    };

    return api.sendMessage(msg, threadID, () => fs.unlinkSync(path), messageID);

  } catch (error) {
    return api.sendMessage("⚠️ سيدي، فشلت في جلب الأنمي، يبدو أن السيرفرات تحت الصيانة.", threadID, messageID);
  }
};
