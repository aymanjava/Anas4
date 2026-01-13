module.exports.config = {
  name: "كنية",
  version: "2.0.0",
  hasPermssion: 1,
  credits: "Ayman",
  description: "يمنح لقباً ملكياً تلقائياً لكل عضو ينضم للمجموعة",
  commandCategory: "إدارة المجموعة",
  usages: "[اضف <اللقب> / حذف]",
  cooldowns: 5
};

module.exports.onLoad = () => {
  const fs = require("fs-extra");
  const pathData = __dirname + "/cache/autosetname.json";
  if (!fs.existsSync(pathData)) fs.writeFileSync(pathData, "[]", "utf-8"); 
}

module.exports.run = async function ({ event, api, args, Users }) {
  const fs = require("fs-extra");
  const { threadID, messageID, senderID } = event;
  const pathData = __dirname + "/cache/autosetname.json";

  const content = args.slice(1).join(" ");
  var dataJson = JSON.parse(fs.readFileSync(pathData, "utf-8"));
  var thisThread = dataJson.find(item => item.threadID == threadID) || { threadID, nameUser: [] };

  switch (args[0]) {
    case "اضف":
    case "add": {
      if (content.length == 0) return api.sendMessage("◈ ───『 تـنـبـيـه مـلـكـي 』─── ◈\n\n◯ سيدي، لا يمكن ترك حقل الكنية فارغاً!\n———————————————\n◈ ─────────────── ◈", threadID, messageID);
      if (thisThread.nameUser.length > 0) return api.sendMessage("◈ ───『 تـنـبـيـه مـلـكـي 』─── ◈\n\n◯ يوجد لقب مفعل بالفعل سيدي.\n◉ يرجى حذفه أولاً قبل إضافة جديد.\n———————————————\n◈ ─────────────── ◈", threadID, messageID); 
      
      thisThread.nameUser.push(content);
      const name = (await Users.getData(senderID)).name;
      
      if (!dataJson.some(item => item.threadID == threadID)) dataJson.push(thisThread);
      fs.writeFileSync(pathData, JSON.stringify(dataJson, null, 4), "utf-8");
      
      return api.sendMessage(`◈ ───『 نـظـام الـرُّتـب 』─── ◈\n\n◯ الـحـالـة : تـم الـتـفـعـيـل ✅\n◉ الـرُّتـبـة : ${content}\n◉ الـقـائـد : ${name}\n———————————————\n◯ مـلاحـظـة :\n◉ سيتم دمج اسم العضو مع الرتبة تلقائياً\n———————————————\n◈ ─────────────── ◈`, threadID, messageID);
    }

    case "حذف":
    case "remove":
    case "delete": {
      if (thisThread.nameUser.length == 0) return api.sendMessage("◈ ───『 تـنـبـيـه مـلـكـي 』─── ◈\n\n◯ سيدي، لا توجد كنية مفعلة لحذفها!\n———————————————\n◈ ─────────────── ◈", threadID, messageID);
      
      thisThread.nameUser = [];
      const index = dataJson.findIndex(item => item.threadID == threadID);
      if (index !== -1) dataJson[index].nameUser = [];
      
      fs.writeFileSync(pathData, JSON.stringify(dataJson, null, 4), "utf-8");
      return api.sendMessage(`◈ ───『 نـظـام الـرُّتـب 』─── ◈\n\n◯ الـحـالـة : تـم الـتـطهـيـر 🗑️\n◉ تـم حـذف الـكنية الـتلقائية بـنجاح\n———————————————\n◈ ─────────────── ◈`, threadID, messageID);
    }

    default: {
      return api.sendMessage(`◈ ───『 نـظـام الـكـنـيـة 』─── ◈\n\n◯ خـيارات الـتـحكم :\n◉ كنية اضف [اللقب]\n◉ كنية حذف\n———————————————\n◯ مـثـال :\n◉ كنية اضف جندي |\n———————————————\n◈ ─────────────── ◈\n│←› بـإدارة: الإمـبـراطـور أيـمـن`, threadID, messageID);
    }
  }
}
