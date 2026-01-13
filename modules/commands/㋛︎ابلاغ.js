module.exports.config = {
  name: "ابلاغ",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "إرسال بلاغ أو رسالة للإمبراطور أيمن في الخاص",
  commandCategory: "خدمات",
  usages: "[نص المشكلة]",
  cooldowns: 10,
};

module.exports.handleReply = async function({ api, event, handleReply, Users }) {
  const { body, senderID, messageID, threadID } = event;
  const name = (await Users.getData(senderID)).name;

  switch (handleReply.type) {
    // رديّة المستخدم من المجموعة إلى خاص الإمبراطور
    case "reply": {
      const admins = global.config.ADMINBOT;
      for (let ad of admins) {
        api.sendMessage({
          body: `◈ ───『 تـكـمـلـة بـلاغ 』─── ◈\n\n◯ مـن: ${name}\n◉ الـرسالة: ${body}\n———————————————\n◈ ─────────────── ◈`,
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
    // رديّة الإمبراطور من الخاص إلى مجموعة المستخدم
    case "calladmin": {
      api.sendMessage({
        body: `◈ ───『 رد الإمـبـراطـور أيـمـن 』─── ◈\n\n${body}\n———————————————\n◯ رد على هذه الرسالة للاستمرار في التواصل.`,
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
  if (!args[0]) return api.sendMessage("⚠️ سيدي، يرجى كتابة محتوى البلاغ لإرساله.", threadID, messageID);

  const name = (await Users.getData(senderID)).name;
  const threadInfo = await api.getThreadInfo(threadID);
  const threadName = threadInfo.name || "محادثة خاصة";
  
  const moment = require("moment-timezone");
  const time = moment.tz("Asia/Baghdad").format("HH:mm:ss | DD/MM/YYYY");

  // إرسال تأكيد للمستخدم في المجموعة
  api.sendMessage("◈ ───『 تـم الإرسـال ✅ 』─── ◈\n\n◯ سيدي، تم إرسال بلاغك إلى الإمبراطور أيمن في الخاص.\n◉ سيصلك الرد هنا فور مراجعته.\n———————————————\n◈ ─────────────── ◈", threadID, messageID);

  // إرسال البلاغ لخاص الأدمن (الإمبراطور)
  const admins = global.config.ADMINBOT;
  for (let ad of admins) {
    api.sendMessage({
      body: `◈ ───『 بـلاغ جـديـد 📩 』─── ◈\n\n👤 الـمُبلغ: ${name}\n🆔 مـعرفه: ${senderID}\n🏘️ الـمجموعة: ${threadName}\n🆔 مـعرفها: ${threadID}\n———————————————\n📝 الـمشكلة:\n${args.join(" ")}\n———————————————\n⏳ الـوقت: ${time}\n◈ ─────────────── ◈`,
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
