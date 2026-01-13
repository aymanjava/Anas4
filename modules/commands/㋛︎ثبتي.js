const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "ثبتي",
  version: "2.1.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "نظام التثبيت الملكي للرسائل الهامة مع رسوم الخزينة",
  commandCategory: "مسؤولي المجموعات",
  usages: "[اضف/حذف/الكل] [نص]",
  cooldowns: 5,
  dependencies: {
    "fs-extra": "",
    "path": ""
  }
};

module.exports.onLoad = () => {
  const pathData = path.join(__dirname, "cache", "pin_notes.json");
  if (!fs.existsSync(pathData)) fs.writeFileSync(pathData, "[]", "utf-8");
};

module.exports.run = async ({ event, api, args, permssion, Currencies }) => {
  const { threadID, messageID, senderID } = event;
  const isTop = global.config.ADMINBOT.includes(senderID);
  const pathData = path.join(__dirname, "cache", "pin_notes.json");
  const pinFee = 500; // رسوم التثبيت (صرف)

  let dataJson = JSON.parse(fs.readFileSync(pathData, "utf-8"));
  let thisThread = dataJson.find(item => item.threadID == threadID) || { threadID, listRule: [] };

  switch (args[0]) {
    case "اضف": {
      if (permssion == 0 && !isTop) return api.sendMessage("◈ ───『 تـنـبـيـه 』─── ◈\n\n⚠️ عذراً، التثبيت مسموح فقط للمسؤولين أو للتوب أيمن 👑\n\n◈ ──────────────── ◈", threadID, messageID);
      
      const content = args.slice(1).join(" ");
      if (!content) return api.sendMessage("⚠️ سيدي، يرجى كتابة النص المراد تثبيته.", threadID, messageID);

      // نظام الصرف للمستخدمين العاديين (الأدمنية غير التوب)
      if (!isTop) {
        let userMoney = (await Currencies.getData(senderID)).money || 0;
        if (userMoney < pinFee) return api.sendMessage(`◈ ───『 الـخـزيـنـة 』─── ◈\n\n❌ تكلفة تثبيت رسالة ملكية هي ${pinFee}$. رصيدك لا يكفي!\n\n◈ ──────────────── ◈`, threadID, messageID);
        await Currencies.decreaseMoney(senderID, pinFee);
      }

      thisThread.listRule.push(content);
      api.sendMessage(`◈ ───『 تـم الـتـثـبـيـت 』─── ◈\n\n✅ تم إدراج الرسالة في الديوان الملكي.\n💰 الرسوم: ${isTop ? "مجاني" : pinFee + "$"}\n\n◈ ──────────────── ◈`, threadID, messageID);
      break;
    }

    case "الكل":
    case "list": {
      if (thisThread.listRule.length == 0) return api.sendMessage("◈ ───『 الـديـوان 』─── ◈\n\n⚠️ لا توجد رسائل مثبتة في هذه المجموعة حالياً.\n\n◈ ──────────────── ◈", threadID, messageID);
      
      let msg = "";
      thisThread.listRule.forEach((item, index) => msg += `📍 [${index + 1}] ← ${item}\n`);
      
      return api.sendMessage(`◈ ───『 الـرسـائل الـمـثـبـتـة 』─── ◈\n\n${msg}\n│←› بـإدارة الـتـوب ايـمـن 👑\n◈ ──────────────── ◈`, threadID, messageID);
    }

    case "حذف": {
      if (permssion == 0 && !isTop) return api.sendMessage("⚠️ سيدي، لا يملك صلاحية الحذف من الديوان إلا العظماء!", threadID, messageID);
      
      const target = args[1];
      if (target === "الكل" || target === "all") {
        thisThread.listRule = [];
        api.sendMessage("◈ ───『 تـطـهـيـر 』─── ◈\n\n🧹 تم مسح جميع الرسائل المثبتة بأمر ملكي.\n\n◈ ──────────────── ◈", threadID, messageID);
      } else if (!isNaN(target) && target > 0 && target <= thisThread.listRule.length) {
        const deleted = thisThread.listRule.splice(target - 1, 1);
        api.sendMessage(`◈ ───『 حـذف رسـالـة 』─── ◈\n\n✅ تم حذف الرسالة رقم [${target}] بنجاح.\n\n◈ ──────────────── ◈`, threadID, messageID);
      } else {
        api.sendMessage("⚠️ يرجى تحديد رقم الرسالة المراد حذفها سيدي.", threadID, messageID);
      }
      break;
    }

    default:
      return api.sendMessage(`◈ ───『 مـسـاعـد الـتـثـبـيـت 』─── ◈\n\nالتحكم في الديوان الملكي:\n│←› ثبتي اضف [النص]\n│←› ثبتي الكل (لعرض المثبتات)\n│←› ثبتي حذف [الرقم/الكل]\n\n◈ ──────────────── ◈`, threadID, messageID);
  }

  if (!dataJson.some(item => item.threadID == threadID)) dataJson.push(thisThread);
  else {
    const index = dataJson.findIndex(item => item.threadID == threadID);
    dataJson[index] = thisThread;
  }
  fs.writeFileSync(pathData, JSON.stringify(dataJson, null, 4), "utf-8");
};
