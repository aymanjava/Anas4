const moment = require("moment-timezone");

module.exports.config = {
  name: "ارسل",
  version: "3.1.0",
  hasPermission: 2,
  credits: "Ayman",
  description: "إصدار مراسيم ملكية مع اختيار الكروب بالرد",
  commandCategory: "المطور",
  usages: "ارسل → اختر رقم → اكتب الرسالة",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, args, Currencies }) {
  const { threadID, messageID, senderID } = event;
  if (!global.config.ADMINBOT.includes(senderID)) {
    return api.sendMessage(
      "◈ ───『 تـنـبـيـه 』─── ◈\n\n◯ هذا الأمر مخصص للتوب فقط.\n\n◈ ─────────────── ◈",
      threadID,
      messageID
    );
  }

  // إذا كتب رسالة مباشرة بعد الرد
  if (event.messageReply && global.sendList?.[senderID]) {
    const index = parseInt(event.messageReply.body) - 1;
    const thread = global.sendList[senderID][index];

    if (!thread) {
      return api.sendMessage("◯ رقم غير صحيح.", threadID, messageID);
    }

    const content = args.join(" ");
    if (!content) {
      return api.sendMessage("◯ اكتب نص المرسوم بعد الأمر.", threadID, messageID);
    }

    const time = moment.tz("Asia/Baghdad").format("HH:mm:ss - D/MM/YYYY");
    const gift = 50;

    const msg =
`◈ ───『 مـرسـوم مـلـكـي 』─── ◈

◯ الـرسـالة:
${content}

◯ الـتـوقـيـت: ${time}
◯ هـديـة وصول: +${gift}$

◈ ─────────────── ◈
│ الآمر: الـتـوب أيمن
◈ ─────────────── ◈`;

    await api.sendMessage(msg, thread.threadID);
    await Currencies.increaseMoney(thread.threadID, gift);

    delete global.sendList[senderID];

    return api.sendMessage(
      `◈ ───『 تـم الـإرسـال 』─── ◈\n\n◯ الكروب: ${thread.name}\n\n◈ ─────────────── ◈`,
      threadID
    );
  }

  // عرض قائمة الكروبات
  const threads = await api.getThreadList(20, null, ["INBOX"]);
  const groups = threads.filter(t => t.isGroup);

  global.sendList = global.sendList || {};
  global.sendList[senderID] = groups;

  let list =
`◈ ───『 قـائـمـة الـكـروبـات 』─── ◈\n\n`;

  groups.forEach((g, i) => {
    list += `◯ ${i + 1} │ ${g.name}\n`;
  });

  list += `\n◈ ─────────────── ◈\n│ ←› رد برقم الكروب ثم اكتب:\n│ ←› ارسل [النص]\n◈ ─────────────── ◈`;

  return api.sendMessage(list, threadID, messageID);
};
