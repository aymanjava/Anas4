const fs = require("fs-extra");
const stringSimilarity = require('string-similarity');

module.exports.config = {
  name: 'جافا',
  version: '2.0.0',
  hasPermssion: 2, // للمطورين فقط
  credits: 'Ayman',
  description: 'سحب أكواد الملفات من قلب النظام وإرسالها كملف نصي',
  commandCategory: 'المطور',
  usages: '[اسم_الملف.js]',
  cooldowns: 0
};

module.exports.run = async ({ args, api, event, Users }) => {
  const { threadID, messageID, senderID, type, messageReply } = event;
  
  // قائمة المطورين المسموح لهم (أضفت الأيدي الخاص بك سيدي)
  const permission = ["61576232405796", "YOUR_UID_HERE"]; 
  if (!permission.includes(senderID)) return api.sendMessage("⚠️ سيدي، هذه المنطقة محرمة على الرعية. الصلاحيات غير كافية!", threadID, messageID);

  const file = args.join(" ");
  if (!file) return api.sendMessage('⚠️ سيدي، يجب تحديد اسم الملف المراد سحبه.', threadID, messageID);
  if (!file.endsWith('.js')) return api.sendMessage('⚠️ الأرشيف الملكي لا يسحب إلا ملفات بصيغة .js فقط.', threadID, messageID);

  const allFiles = fs.readdirSync(__dirname).filter((f) => f.endsWith(".js")).map(item => item.replace(/\.js/g, ""));

  // في حال الرد على شخص لإرسال الكود له في الخاص
  if (type == "message_reply") {
    var uid = messageReply.senderID;
    var name = (await Users.getData(uid)).name;

    if (!fs.existsSync(__dirname + "/" + file)) {
      var checker = stringSimilarity.findBestMatch(file.replace(".js", ""), allFiles);
      var search = checker.bestMatch.rating >= 0.5 ? checker.bestMatch.target : undefined;
      
      if (!search) return api.sendMessage('🔎 لم يتم العثور على هذا الملف في السجلات.', threadID, messageID);
      
      return api.sendMessage(`🔎 لم أجد "${file}"، هل تقصد "${search}.js"؟\n\n✨ تفاعل (Reaction) على هذه الرسالة لإرسال الملف للمستخدم في الخاص.`, threadID, (error, info) => {
        global.client.handleReaction.push({
          name: this.config.name,
          author: senderID,
          messageID: info.messageID,
          file: search,
          uid: uid,
          namee: name,
          type: 'user'
        });
      }, messageID);
    }

    // إرسال الملف مباشرة
    sendAsTxt(file, uid, api, threadID, name);
  } 
  // إرسال الملف في المجموعة مباشرة
  else {
    if (!fs.existsSync(__dirname + "/" + file)) {
      var checker = stringSimilarity.findBestMatch(file.replace(".js", ""), allFiles);
      var search = checker.bestMatch.rating >= 0.5 ? checker.bestMatch.target : undefined;
      
      if (!search) return api.sendMessage('🔎 الملف غير موجود في الأرشيف.', threadID, messageID);
      
      return api.sendMessage(`🔎 لم أجد الملف، لكن وجدت "${search}.js" قريباً من طلبك.\n\n✨ تفاعل (Reaction) لإرساله هنا.`, threadID, (error, info) => {
        global.client.handleReaction.push({
          name: this.config.name,
          author: senderID,
          messageID: info.messageID,
          file: search,
          type: 'thread'
        });
      }, messageID);
    }

    sendAsTxt(file, threadID, api, threadID);
  }
};

module.exports.handleReaction = async ({ api, event, handleReaction }) => {
  if (event.userID != handleReaction.author) return;
  const { file, type, uid, namee } = handleReaction;
  api.unsendMessage(handleReaction.messageID);
  
  if (type === "user") {
    sendAsTxt(file + ".js", uid, api, event.threadID, namee);
  } else {
    sendAsTxt(file + ".js", event.threadID, api, event.threadID);
  }
};

// دالة تحويل الملف وإرساله
function sendAsTxt(file, targetID, api, currentThread, name = null) {
  const pathTxt = __dirname + '/' + file.replace(".js", ".txt");
  fs.copySync(__dirname + '/' + file, pathTxt);
  
  api.sendMessage({
    body: `📜 سيدي، إليك كود الملف: ${file}`,
    attachment: fs.createReadStream(pathTxt)
  }, targetID, (err) => {
    fs.unlinkSync(pathTxt);
    if (err) return api.sendMessage(`❌ فشل إرسال الملف إلى ${name || 'المجموعة'}.`, currentThread);
    if (name) api.sendMessage(`✅ سيدي، تم إرسال ملف الكود إلى ${name} في الخاص.`, currentThread);
  });
}
