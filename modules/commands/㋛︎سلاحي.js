module.exports.config = {
  name: "سلاحي",
  version: "2.1.0", 
  hasPermssion: 0,
  credits: "Ayman",
  description: "مواجهة الزومبي مع نظام الربح والخسارة الملكي",
  commandCategory: "ترفية", 
  usages: "", 
  cooldowns: 5,
  dependencies: {
    "request": "",
    "fs-extra": "",
    "axios": ""
  }
};

module.exports.run = async function({ api, event, Users, Currencies }) {
  const axios = require("axios");
  const request = require("request");
  const fs = require("fs-extra");
  const { threadID, messageID, senderID } = event;
  const isTop = global.config.ADMINBOT.includes(senderID);
  
  const entryFee = 300; // رسوم دخول المعركة (صرف)
  const deathPenalty = 1000; // غرامة الموت (خسارة)

  // نظام الصرف قبل بدء المعركة
  let userData = await Currencies.getData(senderID);
  let money = userData.money || 0;

  if (!isTop && money < entryFee) {
    return api.sendMessage(`◈ ───『 الـخـزيـنـة 』─── ◈\n\n⚠️ سيدي، لا تملك ${entryFee}$ لتجهيز سلاحك. الزومبي سيسحقونك وأنت مفلس!\n\n◈ ──────────────── ◈`, threadID, messageID);
  }

  if (!isTop) await Currencies.decreaseMoney(senderID, entryFee);

  var zombieCount = Math.floor(Math.random() * 101);
  var ammoCount = Math.floor(Math.random() * 101);
  var survivalRate = Math.floor(Math.random() * 101);
  var name = (await Users.getData(senderID)).name;

  var links = [
    "https://pubgarabia.com/wp-content/uploads/2018/10/pubg_weapon_m416_1-1024x517.jpg",
    "https://cdni.rt.com/media/pics/2013.12/orig/670358.jpg",
    "https://png.pngtree.com/png-vector/20210313/ourlarge/pngtree-shoes-rubber-flip-flops-daily-necessities-household-png-image_3052390.jpg",
    "https://www.oqily.com/image/cache/catalog/Product-2019/Shoes/%D9%86%D8%B9%D8%A7%D9%84-sl-0079-3-1000x1000.jpg",
    "https://static1-arabia.millenium.gg/articles/7/14/37/@/8163-68712-1188612-m4a1-orig-1-orig-2-amp_main_img-1.png"
  ];

  var pathImg = __dirname + "/cache/weapon.jpg";
  var drawLink = links[Math.floor(Math.random() * links.length)];

  var callback = async () => {
    let resultMsg = "";
    
    // نظام الخسارة بناءً على نسبة النجاة
    if (!isTop && survivalRate < 30) {
      await Currencies.decreaseMoney(senderID, deathPenalty);
      resultMsg = `💀 لـقـد قُـتـلـت فـي الـمـعـركـة!\n💸 خـسـارة إضـافـيـة: -${deathPenalty}$ (تـعـويـضات)`;
    } else {
      resultMsg = `🔥 لـقـد صـمـدت بـبـسـالـة!\n💰 الـحـالـة: نـاجٍ مـن الـمـوت`;
    }

    let msg = `◈ ───『 سـاحـة الـمـعـركـة 』─── ◈\n\n` +
              `👤 الـمـقـاتـل: ${name}\n` +
              `🧟 عـدد الـزومـبـي: ${zombieCount}\n` +
              `🔫 الـذخـيـرة: ${ammoCount} طـلـقـة\n` +
              `📈 نـسـبـة الـنـجـاة: ${isTop ? "100%" : survivalRate + "%"}\n` +
              `🛡️ الـسـلاح الـمُـسـتـخدم: أدناه\n\n` +
              `————————————————\n` +
              `${isTop ? "👑 الـتـوب لا يـمـوت أبـداً!" : resultMsg}\n` +
              `│←› بـإدارة الـتـوب ايـمـن 👑\n` +
              `◈ ──────────────── ◈`;

    api.sendMessage({ body: msg, attachment: fs.createReadStream(pathImg) }, threadID, () => fs.unlinkSync(pathImg), messageID);
  };

  return request(encodeURI(drawLink)).pipe(fs.createWriteStream(pathImg)).on("close", () => callback());
};
