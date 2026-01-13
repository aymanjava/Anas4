const axios = require("axios");
const request = require("request");
const fs = require("fs-extra");

module.exports.config = {
  name: "طوكيو",
  version: "2.1.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "عرض صور عصابة طوكيو مع منحة تقشفية من الخزينة",
  commandCategory: "صور",
  usages: "",
  cooldowns: 5,
  dependencies: {
    "request": "",
    "fs-extra": "",
    "axios": ""
  }
};

module.exports.run = async ({ api, event, Currencies }) => {
  const { threadID, messageID, senderID } = event;
  const reward = 3; // قمة التقشف (3 دولارات فقط سيدي كما أمرت)

  const links = [
    "https://i.imgur.com/ho235f3.jpg", "https://i.imgur.com/79gtJRN.jpeg",
    "https://i.imgur.com/rNGNE2z.jpeg", "https://i.imgur.com/fRsfqi1.jpeg",
    "https://i.imgur.com/zbpxrME.jpeg", "https://i.imgur.com/Uuaslo8.jpeg",
    "https://i.imgur.com/gCn31eH.jpeg", "https://i.imgur.com/1Mf7gN8.jpeg",
    "https://i.imgur.com/Eacbowm.jpeg", "https://i.imgur.com/ElbhzDg.jpeg",
    "https://i.imgur.com/ZbBMmzr.png", "https://i.imgur.com/WC20Ko8.jpeg",
    "https://i.imgur.com/PU6FLZR.jpeg", "https://i.imgur.com/Kkgy2EW.jpeg",
    "https://i.imgur.com/lZDwumq.png", "https://i.imgur.com/DUvurgk.png",
    "https://i.imgur.com/zdKILzU.jpeg", "https://i.imgur.com/z2iVuwC.jpeg",
    "https://i.imgur.com/aqS5AjN.jpeg", "https://i.imgur.com/KBDGUMM.jpeg",
    "https://i.imgur.com/XSsEGQl.jpeg", "https://i.imgur.com/nujMCoy.jpeg",
    "https://i.imgur.com/UQMD9SC.jpeg", "https://i.imgur.com/JpBFjfQ.jpeg",
    "https://i.imgur.com/WhTye56.jpeg", "https://i.imgur.com/ESDmvUn.jpeg",
    "https://i.imgur.com/eMBfwgo.jpeg", "https://i.imgur.com/2xtvsur.jpeg",
    "https://i.imgur.com/th8WNHT.jpeg", "https://i.imgur.com/Nruo2nh.jpeg",
    "https://i.imgur.com/ei7zFjf.jpeg", "https://i.imgur.com/1TgOpJB.jpeg",
    "https://i.imgur.com/LWZIALy.jpeg", "https://i.imgur.com/yIeGgrW.jpeg",
    "https://i.imgur.com/FEy8S16.jpeg", "https://i.imgur.com/o5QnRbx.jpeg",
    "https://i.imgur.com/9NqRfBe.jpeg", "https://i.imgur.com/U3i741w.jpeg",
    "https://i.imgur.com/teF7vuY.jpeg", "https://i.imgur.com/0qCKrsx.jpeg",
    "https://i.imgur.com/p3NOmIL.jpeg", "https://i.imgur.com/B8Itg5d.jpeg",
    "https://i.imgur.com/D9SebFJ.jpeg", "https://i.imgur.com/y4BvtRS.png",
    "https://i.imgur.com/Me0nrmK.jpeg", "https://i.imgur.com/y5StmTj.jpeg",
    "https://i.imgur.com/jExqqu0.jpeg", "https://i.imgur.com/6J0tQf.jpeg",
    "https://i.imgur.com/TlHTeN7.jpg", "https://i.imgur.com/eZRFmSz.jpeg",
    "https://i.imgur.com/rcOTulF.jpeg", "https://i.imgur.com/QOBWQGO.jpeg",
    "https://i.imgur.com/HBk0U8M.jpeg", "https://i.imgur.com/uH6JUVW.jpeg",
    "https://i.imgur.com/PCd0ogv.jpeg", "https://i.imgur.com/pIZNKAa.jpeg",
    "https://i.imgur.com/0tgOmcm.jpg"
  ];

  const randomLink = links[Math.floor(Math.random() * links.length)];
  const cachePath = __dirname + `/cache/tokyo_${senderID}.jpg`;

  const callback = async () => {
    // منح المكافأة التقشفية
    await Currencies.increaseMoney(senderID, reward);

    let msg = `◈ ───『 عـصـابـة طـوكـيـو 』─── ◈\n\n` +
              `🔥 تـم اسـتـخراج الـصورة مـن الأرشـيـف.\n` +
              `💰 مـنـحة الـتـقشـف: +${reward}$\n` +
              ` ———————————————\n` +
              `│←› الـقـائد: الـتـوب ايـمـن 👑\n` +
              `◈ ──────────────── ◈`;

    api.sendMessage({
      body: msg,
      attachment: fs.createReadStream(cachePath)
    }, threadID, () => fs.unlinkSync(cachePath), messageID);
  };

  return request(encodeURI(randomLink))
    .pipe(fs.createWriteStream(cachePath))
    .on("close", callback);
};
