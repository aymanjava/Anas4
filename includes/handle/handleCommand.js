module.exports = function ({ api, models, Users, Threads, Currencies }) {
  const stringSimilarity = require("string-similarity");
  const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const logger = require("../../utils/log.js");
  const moment = require("moment-timezone");

  return async function ({ event }) {
    const dateNow = Date.now();
    const time = moment.tz("Asia/Manila").format("HH:MM:ss DD/MM/YYYY");
    const { PREFIX, ADMINBOT, DeveloperMode, allowInbox, YASSIN } = global.config;
    const { userBanned, threadBanned, threadInfo, threadData, commandBanned } = global.data;
    const { commands, cooldowns } = global.client;

    let { body, senderID, threadID, messageID, type, messageReply, mentions } = event;
    senderID = String(senderID);
    threadID = String(threadID);

    const threadSetting = threadData.get(threadID) || {};
    const prefix = threadSetting.hasOwnProperty("PREFIX") ? threadSetting.PREFIX : PREFIX;

    // التحقق من البادئة أو تاق البوت
    let matchedPrefix = null;
    const botID = api.getCurrentUserID();
    if (body.startsWith(prefix)) matchedPrefix = prefix;
    else if (body.match(new RegExp(`^<@!?${botID}>`))) matchedPrefix = body.match(new RegExp(`^<@!?${botID}>`))[0];

    const args = matchedPrefix ? body.slice(matchedPrefix.length).trim().split(/ +/) : body.trim().split(/ +/);
    const commandName = args.shift()?.toLowerCase();
    let command = commands.get(commandName);

    // حماية Developer Mode
    if (YASSIN === "true" && !ADMINBOT.includes(senderID)) return;

    // اقتراح أقرب أمر إذا لم يوجد
    if (!command) {
      const allCommandName = Array.from(commands.keys());
      const checker = stringSimilarity.findBestMatch(commandName, allCommandName);
      if (checker.bestMatch.rating >= 0.8) {
        command = commands.get(checker.bestMatch.target);
      } else if (matchedPrefix) {
        return api.sendMessage(
          `╭─────────────╮\n    💎 عـذراً.. الأمـر [ ${commandName} ] غـيـر مـوجـود\n    ✨ هـل تـقـصد: 『 ${checker.bestMatch.target} 』؟\n╰─────────────╯`,
          threadID, messageID
        );
      }
    }

    // منع المحظورين
    if ((userBanned.has(senderID) || threadBanned.has(threadID) || (allowInbox === false && senderID == threadID)) && !ADMINBOT.includes(senderID)) {
      if (userBanned.has(senderID)) {
        const { reason, dateAdded } = userBanned.get(senderID);
        return api.sendMessage(`⚠️ محظور من البوت:\nالسبب: ${reason || "لا يوجد"}\nمنذ: ${dateAdded || "غير معروف"}`, threadID, async (err, info) => {
          await new Promise(res => setTimeout(res, 5000));
          return api.unsendMessage(info.messageID);
        }, messageID);
      }
      if (threadBanned.has(threadID)) {
        const { reason, dateAdded } = threadBanned.get(threadID);
        return api.sendMessage(`⚠️ هذه المجموعة محظورة من البوت:\nالسبب: ${reason || "لا يوجد"}\nمنذ: ${dateAdded || "غير معروف"}`, threadID, async (err, info) => {
          await new Promise(res => setTimeout(res, 5000));
          return api.unsendMessage(info.messageID);
        }, messageID);
      }
    }

    // التحقق من حظر الأوامر
    if (commandBanned.get(threadID) || commandBanned.get(senderID)) {
      if (!ADMINBOT.includes(senderID)) {
        const banThreads = commandBanned.get(threadID) || [];
        const banUsers = commandBanned.get(senderID) || [];
        if (banThreads.includes(command.config.name)) {
          return api.sendMessage(`🚫 هذا الأمر محظور في هذه المجموعة: ${command.config.name}`, threadID, async (err, info) => {
            await new Promise(res => setTimeout(res, 5000));
            return api.unsendMessage(info.messageID);
          }, messageID);
        }
        if (banUsers.includes(command.config.name)) {
          return api.sendMessage(`🚫 هذا الأمر محظور لك: ${command.config.name}`, threadID, async (err, info) => {
            await new Promise(res => setTimeout(res, 5000));
            return api.unsendMessage(info.messageID);
          }, messageID);
        }
      }
    }

    // التحقق من صلاحيات NSFW
    if (command.config.commandCategory?.toLowerCase() == "nsfw" && !global.data.threadAllowNSFW.includes(threadID) && !ADMINBOT.includes(senderID)) {
      return api.sendMessage("⚠️ لا يسمح باستخدام أوامر NSFW هنا.", threadID, async (err, info) => {
        await new Promise(res => setTimeout(res, 5000));
        return api.unsendMessage(info.messageID);
      }, messageID);
    }

    // تحديد صلاحية المستخدم
    let permssion = 0;
    const threadAdmins = (threadInfo.get(threadID) || await Threads.getInfo(threadID)).adminIDs;
    if (ADMINBOT.includes(senderID)) permssion = 2;
    else if (threadAdmins.some(ad => ad.id == senderID)) permssion = 1;

    if (command.config.hasPermssion > permssion) {
      return api.sendMessage(`⚠️ لا تمتلك صلاحية استخدام هذا الأمر: ${command.config.name}`, threadID, messageID);
    }

    // الكولداون
    if (!client.cooldowns.has(command.config.name)) client.cooldowns.set(command.config.name, new Map());
    const timestamps = client.cooldowns.get(command.config.name);
    const expirationTime = (command.config.cooldowns || 1) * 1000;
    if (timestamps.has(senderID) && dateNow < timestamps.get(senderID) + expirationTime) {
      return api.setMessageReaction("⏳", messageID, () => {}, true);
    }

    // دعم اللغات في الأوامر
    let getText2 = () => {};
    if (command.languages && typeof command.languages == "object" && command.languages.hasOwnProperty(global.config.language)) {
      getText2 = (...values) => {
        let lang = command.languages[global.config.language][values[0]] || "";
        for (let i = values.length - 1; i > 0; i--) {
          const expReg = RegExp("%" + i, "g");
          lang = lang.replace(expReg, values[i]);
        }
        return lang;
      };
    }

    try {
      const Obj = { api, event, args, models, Users, Threads, Currencies, permssion, getText: getText2, mentions, messageReply, type };
      command.run(Obj);
      timestamps.set(senderID, dateNow);

      if (DeveloperMode) {
        logger(`[DEV MODE] تم تنفيذ الأمر: ${commandName} من ${senderID} في ${threadID} | الوقت: ${Date.now() - dateNow}ms`);
      }
    } catch (e) {
      return api.sendMessage(`⚠️ خطأ أثناء تنفيذ الأمر ${commandName}:\n${e.message}`, threadID, messageID);
    }
  };
};
