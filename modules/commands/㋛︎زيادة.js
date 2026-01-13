module.exports.config = {
  name: "زيادة",
  version: "3.0.0",
  hasPermssion: 2,
  credits: "Ayman",
  description: "النظام الملكي للتحكم في الأموال (رد، تاغ، UID، تصفير، ضرب)",
  commandCategory: "المطور",
  usages: "[بالرد + مبلغ] | [رصيدي + مبلغ] | [تاغ + مبلغ] | [حذف/ضرب]",
  cooldowns: 0
};

module.exports.run = async function({ api, event, args, Currencies, Users }) {
    const { threadID, messageID, senderID, mentions, type, messageReply } = event;
    const out = (msg) => api.sendMessage(msg, threadID, messageID);

    // 👑 التحقق من الهوية السيادية
    const ADMIN_ID = "61577861540407";
    if (senderID !== ADMIN_ID) return out("⚠️ سيدي، هذه الصلاحيات خاصة بالإمبراطور أيمن فقط.");

    // --- 1. ميزة الرد الذكي (Message Reply) ---
    if (type == "message_reply") {
        const targetID = messageReply.senderID;
        const amount = parseInt(args[0]);
        if (isNaN(amount)) return out("⚠️ سيدي، يرجى الرد على الرسالة وكتابة المبلغ المطلوب فقط.");
        
        await Currencies.increaseMoney(targetID, amount);
        const name = (await Users.getData(targetID)).name;
        return out(`✨ [ مَـكـرمـة مـلـكـيـة ] ✨\n————————————————\n👤 الـمستـفيد: ${name}\n💰 الـمبلـغ: +${amount}$\n✅ تـم الـتـنـفيـذ بـأمـر الإمـبـراطـور.`);
    }

    const action = args[0];

    // --- 2. زيادة رصيد الإمبراطور نفسه ---
    if (action == "رصيدي") {
        const amount = parseInt(args[1]);
        if (isNaN(amount)) return out("⚠️ حدد المبلغ سيدي.");
        await Currencies.increaseMoney(senderID, amount);
        return out(`💰 تم تعزيز خزنتك الخاصة بمبلغ: ${amount}$`);
    }

    // --- 3. ميزة الضرب (تضاعف ثروة شخص) ---
    if (action == "ضرب") {
        let targetID, multiplier = parseInt(args[args.length - 1]);
        if (Object.keys(mentions).length > 0) targetID = Object.keys(mentions)[0];
        else if (!isNaN(args[1])) targetID = args[1];
        
        if (!targetID || isNaN(multiplier)) return out("⚠️ الاستخدام: زيادة ضرب [تاغ/ايدي] [الرقم]");
        
        const currentMoney = (await Currencies.getData(targetID)).money;
        const newAmount = currentMoney * (multiplier - 1); // لزيادة الفرق فقط
        await Currencies.increaseMoney(targetID, parseInt(newAmount));
        return out(`🔥 تم مضاعفة ثروة المستخدم ${multiplier} مرات!`);
    }

    // --- 4. ميزة الحذف والتصفير (Reset) ---
    if (action == "حذف") {
        let targetID;
        if (args[1] == "me") targetID = senderID;
        else if (Object.keys(mentions).length > 0) targetID = Object.keys(mentions)[0];
        else if (!isNaN(args[1])) targetID = args[1];

        if (!targetID) return out("⚠️ حدد من تريد تصفير حسابه.");
        
        const currentMoney = (await Currencies.getData(targetID)).money;
        await Currencies.decreaseMoney(targetID, parseInt(currentMoney));
        return out(`🧹 تم تصفير الحساب ومصادرة مبلغ: ${currentMoney}$`);
    }

    // --- 5. زيادة رصيد عبر التاغ أو الـ UID ---
    if (Object.keys(mentions).length > 0 || !isNaN(args[0])) {
        let targetID = Object.keys(mentions).length > 0 ? Object.keys(mentions)[0] : args[0];
        let amount = parseInt(args[args.length - 1]);
        
        if (isNaN(amount)) return out("⚠️ يرجى تحديد المبلغ في نهاية الأمر.");
        
        try {
            await Currencies.increaseMoney(targetID, amount);
            const name = (await Users.getData(targetID)).name || "مستخدم";
            return out(`✅ تم إضافة ${amount}$ إلى حساب [ ${name} ]`);
        } catch (e) { return out("⚠️ تعذر العثور على هذا المستخدم."); }
    }

    // --- واجهة المساعدة الإمبراطورية ---
    return out(`👑 [ لوحة تحكم الإمبراطور أيمن ]\n————————————————\n` +
               `🔹 للـرد: (رد على رسالة + المبلغ)\n` +
               `🔹 لـنفسـك: زيادة رصيدي [المبلغ]\n` +
               `🔹 بـالـتاغ: زيادة [تاغ] [المبلغ]\n` +
               `🔹 بـالايدي: زيادة [UID] [المبلغ]\n` +
               `🔹 للـضرب: زيادة ضرب [تاغ] [العدد]\n` +
               `🔹 للـحذف: زيادة حذف [me/تاغ/ايدي]`);
};
