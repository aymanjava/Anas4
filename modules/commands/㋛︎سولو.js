module.exports.config = {
  name: "سولو",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "عرض صور فخمة لسيونغ جين وو (Solo Leveling) مقابل 1000$",
  commandCategory: "صور",
  usages: "سولو",
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

  // قائمة الروابط الإمبراطورية (تمت الزيادة والتحديث)
  const links = [
    "https://i.imgur.com/JzD3mQl.jpg", "https://i.imgur.com/369Tq3O.jpg", "https://i.imgur.com/AH9gg98.jpg",
    "https://i.imgur.com/FIDuvIi.jpg", "https://i.imgur.com/C61We3b.jpg", "https://i.imgur.com/zdcWnlY.jpg",
    "https://i.imgur.com/L0icntQ.jpg", "https://i.imgur.com/WZWotoh.jpg", "https://i.imgur.com/XlOk8aU.jpg",
    "https://i.imgur.com/Jf7ozp7.jpg", "https://i.imgur.com/ImbKH3u.jpg", "https://i.imgur.com/P9KmE98.jpg",
    "https://i.imgur.com/EIIx794.jpg", "https://i.imgur.com/6k1AHsE.jpg", "https://i.imgur.com/f1R10MH.jpg",
    "https://i.imgur.com/gDu4xsh.jpg", "https://i.imgur.com/dxDy6ur.jpg", "https://i.imgur.com/ycbDmIg.jpg",
    "https://i.imgur.com/9QnZUEj.jpg", "https://i.imgur.com/9p3xS9w.jpg", "https://i.imgur.com/C1LG8PR.jpg",
    "https://i.imgur.com/BRMcREV.jpg", "https://i.imgur.com/kORGYWE.jpg", "https://i.imgur.com/GRdfr88.jpg",
    "https://i.imgur.com/AmRHDRI.jpg", "https://i.imgur.com/qndy2vt.jpg", "https://i.imgur.com/PJ6Jbpr.jpg",
    "https://i.imgur.com/sj8XDZd.jpg", "https://i.imgur.com/cP8tn2n.jpg", "https://i.imgur.com/wsITRnl.jpg",
    "https://i.imgur.com/3X0cMYL.jpg", "https://i.imgur.com/jjWuimP.jpg", "https://i.imgur.com/ZswHUu9.jpg",
    "https://i.imgur.com/iEZLN8Y.jpg", "https://i.imgur.com/XcnNfp8.jpg", "https://i.imgur.com/AYsEROt.jpg",
    "https://i.imgur.com/I0vRumm.jpg", "https://i.imgur.com/JnebPMe.jpg", "https://i.imgur.com/eI6cmju.jpg",
    "https://i.imgur.com/CvfY6Bg.jpg", "https://i.imgur.com/Ix9y8S4.jpg", "https://i.imgur.com/SFB88n0.jpg",
    "https://i.imgur.com/Aevi5C6.jpg", "https://i.imgur.com/4urNqgC.jpg", "https://i.imgur.com/AvuHexb.jpg",
    "https://i.imgur.com/nUeUN8I.jpg", "https://i.imgur.com/0sBzBBJ.jpg", "https://i.imgur.com/JAoQJnG.jpg",
    "https://i.imgur.com/W0B15lM.jpg", "https://i.imgur.com/Tg8SlCV.jpg", "https://i.imgur.com/4XOpPeo.jpg",
    "https://i.imgur.com/AivQLkj.jpg", "https://i.imgur.com/9Yj369l.jpg", "https://i.imgur.com/MV30fhB.jpg",
    "https://i.imgur.com/V3zIljn.jpg", "https://i.imgur.com/gJfBNhd.jpg", "https://i.imgur.com/77xEQsr.jpg",
    "https://i.imgur.com/yPQc4l4.jpg", "https://i.imgur.com/Uzt153a.jpg", "https://i.imgur.com/WSPxlxG.jpg",
    "https://i.imgur.com/4UW3TXd.jpg", "https://i.imgur.com/WSwkZxh.jpg", "https://i.imgur.com/5t7agA6.jpg",
    "https://i.imgur.com/gXifRTr.jpg", "https://i.imgur.com/zPYWraJ.jpg", "https://i.imgur.com/LS2Mrip.jpg",
    "https://i.imgur.com/cpFqQ3W.jpg", "https://i.imgur.com/RQH8qmt.jpg", "https://i.imgur.com/hf3Rhze.jpg",
    "https://i.imgur.com/xstbOcs.jpg", "https://i.imgur.com/pRyRIGg.jpg", "https://i.imgur.com/qbUJX16.jpg",
    "https://i.imgur.com/Q2QmmKb.jpg", "https://i.imgur.com/Iy8Vx5k.jpg", "https://i.imgur.com/npM0Xdb.jpg",
    "https://i.imgur.com/MEtmekx.jpg", "https://i.imgur.com/cXmQRmg.jpg", "https://i.imgur.com/TPUIPRR.jpg",
    "https://i.imgur.com/PeiwI2t.jpg", "https://i.imgur.com/17GMswS.jpg", "https://i.imgur.com/RJkM2q8.jpg",
    "https://i.imgur.com/HgkaToY.jpg", "https://i.imgur.com/XVUxQ8y.jpg", "https://i.imgur.com/6BDGDKB.jpg",
    "https://i.imgur.com/1kOKsDs.jpg", "https://i.imgur.com/qEJjOVS.jpg", "https://i.imgur.com/AV1WGv7.jpg",
    "https://i.imgur.com/DeZyBAI.jpg", "https://i.imgur.com/uyMJ4ii.jpg", "https://i.imgur.com/DfJwZxb.jpg",
    "https://i.imgur.com/6TRBqrr.jpg", "https://i.imgur.com/SzXyrqM.jpg", "https://i.imgur.com/GrpESrg.jpg",
    "https://i.imgur.com/AryAjiJ.jpg", "https://i.imgur.com/KuZegUX.jpg", "https://i.imgur.com/14bpaXY.jpg",
    // إضافة روابط جديدة قوية
    "https://i.imgur.com/8N6G5X6.jpg", "https://i.imgur.com/rN4mP4A.jpg", "https://i.imgur.com/vHq0L9m.jpg",
    "https://i.imgur.com/zM5oR6B.jpg", "https://i.imgur.com/uP1D5lK.jpg", "https://i.imgur.com/O6S9E9m.jpg"
  ];

  const userData = await Currencies.getData(senderID);
  const money = userData.money;

  if (money < 1000) {
    return api.sendMessage("◈ ───『 عـجز مـالـي 』─── ◈\n\n◯ جين وو لا يظهر للضعفاء ماديًا سيدي.\n◉ تـحـتـاج إلـى 1000$ لـرؤيـة هـذا الـفـخـامـة.\n———————————————\n│←› بـأوامـر: الـتـوب أيـمـن 👑", threadID, messageID);
  }

  try {
    const randomLink = links[Math.floor(Math.random() * links.length)];
    const path = __dirname + `/cache/solo_${senderID}.png`;
    
    const response = await axios.get(randomLink, { responseType: "arraybuffer" });
    fs.writeFileSync(path, Buffer.from(response.data, "utf-8"));

    // خصم الـ 1000 دولار
    await Currencies.setData(senderID, { money: money - 1000 });

    const msg = `◈ ───『 جـيـن وو الـعـظـيـم 🗡️ 』─── ◈\n\n◯ تـفـضـل سـيدي، إحـدى أرقى صـور الـسـولو.\n💰 الـتـكـلـفـة: 1000$\n📊 الـمـخـزون: ${links.length} صـورة\n———————————————\n│←› بـأوامـر: الـتـوب أيـمـن 👑`;

    return api.sendMessage({
      body: msg,
      attachment: fs.createReadStream(path)
    }, threadID, () => fs.unlinkSync(path), messageID);

  } catch (error) {
    return api.sendMessage("⚠️ عذراً سيدي، السيرفر يواجه ضغطاً في استدعاء الظلال.", threadID, messageID);
  }
};
