module.exports.config = {
  name: "هدية",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "نظام المنح والهدايا الإمبراطورية العشوائية",
  commandCategory: "الاموال",
  usages: "[الكل / @تاغ / معرف_المستخدم]",
  cooldowns: 10
};

// سجل الاستلام لمنع التكرار (يصفر عند إعادة تشغيل البوت)
if (!global.giftSystem) { global.giftSystem = new Set(); }

module.exports.run = async function ({ api, event, Currencies, args }) {
    const { threadID, messageID, senderID, mentions } = event;
    const out = (msg) => api.sendMessage(msg, threadID, messageID);

    // مبالغ مالية ضخمة تليق برعية الإمبراطور
    const amounts = ["5000", "15000", "30000", "50000", "100000", "250000", "500000", "1000000"];
    const randomAmount = amounts[Math.floor(Math.random() * amounts.length)];

    // 1. حالة منح الهدية للجميع (للمطورين فقط أو حسب رغبتك)
    if (args[0] === "all") {
        if (event.senderID != "61576232405796") return out("⚠️ سيدي، هذا الأمر السيادي يتطلب صلاحيات الإمبراطور فقط.");
        const allUsers = global.data.allCurrenciesID;
        for (let id of allUsers) {
            await Currencies.increaseMoney(id, parseInt(randomAmount));
        }
        return out(`🎊 بـأمر مـن الـسـيادة، تـم مـنح جـميع الـمواطنين هـدية بـقيمة: ${randomAmount}$ !`);
    }

    // 2. حالة منح الهدية عبر التاغ (@mention)
    const mentionID = Object.keys(mentions);
    if (mentionID.length > 0) {
        const targetID = mentionID[0];
        if (global.giftSystem.has(targetID)) return out("⚠️ سيدي، هذا الشخص حصل على مكرمة مسبقاً، لا يمكنه الطمع أكثر!");
        
        await Currencies.increaseMoney(targetID, parseInt(randomAmount));
        global.giftSystem.add(targetID);
        return out(`🎁 تـم مـنح ${mentions[targetID].replace("@", "")} هـدية مـلـكية بـقيمة: ${randomAmount}$`);
    }

    // 3. حالة استلام المستخدم لهديته الشخصية (الأمر الافتراضي)
    if (global.giftSystem.has(senderID)) {
        return out("⚠️ لـقد حـصلت عـلى هـديتك مـسبقاً، انـتظر الـموسم الـقادم!");
    }

    await Currencies.increaseMoney(senderID, parseInt(randomAmount));
    global.giftSystem.add(senderID);

    return out(`┏━━━━━━ 💰 ━━━━━━┓\n   مَـكـرمـة إمـبـراطـوريـة\n┗━━━━━━ 💰 ━━━━━━┛\n\n✨ مـبروك! لـقد ابـتسم لـك الـحظ اليوم.\n💵 الـمبلغ: ${randomAmount}$\n\n🛍️ تـمت إضـافة الـمبلغ لـرصيدك بـنجاح!`);
};
