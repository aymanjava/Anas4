const moment = require("moment-timezone");
const axios = require('axios');

module.exports.config = {
    name: "ذكاء",
    version: "1.0.0",
    hasPermission: 0,
    credits: "", // API by yazky
    description: "ذكاء يجيب عن الأسئلة",
    prefix: false,
        category: "قــســم الــادوات",
    cooldowns: 5,
};

module.exports.run = async function ({ api, event, args }) {
    try {
        const { messageID, messageReply, threadID } = event;
        let prompt = args.join(' ');

        if (messageReply) {
            const repliedMessage = messageReply.body;
            prompt = `${repliedMessage} ${prompt}`;
        }

        if (!prompt) {
            return api.sendMessage('[❗] | أكـتـب شـيـئـا بـعـد الأمـر', threadID, messageID);
        }
        api.sendMessage('🗨️ | جـارٍ البحـث عـن إجـابـة، الـمـرجـو الإنـتـظـار...', threadID);

        // Delay
        await new Promise(resolve => setTimeout(resolve, 2000)); // Adjust the delay time as needed

        // API endpoint
        const gpt_api = `https://betadash-api-swordslush.vercel.app/gpt3-turbo?question=${encodeURIComponent(prompt)}`;
        const Ho_Chi_minhTime = moment.tz('Asia/Ho_Chi_minh');
        const formattedDateTime = Ho_Chi_minhTime.format('MMMM D, YYYY h:mm A');

        // Make the request
        const response = await axios.get(gpt_api);

        if (response.data && response.data.response) {
            const generatedText = response.data.response;

            // Ai Answer Here
            api.sendMessage(
                `🎓 𝐆𝐩𝐭3 𝐀𝐧𝐬𝐰𝐞𝐫\n━━━━━━━━━━━━━━━━\n\n🖋️ | الـسـؤال: '${prompt}'\n\n📜 | الإجـابـة: ${generatedText}\n\n۵ ${formattedDateTime} ۵\n\n━━━━━━━━━━━━━━━━`,
                threadID,
                messageID
            );
        } else {
            console.error('API response did not contain expected data:', response.data);
            api.sendMessage(
                `❌ | حدث خطأ أثناء البحث عن إجابة ${JSON.stringify(response.data)}`,
                threadID,
                messageID
            );
        }
    } catch (error) {
        console.error('Error:', error);
        api.sendMessage(
            `❌ | حدث خطأ أثناء إنشاء استجابة النص. يرجى المحاولة مرة أخرى لاحقًا. تفاصيل الخطأ: ${error.message}`,
            event.threadID,
            event.messageID
        );
    }
};