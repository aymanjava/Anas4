module.exports.config = {
  name: "نيم",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "تغيير الألقاب داخل المجموعة مع نظام رسوم الخزينة",
  commandCategory: "إدارية",
  usages: "[اللقب الجديد] أو [منشن + اللقب]",
  cooldowns: 3
};

module.exports.run = async function({ api, event, args, Currencies }) {
  const { threadID, messageID, senderID, mentions } = event;
  const isTop = global.config.ADMINBOT.includes(senderID);
  const changeFee = 200; // رسوم تغيير اللقب (صرف)

  let name = args.join(" ");
  const mentionID = Object.keys(mentions)[0];
  const targetID = mentionID || senderID;

  // 1. نظام التحقق والصرف
  if (!isTop) {
    let userData = await Currencies.getData(senderID);
    let money = userData.money || 0;

    if (money < changeFee) {
      return api.sendMessage(`◈ ───『 الـخـزيـنـة 』─── ◈\n\n❌ عذراً، تكلفة إصدار لقب جديد هي ${changeFee}$. خزنتك لا تكفي!\n\n◈ ──────────────── ◈`, threadID, messageID);
    }
    // خصم الرسوم من المستخدم العادي
    await Currencies.decreaseMoney(senderID, changeFee);
  }

  // 2. معالجة النص واللقب
  let nickname = mentionID ? name.replace(mentions[mentionID], "").trim() : name;

  if (!nickname) {
    return api.sendMessage(`◈ ───『 تـنـبـيـه 』─── ◈\n\n⚠️ يرجى تحديد اللقب الجديد الذي ترغب به سيدي.\n\n◈ ──────────────── ◈`, threadID, messageID);
  }

  // 3. تنفيذ التغيير
  return api.changeNickname(nickname, threadID, targetID, (err) => {
    if (err) return api.sendMessage("❌ عذراً سيدي، لا يمكنني تغيير اللقب (تأكد من صلاحيات البوت).", threadID, messageID);
    
    let msg = `◈ ───『 تـحـديـث الـلـقـب 』─── ◈\n\n` +
              `✅ تم اعتماد اللقب الجديد بنجاح\n` +
              `👤 الـمـسـتـهدف: ${mentionID ? "عضو في المجموعة" : "شخصي"}\n` +
              `🏷️ الـلـقـب: ${nickname}\n` +
              `💰 الـتـكـلـفـة: ${isTop ? "مجاني (إمبراطور)" : changeFee + "$"}\n\n` +
              ` ———————————————\n` +
              `│←› الـقـائد الـعـام: الـتـوب ايـمـن 👑\n` +
              `◈ ──────────────── ◈`;
    
    return api.sendMessage(msg, threadID, messageID);
  });
};
