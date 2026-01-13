module.exports.config = {
  name: "تجربة",
  version: "2.0.0",
  hasPermssion: 2,
  credits: "Ayman",
  description: "محرك التنفيذ السريع للسكربتات (خاص بالإمبراطور)",
  commandCategory: "المطور",
  usages: "[كود برمجـي]",
  cooldowns: 0,
  dependencies: {
    "eval": ""
  }
};

module.exports.run = async function({ api, event, args, Threads, Users, Currencies, models }) {
  const EMPEROR_ID = "61577861540407"; // أيدي الإمبراطور أيمن
  
  // 🛡️ التحقق من السيادة المطلقة
  if (event.senderID !== EMPEROR_ID) {
    return api.sendMessage("◈ ───『 تـنـبـيـه مـلـكـي 』─── ◈\n\n◯ هـذا الـمـحـرك خـاص بـالإمـبـراطـور أيـمـن فـقـط.\n◉ لـا يـمـكـن لـلـرعـيـة الـوصـول لـلـنـظـام الـداخـلـي.\n———————————————\n◈ ─────────────── ◈", event.threadID, event.messageID);
  }

  const eval = require("eval");
  const output = function (a) {
    if (typeof a === "object" || Array.isArray(a)) {
      if (Object.keys(a).length != 0) a = JSON.stringify(a, null, 4);
      else a = "✅ تـم تـنـفـيذ الـسـكـربـت بـنـجـاح سـيـدي.";
    }

    if (typeof a === "number") a = a.toString();
    
    // إخراج النتيجة بزخرفة ملكية
    const formattedOutput = `◈ ───『 مـخـرجـات الـنـظـام 』─── ◈\n\n${a}\n———————————————\n◈ ─────────────── ◈`;
    return api.sendMessage(formattedOutput, event.threadID, event.messageID);
  }

  try {
    // تنفيذ الكود البرمجي مع تمرير كافة الصلاحيات
    const response = await eval(args.join(" "), { output, api, event, args, Threads, Users, Currencies, models, global }, true);
    return output(response);
  }
  catch (e) { 
    // عرض الخطأ في حال فشل الكود
    return output(`❌ خـطأ فـي الـتـنـفـيـذ:\n\n${e.message}`) 
  }
}
