module.exports.config = {
  name: "joinNoti",
  eventType: ["log:subscribe"],
  version: "1.0.1",
  credits: "Mirai Team",
  description: "إشعار انضمام معرب ومزخرف",
  dependencies: {
    "fs-extra": ""
  }
};

module.exports.run = async function({ api, event, Users }) {
  const { threadID } = event;

  // عند دخول البوت للمجموعة
  if (event.logMessageData.addedParticipants.some(i => i.userFbId == api.getCurrentUserID())) {
    api.changeNickname(`[ ${global.config.PREFIX} ] • ${(!global.config.BOTNAME) ? "𝙃𝙄𝘽𝘼" : global.config.BOTNAME}`, threadID, api.getCurrentUserID());
    api.sendMessage(`╭─────────────╮\n    💎 تـم تـفـعـيـل الـبـوت بـنـجـاح\n╰─────────────╯`, threadID);
  } else {
    try {
      const { createReadStream, existsSync } = global.nodemodule["fs-extra"];
      const { threadName, participantIDs } = await api.getThreadInfo(threadID);

      const nameArray = [];
      const mentions = [];
      const memLength = [];
      let i = 0;

      for (const id in event.logMessageData.addedParticipants) {
        const userName = event.logMessageData.addedParticipants[id].fullName;
        nameArray.push(userName);
        mentions.push({ tag: userName, id });
        memLength.push(participantIDs.length - i++);

        if (!global.data.allUserID.includes(id)) {
          await Users.createData(id, { name: userName, data: {} });
          global.data.userName.set(id, userName);
          global.data.allUserID.push(id);
        }
      }
      memLength.sort((a, b) => a - b);

      const threadData = global.data.threadData.get(parseInt(threadID)) || {};
      let msg = "";

      // العبارة المعربة والمزخرفة
      if (typeof threadData.customJoin === "undefined") {
        msg = `╭─────────────╮\n    💎 أهـلاً بـك [ {name} ]\n    ✨ نـورت مـجـمـوعـة: [ {threadName} ]\n╰─────────────╯\n🔳 أنـت الـعـضـو رَقـم: [ {soThanhVien} ]\n🔳 بـواسطـة: [ {author} ]\n🔳 الـتـوقـيـت: [ {get} ]\n🔳 الـتـاريـخ: [ {bok} ]\n\n✨ نـتـمـنى لـك وقـتـاً مـمـتـعـاً ✨`;
      } else {
        msg = threadData.customJoin;
      }

      const getData = await Users.getData(event.author);
      const nameAuthor = typeof getData.name === "undefined" ? "رابط انضمام" : getData.name;

      const moment = require("moment-timezone");
      const time = moment.tz("Asia/Baghdad");
      const gio = time.format("HH");
      const bok = time.format("DD/MM/YYYY || HH:mm:ss");

      let get = "";
      if (gio >= 5 && gio < 11) get = "صباح الخير ☕";
      if (gio >= 11 && gio < 15) get = "وقت الظهيرة ☀️";
      if (gio >= 15 && gio < 19) get = "وقت المساء 🌆";
      if (gio >= 19 || gio < 5) get = "ليلة سعيدة ✨";

      msg = msg
        .replace(/\{name}/g, nameArray.join(", "))
        .replace(/\{type}/g, memLength.length > 1 ? "كم" : "ك")
        .replace(/\{soThanhVien}/g, memLength.join(", "))
        .replace(/\{threadName}/g, threadName)
        .replace(/\{get}/g, get)
        .replace(/\{author}/g, nameAuthor)
        .replace(/\{bok}/g, bok);

      const path = require("path");
      const pathGif = path.join(__dirname, "cache", "joinGif", `1.mp4`); // تأكدي من مسار ملف الترحيب إذا وجد

      let formPush;
      if (existsSync(pathGif)) {
        formPush = { body: msg, attachment: createReadStream(pathGif), mentions };
      } else {
        formPush = { body: msg, mentions };
      }

      return api.sendMessage(formPush, threadID);
    } catch (e) {
      console.log(e);
    }
  }
};
