module.exports.config = {
  name: "ابلاغ",
  version: "2.1.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "إرسال بلاغ أو رسالة للمسؤول في الخاص",
  commandCategory: "خدمات",
  usages: "[نص المشكلة]",
  cooldowns: 10
};

module.exports.handleReply = async function({ api, event, handleReply, Users }) {
  const { body, senderID, threadID, messageID } = event;
  const name = (await Users.getData(senderID)).name;

  switch (handleReply.type) {
    case "reply": {
      // إرسال الرد للمسؤولين
      const admins = global.config.ADMINBOT;
      for (let ad of admins) {
        api.sendMessage({
          body: `◈ ───『 تـكـمـلـة بـلاغ 』─── ◈\n\n◯ من: ${name}\n◉ الرسالة: ${body}\n◈ ─────────────── ◈`,
          mentions: [{ id: senderID, tag: name }]
        }, ad, (e, data) => global.client.handleReply.push({
          name: this.config.name,
          messageID: data.messageID,
          messID: messageID,
          author: senderID,
          id: threadID,
          type: "calladmin"
        }));
      }
      break;
    }

    case "calladmin": {
      // إرسال رد المسؤول إلى مجموعة المستخدم
      api.sendMessage({
        body: `◈ ───『 رد المسؤول 』─── ◈\n\n${body}\n◯ للرد، قم بالرد على هذه الرسالة.`,
        mentions: [{ tag: name, id: senderID }]
      }, handleReply.id, (e, data) => global.client.handleReply.push({
        name: this.config.name,
        author: senderID,
        messageID: data.messageID,
        type: "reply"
      }), handleReply.messID);
      break;
    }
  }
};

module.exports.run = async function({ api, event, args, Users }) {
  const { threadID, messageID, senderID } = event;
  if (!args[0]) return api.sendMessage("⚠️ يرجى كتابة محتوى البلاغ لإرساله.", threadID, messageID);

  const name = (await Users.getData(senderID)).name;
  const threadInfo = await api.getThreadInfo(threadID);
  const threadName = threadInfo.name || "محادثة خاصة";

  const moment = require("moment-timezone");
  const time = moment.tz("Asia/Baghdad").format("HH:mm:ss | DD/MM/YYYY");

  // رسالة تأكيد للمستخدم
  api.sendMessage(
    "◈ ───『 تـم الإرسـال ✅ 』─── ◈\n\n◯ تم إرسال بلاغك إلى المسؤول.\n◉ سيصلك الرد هنا فور مراجعته.\n◈ ─────────────── ◈",
    threadID, messageID
  );

  // إرسال البلاغ إلى المسؤولين
  const admins = global.config.ADMINBOT;
  for (let ad of admins) {
    api.sendMessage({
      body: `◈ ───『 بلاغ جديد 📩 』─── ◈\n\n👤 المبلغ: ${name}\n🆔 معرفه: ${senderID}\n🏘️ المجموعة: ${threadName}\n🆔 معرفها: ${threadID}\n———————————————\n📝 المشكلة:\n${args.join(" ")}\n———————————————\n⏳ الوقت: ${time}\n◈ ─────────────── ◈`
    }, ad, (error, info) =>
      global.client.handleReply.push({
        name: this.config.name,
        messageID: info.messageID,
        author: senderID,
        messID: messageID,
        id: threadID,
        type: "calladmin"
      })
    );
  }
};
