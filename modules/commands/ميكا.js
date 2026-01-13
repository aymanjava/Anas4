const axios = require('axios');

module.exports.config = {
    name: "ميكا",
    version: "1.5.0",
    hasPermission: 0,
    credits: "Ayman",
    description: "ذكاء ميكا التلقائي - يرد على جميع الرسائل",
    commandCategory: "الذكاء الاصطناعي",
    cooldowns: 1
};

module.exports.handleEvent = async function ({ api, event }) {
    const { threadID, messageID, body, senderID } = event;

    // تجاهل الرسائل الفارغة أو إذا كان المرسل هو البوت نفسه
    if (!body || senderID == api.getCurrentUserID()) return;

    let userQuery = body.trim();

    // وضع تفاعل "تفكير" فور استلام الرسالة
    api.setMessageReaction("💭", messageID, () => {}, true);

    // رابط الـ API
    const apiURL = `https://luna-apl-shv0.onrender.com/chat?text=${encodeURIComponent(userQuery)}`;

    try {
        const response = await axios.get(apiURL);

        if (response.data) {
            const reply = response.data.reply || (typeof response.data === 'string' ? response.data : "ممم، لم أفهم ذلك جيداً..");
            
            // جلب اسم الشخص لعمل منشن
            const userInfo = await api.getUserInfo(senderID);
            const name = userInfo[senderID].name;

            return api.sendMessage({
                body: `╭──── • 𝑴𝑰𝑲𝑨 • ────╮\n\n🗨️ يا: ${name}\n\n${reply}\n\n╰──────────────╯`,
                mentions: [{
                    tag: name,
                    id: senderID
                }]
            }, threadID, messageID);
            
        }
    } catch (error) {
        console.error("Error in MIKA AI:", error.message);
        // في حال الخطأ نكتفي بحذف التفاعل لعدم إزعاج المستخدم
        api.setMessageReaction("", messageID, () => {}, true);
    }
};

module.exports.run = function () {
    return;
};
