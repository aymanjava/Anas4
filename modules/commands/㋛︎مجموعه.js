module.exports.config = {
  name: "مجموعه",
  version: "1.1.0",
  hasPermssion: 2,
  credits: "Ayman",
  description: "نظام إدارة حظر المجموعات والأوامر الإمبراطوري",
  commandCategory: "المطور",
  usages: "[باند/نوبان/امرباند/امرنوبان/بحث/لاست] [ID]",
  cooldowns: 5,
  dependencies: {
    "moment-timezone": ""
  }
};

module.exports.languages = {
  "ar": {
    "reason": "السبب",
    "at": "في وقت",
    "allCommand": "كل الأوامر",
    "commandList": "الأوامر",
    "banSuccess": "✅ [تم الحظر] تم حظر المجموعة بنجاح: %1",
    "unbanSuccess": "🔓 [فك الحظر] تم فك الحظر عن المجموعة: %1",
    "banCommandSuccess": "🚫 [حظر أمر] تم حظر الأوامر المحددة في المجموعة: %1",
    "unbanCommandSuccess": "✅ [فك حظر أمر] تم فك حظر %1 في المجموعة: %2",
    "errorReponse": "❌ [خطأ] لا يمكن تنفيذ الطلب للمجموعة: %2",
    "IDNotFound": "⚠️ [خطأ] المعرف (ID) غير موجود في قاعدة البيانات",
    "existBan": "⚠️ هذه المجموعة محظورة بالفعل!\nالسبب: %2\nالوقت: %3",
    "notExistBan": "⚠️ هذه المجموعة غير محظورة حالياً.",
    "missingCommandInput": "⚠️ يجب تحديد الأوامر المراد حظرها!",
    "notExistBanCommand": "⚠️ لا يوجد أوامر محظورة في هذه المجموعة حالياً.",
    "returnBan": "⚠️ [تأكيد الحظر]\n- ايدي المجموعة: %1%2\n\n❮ تفاعل (Reaction) على هذه الرسالة للتأكيد ❯",
    "returnUnban": "🔓 [تأكيد فك الحظر]\n- ايدي المجموعة: %1\n\n❮ تفاعل (Reaction) على هذه الرسالة للتأكيد ❯",
    "returnBanCommand": "🚫 [تأكيد حظر الأوامر]\n- ايدي المجموعة: %1\n- الأوامر: %2\n\n❮ تفاعل على هذه الرسالة للتأكيد ❯",
    "returnUnbanCommand": "✅ [تأكيد فك حظر الأوامر]\n- ايدي المجموعة: %1\n- الأوامر: %2\n\n❮ تفاعل على هذه الرسالة للتأكيد ❯",
    "returnResult": "🔍 نتائج البحث الـمـطـابـقة:\n",
    "returnNull": "⚠️ لا توجد نتائج مطابقة لبحثك.",
    "returnList": "📋 [قائمة الحظر]\nيوجد %1 مجموعة محظورة:\n\n%3",
    "returnInfo": "📊 [معلومات المجموعة]\n- ID: %1\n- محظورة؟: %2\n- السبب: %3\n- التاريخ: %4\n- أوامر محظورة: %5"
  }
};

