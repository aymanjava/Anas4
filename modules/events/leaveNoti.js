module.exports.config = {
  name: "leaveNoti",
  eventType: ["log:unsubscribe"],
  version: "1.0.0",
  credits: "HĐGN",
  description: "إشعار مغادرة معرب ومزخرف",
  dependencies: {
    "fs-extra": "",
    "path": ""
  }
};

const checkttPath = __dirname + '/../commands/tuongtac/checktt/'

module.exports.onLoad = function () {
    const { existsSync, mkdirSync } = global.nodemodule["fs-extra"];
    const { join } = global.nodemodule["path"];
    const path = join(__dirname, "cache", "leaveGif", "randomgif");
    if (!existsSync(path)) mkdirSync(path, { recursive: true });
    return;
}

module.exports.run = async function ({ api, event, Users, Threads }) {
    if (event.logMessageData.leftParticipantFbId == api.getCurrentUserID()) return;
    const { createReadStream, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } = global.nodemodule["fs-extra"];
    const { join } = global.nodemodule["path"];
    const { threadID } = event;
    const moment = require("moment-timezone");
    const time = moment.tz("Asia/Baghdad").format("DD/MM/YYYY || HH:mm:s");
    const hours = moment.tz("Asia/Baghdad").format("HH");
    const data = global.data.threadData.get(parseInt(threadID)) || (await Threads.getData(threadID)).data;
    const iduser = event.logMessageData.leftParticipantFbId;
    const name = global.data.userName.get(iduser) || await Users.getNameUser(iduser);
    
    // تعريب الحالات
    const type = (event.author == iduser) ? "غادر المجموعة" : "تم طرده من قبل المسؤول";
    
    const path = join(__dirname, "cache", "leaveGif","randomgif");
    const pathGif = join(path, `${threadID}`);
    var msg, formPush

    if (existsSync(checkttPath + threadID + '.json')) {
        const threadData = JSON.parse(readFileSync(checkttPath + threadID + '.json'));
        const userData_total_index = threadData.total.findIndex(e => e.id == iduser);
        if (userData_total_index != -1) threadData.total.splice(userData_total_index, 1);
        writeFileSync(checkttPath + threadID + '.json', JSON.stringify(threadData, null, 4));
    }

    // العبارة المعربة والمزخرفة
    (typeof data.customLeave == "undefined") ? 
    msg = "╭─────────────╮\n" +
          "    💎 وداعـاً [ {name} ]\n" +
          "    ✨ الـحـالـة: {type}\n" +
          "╰─────────────╯\n" +
          "⏰ الـوقـت: {time}" : msg = data.customLeave;

    msg = msg
      .replace(/\{iduser}/g, iduser)
      .replace(/\{name}/g, name)
      .replace(/\{type}/g, type)
      .replace(/\{session}/g, hours <= 10 ? "صباحاً" : hours > 10 && hours <= 12 ? "ظهراً" : hours > 12 && hours <= 18 ? "عصراً" : "مساءً")
      .replace(/\{time}/g, time);  

    const randomPath = readdirSync(join(__dirname, "cache", "leaveGif", "randomgif"));

    if (existsSync(pathGif)) formPush = { body: msg, attachment: createReadStream(pathGif) }
    else if (randomPath.length != 0) {
      const pathRandom = join(__dirname, "cache", "leaveGif", "randomgif",`${randomPath[Math.floor(Math.random() * randomPath.length)]}`);
      formPush = { body: msg, attachment: createReadStream(pathRandom) }
    }
    else formPush = { body: msg }

    return api.sendMessage(formPush, threadID);
}
