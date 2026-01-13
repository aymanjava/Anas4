module.exports.config = {
  name: "فريند",
  version: "2.0.0",
  hasPermssion: 2, // حصري للمطور فقط
  credits: "Ayman",
  description: "عرض وتطهير قائمة أصدقاء البوت الملكي",
  commandCategory: "المطور",
  usages: "[رقم الصفحة]",
  cooldowns: 5
};

module.exports.handleReply = async function ({ api, handleReply, event }) {
  const { threadID, messageID, senderID, body } = event;
  if (parseInt(senderID) !== parseInt(handleReply.author)) return;

  switch (handleReply.type) {
    case "reply": {
      let msg = "";
      let arrnum = body.split(" ");
      let nums = arrnum.map(n => parseInt(n));
      let successCount = 0;

      for (let num of nums) {
        if (isNaN(num) || num > handleReply.uidUser.length || num < 1) continue;
        
        const name = handleReply.nameUser[num - 1];
        const uidUser = handleReply.uidUser[num - 1];

        try {
          await api.unfriend(uidUser);
          msg += `🗑️ تـم الـطرد: ${name}\n`;
          successCount++;
        } catch (e) {
          msg += `❌ فـشل طـرد: ${name}\n`;
        }
      }

      api.unsendMessage(handleReply.messageID);
      return api.sendMessage(`◈ ───『 سـجـل الـتـطـهـيـر 』─── ◈\n\n${msg}\n✅ إجمالي المطرودين: ${successCount}\n\n◈ ──────────────── ◈`, threadID, messageID);
    }
    break;
  }
};

module.exports.run = async function ({ event, api, args }) {
  const { threadID, messageID, senderID } = event;

  try {
    const dataFriend = await api.getFriendsList();
    const countFr = dataFriend.length;
    const listFriend = dataFriend.map(f => ({
      name: f.fullName || "بلا اسم",
      uid: f.userID,
      gender: f.gender === "male" ? "ذكر" : "أنثى",
      profileUrl: f.profileUrl
    }));

    const page = parseInt(args[0]) || 1;
    const limit = 10;
    const numPage = Math.ceil(listFriend.length / limit);
    
    if (page > numPage) return api.sendMessage(`⚠️ سيدي، الأرشيف يحتوي على ${numPage} صفحات فقط.`, threadID, messageID);

    let msg = `◈ ───『 سـجـل الرعـايـا الـمـقـربـيـن 』─── ◈\n\n`;
    msg += `👥 إجمالي الأصدقاء: ${countFr}\n\n`;

    let nameUser = [], uidUser = [];
    
    for (let i = limit * (page - 1); i < limit * (page - 1) + limit; i++) {
      if (i >= listFriend.length) break;
      let info = listFriend[i];
      msg += `${i + 1}. 【 ${info.name} 】\n🆔 المعرف: ${info.uid}\n🚻 الجنس: ${info.gender}\n🔗 الرابط: ${info.profileUrl}\n\n`;
      
      nameUser.push(info.name);
      uidUser.push(info.uid);
    }

    msg += `————————————————\n`;
    msg += `📖 الصفحة [ ${page} / ${numPage} ]\n`;
    msg += `🚫 لـطـرد صديق: رد بـرقـمه (مثال: 1 3 5)\n`;
    msg += `👑 الـسـلـطـة لـلـتـوب ايـمـن\n`;
    msg += `◈ ──────────────── ◈`;

    return api.sendMessage(msg, threadID, (e, data) => {
      global.client.handleReply.push({
        name: this.config.name,
        author: senderID,
        messageID: data.messageID,
        nameUser,
        uidUser,
        type: 'reply'
      });
    }, messageID);
  } catch (e) {
    return api.sendMessage("⚠️ سيدي، فشلت الاستخبارات في جلب قائمة الأصدقاء.", threadID, messageID);
  }
};