module.exports.handleReaction = async ({ event, api, Threads, handleReaction, getText }) => {
  if (parseInt(event.userID) !== parseInt(handleReaction.author)) return;
  const moment = require("moment-timezone");
  const { threadID } = event;
  const { messageID, type, targetID, reason, commandNeedBan } = handleReaction;
  const time = moment.tz("Asia/Baghdad").format("HH:mm:ss DD/MM/YYYY");

  global.client.handleReaction.splice(global.client.handleReaction.findIndex(item => item.messageID == messageID), 1);

  switch (type) {
    case "ban": {
      try {
        let data = (await Threads.getData(targetID)).data || {};
        data.banned = true;
        data.reason = reason || "لا يوجد سبب محدد";
        data.dateAdded = time;
        await Threads.setData(targetID, { data });
        global.data.threadBanned.set(targetID, { reason: data.reason, dateAdded: data.dateAdded });
        return api.sendMessage(getText("banSuccess", targetID), threadID, () => api.unsendMessage(messageID));
      } catch { return api.sendMessage(getText("errorReponse", "", targetID), threadID) }
    }
    case "unban": {
      try {
        let data = (await Threads.getData(targetID)).data || {};
        data.banned = false;
        await Threads.setData(targetID, { data });
        global.data.threadBanned.delete(targetID);
        return api.sendMessage(getText("unbanSuccess", targetID), threadID, () => api.unsendMessage(messageID));
      } catch { return api.sendMessage(getText("errorReponse", "", targetID), threadID) }
    }
    case "banCommand": {
      try {
        let data = (await Threads.getData(targetID)).data || {};
        data.commandBanned = [...(data.commandBanned || []), ...commandNeedBan];
        await Threads.setData(targetID, { data });
        global.data.commandBanned.set(targetID, data.commandBanned);
        return api.sendMessage(getText("banCommandSuccess", targetID), threadID, () => api.unsendMessage(messageID));
      } catch { return api.sendMessage(getText("errorReponse", "", targetID), threadID) }
    }
    case "unbanCommand": {
      try {
        let data = (await Threads.getData(targetID)).data || {};
        data.commandBanned = data.commandBanned.filter(item => !commandNeedBan.includes(item));
        await Threads.setData(targetID, { data });
        global.data.commandBanned.set(targetID, data.commandBanned);
        if (data.commandBanned.length == 0) global.data.commandBanned.delete(targetID);
        return api.sendMessage(getText("unbanCommandSuccess", commandNeedBan.join(", "), targetID), threadID, () => api.unsendMessage(messageID));
      } catch { return api.sendMessage(getText("errorReponse", "", targetID), threadID) }
    }
  }
};

module.exports.run = async ({ event, api, args, Threads, getText }) => {
  const { threadID, messageID, senderID } = event;
  let targetID = String(args[1] || threadID);
  let reason = args.slice(2).join(" ") || null;

  if (isNaN(args[1]) && args[1]) {
    targetID = String(threadID);
    reason = args.slice(1).join(" ");
  }

  switch (args[0]) {
    case "باند": {
      if (!global.data.allThreadID.includes(targetID)) return api.sendMessage(getText("IDNotFound"), threadID, messageID);
      return api.sendMessage(getText("returnBan", targetID, (reason ? `\n- السبب: ${reason}` : "")), threadID, (err, info) => {
        global.client.handleReaction.push({ type: "ban", targetID, reason, author: senderID, messageID: info.messageID });
      }, messageID);
    }
    case "نوبان": {
      if (!global.data.threadBanned.has(targetID)) return api.sendMessage(getText("notExistBan"), threadID, messageID);
      return api.sendMessage(getText("returnUnban", targetID), threadID, (err, info) => {
        global.client.handleReaction.push({ type: "unban", targetID, author: senderID, messageID: info.messageID });
      }, messageID);
    }
    case "امرباند": {
      if (!reason) return api.sendMessage(getText("missingCommandInput"), threadID, messageID);
      const cmds = reason === "all" ? Array.from(global.client.commands.keys()) : reason.split(" ");
      return api.sendMessage(getText("returnBanCommand", targetID, reason), threadID, (err, info) => {
        global.client.handleReaction.push({ type: "banCommand", targetID, commandNeedBan: cmds, author: senderID, messageID: info.messageID });
      }, messageID);
    }
    case "لاست": {
      let list = "";
      let i = 1;
      for (const [id, info] of global.data.threadBanned) {
        list += `${i++}. ID: ${id} | السبب: ${info.reason}\n`;
      }
      return api.sendMessage(getText("returnList", global.data.threadBanned.size, "", list || "لا يوجد"), threadID, messageID);
    }
    case "بحث": {
        const query = args.slice(1).join(" ");
        const allThreads = await Threads.getAll(['threadID', 'threadInfo']);
        let results = "";
        allThreads.forEach(t => {
            if (t.threadInfo && t.threadInfo.threadName && t.threadInfo.threadName.includes(query)) {
                results += `• ${t.threadInfo.threadName} (${t.threadID})\n`;
            }
        });
        return api.sendMessage(results ? getText("returnResult") + results : getText("returnNull"), threadID, messageID);
    }
    default:
      return api.sendMessage("⚠️ استخدام خاطئ! استخدم [باند/نوبان/امرباند/لاست/بحث]", threadID, messageID);
  }
};
