const axios = require('axios');

module.exports.config = {
    name: "ميكو",
    version: "2.0.0",
    hasPermission: 0,
    credits: "Ayman",
    description: "الذكاء الاصطناعي ميكو - يجيب على أسئلتك تلقائياً",
    commandCategory: "ذكاء اصطناعي",
    cooldowns: 1
};

module.exports.handleEvent = async function ({ api, event }) {
    const { threadID, messageID, body, senderID } = event;

    if (!body || senderID == api.getCurrentUserID()) return;

    let userQuery = body.trim().toLowerCase();

    // التفاعل إذا بدأت الرسالة بكلمة "ميكو" أو انتهت بعلامة استفهام "؟"
    if (userQuery.startsWith("ميكو") || userQuery.endsWith("؟")) {
        
        // إزالة كلمة "ميكو" من السؤال إذا وجدت ليكون البحث دقيقاً
        let queryText = userQuery.replace("ميكو", "").trim();
        if (!queryText) return;

        api.setMessageReaction("🤖", messageID, () => {}, true);

        // تم إصلاح الرابط وتشفير النصوص العربية بشكل صحيح
        const apiURL = `https://luna-apl-shv0.onrender.com/chat?text=${encodeURIComponent(queryText)}`;

        try {
            const response = await axios.get(apiURL);
            
            // استخراج الرد سواء كان داخل كائن (object) أو نص مباشر
            let reply = "";
            if (response.data && response.data.reply) {
                reply = response.data.reply;
            } else if (typeof response.data === 'string') {
                reply = response.data;
            } else {
                reply = "عذراً سيدي، لم أستطع فهم هذا السؤال.";
            }

            const finalMsg = `◈ ───『 الـذكـاء مـيـكـو 🧠 』─── ◈\n\n${reply}\n\n———————————————\n│←› بـأوامـر: الـتـوب أيـمـن 👑`;
            
            return api.sendMessage(finalMsg, threadID, messageID);

        } catch (error) {
            console.error("Error with Miko API:", error);
            // لا نرسل رسالة خطأ في الـ handleEvent لتجنب إزعاج الشات
        }
    }
};

module.exports.run = async function ({ api, event, args }) {
    // تشغيل الأمر يدوياً عند كتابة "ميكو [السؤال]"
    const { threadID, messageID } = event;
    if (!args[0]) return api.sendMessage("تفضل سيدي، أنا ميكو.. كيف يمكنني مساعدتك؟ 👑", threadID, messageID);
    
    // إعادة توجيه الطلب للـ handleEvent أو تنفيذه هنا
    return this.handleEvent({ api, event });
};
