const axios = require('axios');

module.exports.config = {
    name: "mika",
    version: "2.5.0",
    hasPermission: 0,
    credits: "Ayman",
    description: "ذكاء ميكا التلقائي المطور",
    commandCategory: "الذكاء الاصطناعي",
    cooldowns: 2
};

module.exports.handleEvent = async function ({ api, event }) {
    const { threadID, messageID, body, senderID } = event;

    // تجاهل الرسائل الفارغة، أو إذا كان المرسل هو البوت نفسه، أو الأوامر التي تبدأ بـ "/"
    if (!body || senderID == api.getCurrentUserID() || body.startsWith("/")) return;

    let userQuery = body.trim();

    // تجاهل الكلمات القصيرة جداً لتجنب الردود المزعجة
    if (userQuery.length < 2) return;

    try {
        // استخدام محرك ذكاء اصطناعي تفاعلي يدعم العربية
        const res = await axios.get(`https://api.simsimi.vn/v1/simtalk`, {
            params: {
                text: userQuery,
                lc: 'ar' 
            }
        });

        if (res.data && res.data.message) {
            let reply = res.data.message;

            // تنظيف الرد من الروابط أو الكلمات غير اللائقة إذا وجدت
            reply = reply.replace(/(https?:\/\/[^\s]+)/g, "...");

            // جلب اسم المستخدم للرد عليه
            const userInfo = await api.getUserInfo(senderID);
            const name = userInfo[senderID].name;

            return api.sendMessage({
                body: `╭──── • 𝑴𝑰𝑲𝑨 • ────╮\n\n🗨️ يا ${name}\n\n${reply}\n\n╰──────────────╯`,
                mentions: [{
                    tag: name,
                    id: senderID
                }]
            }, threadID, messageID);
        }
    } catch (error) {
        console.error("Mika Error:", error.message);
    }
};

module.exports.run = function () {
    // ترك هذه الوظيفة فارغة لأن البوت يعمل تلقائياً عبر handleEvent
    return;
};
