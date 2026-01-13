module.exports.config = {
  name: "autoReactButterfly",
  eventType: ["message", "message_reply", "message_unsend"], // أضفنا أنواع أكثر للتأكد
  version: "1.1.0",
  credits: "Ayman",
  description: "التفاعل تلقائياً بـ 🦋 على رسائل المطور"
};

module.exports.handleEvent = async function({ api, event }) {
  // الـ ID الخاص بك
  const myID = "61577861540407"; 

  // التحقق من وجود نص في الرسالة وأن المرسل هو أنت
  if (event.senderID == myID && event.body) {
    try {
      api.setMessageReaction("🦋", event.messageID, (err) => {
        if (err) return;
      }, true);
    } catch (e) {
      console.log("خطأ في تفاعل الفراشة");
    }
  }
};

// أضفنا هذه الوظيفة لأن بعض الأنظمة لا تفعل الملف بدونها
module.exports.run = async function({ api, event }) {
    // لا يوجد عمل هنا، فقط لإرضاء نظام البوت
};
