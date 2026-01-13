module.exports.config = {
  name: "شمول",
  version: "3.0.0",
  hasPermssion: 2,
  credits: "Ayman",
  description: "تغيير كنية الجميع بزخرفة إمبراطورية شاملة",
  commandCategory: "خدمات",
  usages: "[الرد بالكنية] أو [ايقاف/حالة]",
  cooldowns: 5
};

global.nicknameProcesses = global.nicknameProcesses || new Map();

module.exports.handleReply = async function({ api, event, handleReply, Users }) {
  const { threadID, messageID, senderID, body } = event;
  if (handleReply.author != senderID) return;

  const decoration = body.trim();
  if (!decoration) return api.sendMessage("◈ ───『 تـنـبـيـه 』─── ◈\n\n◯ سيدي، يرجى إدخال الكنية المطلوبة.\n———————————————\n◈ ─────────────── ◈", threadID, messageID);

  const threadInfo = await api.getThreadInfo(threadID);
  const participantIDs = threadInfo.participantIDs;

  global.nicknameProcesses.set(threadID, {
    stop: false,
    completed: 0,
    total: participantIDs.length
  });

  api.sendMessage(
    `◈ ───『 الـتـطـبـيـق الـشـامـل 』─── ◈\n\n◯ جـاري تـغـيـيـر كـنـيـة الـجـمـيـع..\n◉ الـنـمط: 𖣂 ${decoration} 𖣂\n👥 الـعدد: ${participantIDs.length} عـضـو\n———————————————\n◯ سـيـتـم وضـع اسـم الـعـضـو داخـل الـزخـرفـة.\n◈ ─────────────── ◈`,
    threadID, messageID
  );

  let success = 0;
  let failed = 0;

  for (let i = 0; i < participantIDs.length; i++) {
    const userID = participantIDs[i];
    const process = global.nicknameProcesses.get(threadID);
    
    if (process && process.stop) {
      api.sendMessage(`◈ ───『 إيـقـاف الـعـمـلـيـة 』─── ◈\n\n◯ تـم الـتـوقـف بـأمـرك سـيـدي.\n✅ نـجـاح: ${success}\n❌ فـشل: ${failed}\n◈ ─────────────── ◈`, threadID);
      global.nicknameProcesses.delete(threadID);
      return;
    }

    try {
      // جلب اسم العضو الأصلي
      const name = await Users.getNameUser(userID);
      // صياغة الكنية بالشكل المطلوب: 𖣂 الاسم 𖣂
      const finalNickname = `𖣂 ${name} 𖣂`;
      
      await api.changeNickname(finalNickname, threadID, userID);
      success++;
    } catch {
      failed++;
    }

    if (process) {
      process.completed = success + failed;
    }

    // تأخير لتجنب حظر الفيسبوك (ثانية واحدة بين كل عضو)
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  global.nicknameProcesses.delete(threadID);

  return api.sendMessage(
    `◈ ───『 تـم الـشـمـول بـنـجـاح 』─── ◈\n\n◯ تـم تـحـويـل جـمـيـع الأعـضـاء.\n✅ الـنـاجـحـون: ${success}\n❌ الـفـاشـلـون: ${failed}\n———————————————\n│←› بـأوامـر: الإمـبـراطـور أيـمـن 👑\n◈ ──────────────── ◈`,
    threadID, messageID
  );
};

module.exports.run = async function({ api, event, args }) {
  const { threadID, messageID, senderID } = event;

  if (args[0] === "ايقاف") {
    if (global.nicknameProcesses.has(threadID)) {
      global.nicknameProcesses.get(threadID).stop = true;
      return api.sendMessage("◯ عـلـم سـيـدي، جـاري الإيـقـاف..", threadID, messageID);
    }
    return api.sendMessage("◯ لا تـوجـد عـمـلـيـة جـاريـة حـالـيـاً.", threadID, messageID);
  }

  return api.sendMessage(
    `◈ ───『 نـظـام الـشـمـول 』─── ◈\n\n◯ يـرجـى الـرد عـلى هـذه الـرسـالـة بـالـكـلـمة الـتـي تـريـدهـا.\n◉ سـيـتـم تـحـويـل جـمـيـع الأسـمـاء إلـى: 𖣂 [الاسم] 𖣂\n———————————————\n◯ اسـتـخـدم "شمول ايقاف" لـلـتـعـطـيـل.\n◈ ─────────────── ◈`,
    threadID,
    (error, info) => {
      global.client.handleReply.push({
        name: this.config.name,
        messageID: info.messageID,
        author: senderID
      });
    },
    messageID
  );
};
