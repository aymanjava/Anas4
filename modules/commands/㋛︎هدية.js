module.exports.config = {
  name: "هدية",
  version: "2.1.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "نظام المنح والهدايا الإمبراطورية (شخصي، رد، تاغ، وللكل)",
  commandCategory: "الاموال",
  usages: "[الكل / رد على رسالة / @تاغ]",
  cooldowns: 10
};

// سجل الاستلام لمنع الطمع (يصفر عند إعادة تشغيل البوت)
if (!global.giftSystem) { global.giftSystem = new Set(); }

module.exports.run = async function ({ api, event, Currencies, args, Users }) {
    const { threadID, messageID, senderID, mentions, type, messageReply } = event;
    const out = (msg) => api.sendMessage(msg, threadID, messageID);

    // ✅ الأيدي الخاص بك سيدي (تم التحديث بنجاح)
    const EMPEROR_ID = "61577861540407";

    // مبالغ تليق بعظمة خزنتك
    const amounts = [10000, 50000, 100000, 250000, 500000, 1000000, 5000000];
    const randomAmount = amounts[Math.floor(Math.random() * amounts.length)];

    // 1️⃣ حالة منح الهدية للجميع (حصري للإمبراطور أيمن)
    if (args[0] === "الكل" || args[0] === "all") {
        if (senderID !== EMPEROR_ID) return out("⚠️ سيدي، توزيع المنح الشاملة هو حق سيادي للإمبراطور أيمن فقط.");
        
        const allUsers = global.data.allCurrenciesID;
        let count = 0;
        for (let id of allUsers) {
            await Currencies.increaseMoney(id, randomAmount);
            count++;
        }
        return out(`🎊 بـأمر مـن الـسـيادة الإمـبـراطـوريـة..\nتـم مـنح جـميع الـمواطنين (${count}) هـدية بـقيمة: ${randomAmount}$ !`);
    }

    // 2️⃣ حالة الرد على رسالة لمنح شخص معين هدية
    if (type === "message_reply") {
        const targetID = messageReply.senderID;
        const name = (await Users.getData(targetID)).name;
        
        if (global.giftSystem.has(targetID)) return out(`⚠️ العضو [ ${name} ] حصل على مكرمة مسبقاً.`);
        
        await Currencies.increaseMoney(targetID, randomAmount);
        global.giftSystem.add(targetID);
        return out(`🎁 [ هـديـة مـلـكـيـة ]\nلقد منحت ${name} مبلغ: ${randomAmount}$ عن طريق الرد.`);
    }

    // 3️⃣ حالة التاغ (@mention)
    const mentionID = Object.keys(mentions);
    if (mentionID.length > 0) {
        const targetID = mentionID[0];
        if (global.giftSystem.has(targetID)) return out("⚠️ هذا الشخص حصل على مكرمة مسبقاً، لا يمكنه الطمع أكثر!");
        
        await Currencies.increaseMoney(targetID, randomAmount);
        global.giftSystem.add(targetID);
        return out(`🎁 تـم مـنح ${mentions[targetID].replace("@", "")} هـدية مـلـكية بـقيمة: ${randomAmount}$`);
    }

    // 4️⃣ حالة استلام المستخدم لهديته الشخصية (الأمر الافتراضي)
    if (global.giftSystem.has(senderID)) {
        return out("⚠️ لـقد حـصلت عـلى هـديتك مـسبقاً، انـتظر الـموسم الـقادم!");
    }

    await Currencies.increaseMoney(senderID, randomAmount);
    global.giftSystem.add(senderID);

    return out(`┏━━━━━━ 💰 ━━━━━━┓\n   مَـكـرمـة إمـبـراطـوريـة\n┗━━━━━━ 💰 ━━━━━━┛\n\n✨ مـبروك! لـقد ابـتسم لـك الـحظ اليوم.\n💵 الـمبلغ الـعشوائي: ${randomAmount.toLocaleString()}$\n\n🛍️ تـمت إضـافة الـمبلغ لـرصيدك بـنجاح!`);
};
