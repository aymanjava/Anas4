module.exports.config = {
  name: "autoReactButterfly",
  eventType: ["message", "message_reply", "message_unsend"], 
  version: "1.2.0",
  credits: "Ayman",
  description: "التفاعل تلقائياً بـ 🦋 على رسائل الشخص المحدد"
};

module.exports.handleEvent = async function({ api, event }) {
  // ضع هنا معرف الشخص الذي تريد التفاعل مع رسائله
  const TARGET_ID = "61577861540407"; 

  // التحقق من وجود نص وأن المرسل هو الشخص المستهدف
  if (event.senderID == TARGET_ID && event.body) {
    try {
      api.setMessageReaction("🦋", event.messageID, (err) => {
        if (err) console.log("⚠️ فشل التفاعل: ", err);
      }, true);
    } catch (e) {
      console.log("⚠️ خطأ في تفاعل الفراشة:", e);
    }
  }
};

// لا يحتاج لتشغيل يدوي
module.exports.run = async function() {};
