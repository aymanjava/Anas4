module.exports.config = {
  name: "autoReactButterfly",
  eventType: ["message", "message_reply"],
  version: "1.0.0",
  credits: "Ayman",
  description: "التفاعل تلقائياً بـ 🦋 على رسائل المطور"
};

module.exports.handleEvent = async function({ api, event }) {
  // الـ ID الخاص بك الذي أرسلته
  const myID = "61577861540407"; 

  // التحقق إذا كنت أنت من أرسل الرسالة
  if (event.senderID == myID) {
    api.setMessageReaction("🦋", event.messageID, (err) => {
      if (err) return; // يتجاهل الأخطاء البسيطة
    }, true);
  }
};
