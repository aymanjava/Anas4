const axios = require("axios");

module.exports.config = {
    name: "كابوي",
    version: "2.0.0",
    hasPermssion: 0,
    credits: "Ayman",
    description: "لعبة راعي البقر (كابوي) - راهن واربح أو اخسر ثروتك",
    commandCategory: "العاب",
    usages: "[المبلغ]",
    cooldowns: 5
};

module.exports.run = async ({ api, event, args, Currencies }) => {
    const { threadID, messageID, senderID } = event;
    const isTop = global.config.ADMINBOT.includes(senderID);

    if (args[0] == "help") {
        let imag = (await axios.get("https://i.imgur.com/VYf0UGv.jpg", { responseType: "stream" })).data;
        return api.sendMessage({ body: '🤠 نظام الكابوي الملكي:\nاختر بقرة وحاول سحبها، كل بقرة لها ربح مضاعف ولكن خطر أكبر!', attachment: imag }, threadID, messageID);
    }

    const betAmount = parseInt(args[0]);
    if (isNaN(betAmount) || betAmount < 50) {
        return api.sendMessage('⚠️ سيدي، الحد الأدنى للمراهنة هو 50$ من رصيد الخزينة!', threadID, messageID);
    }

    let userMoney = (await Currencies.getData(senderID)).money || 0;
    if (!isTop && userMoney < betAmount) {
        return api.sendMessage(`❌ رصيدك الحالي (${userMoney}$) لا يكفي لهذه المراهنة!`, threadID, messageID);
    }

    // خصم مبلغ الرهان فوراً (نظام الصرف)
    if (!isTop) await Currencies.decreaseMoney(senderID, betAmount);

    let gif = (await axios.get("https://i.ibb.co/2dgF3vf/keobogif.gif", { responseType: "stream" })).data;

    const msg = {
        body: `◈ ───『 مـراهـنـات الـكـابـوي 』─── ◈\n\n` +
            `💰 مبلغ الرهان: ${betAmount}$\n` +
            `اختر البقرة التي تراهن على سحبها:\n` +
            `1. البقرة الهادئة (ربح x2)\n` +
            `2. البقرة البرية (ربح x5)\n` +
            `3. البقرة العملاقة (ربح x12)\n` +
            `4. البقرة الأسطورية (ربح x50)\n` +
            `5. بقرة الإمبراطور (ربح x100)\n\n` +
            `📌 رد برقم البقرة لتبدأ المغامرة!`,
        attachment: gif
    };

    return api.sendMessage(msg, threadID, (err, info) => {
        global.client.handleReply.push({
            name: this.config.name,
            messageID: info.messageID,
            author: senderID,
            betAmount,
            isTop
        });
    }, messageID);
};

module.exports.handleReply = async ({ api, event, handleReply, Currencies, Users }) => {
    const { threadID, senderID, messageID, body } = event;
    const { betAmount, author, isTop } = handleReply;

    if (author !== senderID) return api.sendMessage('❌ هذه اللعبة ليست لك سيدي!', threadID, messageID);
    if (isNaN(body) || body < 1 || body > 5) return api.sendMessage('❌ اختر من 1 إلى 5 فقط!', threadID, messageID);

    const multipliers = [0, 2, 5, 12, 50, 100];
    const winChances = [0, 60, 40, 20, 10, 5]; // احتمالات الفوز لكل خيار

    api.sendMessage(`🤠 جاري محاولة سحب البقرة رقم ${body}.. انتظر قليلاً!`, threadID);

    setTimeout(async () => {
        const name = await Users.getNameUser(senderID);
        // التوب يفوز دائماً، البقية حسب الاحتمال
        const isWin = isTop || (Math.random() * 100) < winChances[body];
        
        if (isWin) {
            const prize = betAmount * multipliers[body];
            await Currencies.increaseMoney(senderID, prize);
            return api.sendMessage(`◈ ──『 انـتـصـار كـابـوي 』── ◈\n\n✅ مبروك يا ${name}!\nلقد نجحت في سحب البقرة وحصلت على: ${prize.toLocaleString()}$\n\n│←› بـإدارة الـتـوب ايـمـن 👑`, threadID, messageID);
        } else {
            // نظام الخسارة: المال تم خصمه بالفعل عند البداية
            return api.sendMessage(`◈ ──『 هـزيـمـة كـابـوي 』── ◈\n\n💀 للأسف يا ${name}!\nلقد ركلتك البقرة وهربت.. خسرت رهاناً بقيمة ${betAmount}$\n\n│←› بـإدارة الـتـوب ايـمـن 👑`, threadID, messageID);
        }
    }, 3000);
};
