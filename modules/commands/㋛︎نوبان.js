module.exports.config = {
  name: "نوبان",
  version: "2.5.0",
  hasPermssion: 2,
  credits: "Ayman",
  description: "نظام العفو الملكي - فك الحظر عن المستخدمين والمجموعات",
  commandCategory: "المطور",
  usages: "[المجموعه / الخادم / ادمن / @تاغ]",
  cooldowns: 2
};

module.exports.run = async ({ event, api, Users, Threads, args }) => {
  const { threadID, messageID, senderID } = event;
  const isTop = global.config.ADMINBOT.includes(senderID);

  // التأكد من أن القائم بالأمر هو "التوب" حصراً
  if (!isTop) return api.sendMessage("◈ ───『 تـنـبـيـه 』─── ◈\n\n⚠️ عذراً، صلاحية العفو الملكي بيد الـتـوب ايـمـن فقط 👑\n\n◈ ──────────────── ◈", threadID, messageID);

  const prefix = global.config.PREFIX;

  switch (args[0]) {
    case 'ادمن':
      {
        const listAdmin = global.config.ADMINBOT;
        for (var idad of listAdmin) {
          const data = (await Users.getData(idad)).data || {};
          data.banned = 0;
          data.reason = null;
          await Users.setData(idad, { data });
          global.data.userBanned.delete(idad);
        }
        api.sendMessage("◈ ───『 عـفـو إداري 』─── ◈\n\n✅ تم فك الحظر عن جميع مطوري البوت.\n\n◈ ──────────────── ◈", threadID, messageID);
        break;
      }

    case 'سيرفر':
    case 'الخادم':
      {
        const threadBanned = global.data.threadBanned.keys();
        for (const singleThread of threadBanned) {
          const data = (await Threads.getData(singleThread)).data || {};
          data.banned = 0;
          await Threads.setData(singleThread, { data });
          global.data.threadBanned.delete(singleThread);
        }
        const userBanned = global.data.userBanned.keys();
        for (const singleUser of userBanned) {
          const data = (await Users.getData(singleUser)).data || {};
          data.banned = 0;
          await Users.setData(singleUser, { data });
          global.data.userBanned.delete(singleUser);
        }
        api.sendMessage("◈ ───『 عـفـو شـامـل 』─── ◈\n\n🏛️ تم تصفير قائمة المحظورين بالكامل من الخادم!\n\n◈ ──────────────── ◈", threadID, messageID);
        break;
      }

    case 'المجموعه':
    case 'المجموعة':
      {
        var idbox = event.threadID;
        var data = (await Threads.getData(idbox)).data || {};
        data.banned = 0;
        await Threads.setData(idbox, { data });
        global.data.threadBanned.delete(idbox);
        api.sendMessage("◈ ───『 عـفـو مـحـلـي 』─── ◈\n\n🔓 تم رفع الحظر عن هذه المجموعة بنجاح.\n\n◈ ──────────────── ◈", threadID, messageID);
        break;
      }

    case 'عضو':
    case 'هاذه':
      {
        if (Object.keys(event.mentions).length > 0) {
          for (var userID of Object.keys(event.mentions)) {
            const data = (await Users.getData(userID)).data || {};
            data.banned = 0;
            await Users.setData(userID, { data });
            global.data.userBanned.delete(userID);
          }
          api.sendMessage(`◈ ───『 عـفـو شـخـصـي 』─── ◈\n\n✅ تم فك الحظر عن المستخدمين المذكورين.\n\n◈ ──────────────── ◈`, threadID, messageID);
        } else {
          api.sendMessage("⚠️ سيدي، قم بعمل تاغ (Tag) للشخص المراد العفو عنه.", threadID, messageID);
        }
        break;
      }

    default:
      api.sendMessage(`◈ ───『 قـائـمـة الـعـفـو 』─── ◈\n\nاستخدم الأوامر التالية سيدي:\n│←› ${prefix}نوبان عضو [@تاغ]\n│←› ${prefix}نوبان المجموعة\n│←› ${prefix}نوبان السيرفر\n│←› ${prefix}نوبان ادمن\n\n◈ ──────────────── ◈`, threadID, messageID);
      break;
  }
}
