module.exports.config = {
  name: "محكمة",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "محاكمة إمبراطورية تفاعلية",
  commandCategory: "تفاعلي",
  cooldowns: 5
};

module.exports.run = async ({ api, event, Users }) => {
  const { threadID, messageID, senderID, mentions, type, messageReply } = event;

  let uid =
    type === "message_reply" ? messageReply.senderID :
    Object.keys(mentions)[0];

  if (!uid)
    return api.sendMessage("⚠️ حدد المتهم بالتاغ أو الرد.", threadID, messageID);

  const name = await Users.getNameUser(uid);
  const verdicts = [
    "الإعدام بالكلمات 😂",
    "السجن المؤبد في المجموعة",
    "البراءة لعدم كفاية الأدلة",
    "غرامة 100$ من الخزينة",
    "نفي خارج الإمبراطورية"
  ];

  const verdict = verdicts[Math.floor(Math.random() * verdicts.length)];

  api.sendMessage(
`┏━━━━ ⚖️ ━━━━┓
  مـحـكـمـة الإمـبـراطـوريـة
┗━━━━ ⚖️ ━━━━┛

👤 المتهم: ${name}
⚖️ الحكم: ${verdict}

◈ ─────────────── ◈
│←› القاضي: أيمن 👑`,
    threadID,
    messageID
  );
};
