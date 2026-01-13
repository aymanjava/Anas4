module.exports.config = {
  name: "سرقة",
  version: "2.5.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "محاكاة عمليات السطو والسرقة بين الأعضاء",
  commandCategory: "الاموال",
  usages: "سرقة (عشوائي)",
  cooldowns: 120 // تقليل وقت الانتظار لزيادة الحماس
};

module.exports.run = async function({ api, event, Users, Currencies }) {
    const { threadID, messageID, senderID } = event;
    const EMPEROR_ID = "61577861540407"; // أيدي السيادة الخاص بك

    var alluser = global.data.allUserID;
    let victim = alluser[Math.floor(Math.random() * alluser.length)];
    
    // 🛡️ حماية الإمبراطور: لا يمكن سرقة أيمن أبداً
    if (victim == EMPEROR_ID) {
        return api.sendMessage(`◈ ───『 فـشـل الـسطـو 』─── ◈\n\n◯ الـهدف: الإمـبـراطـور أيـمـن\n◉ الـنتيـجة: حـاولـت الـتسلل لـخزنة الـملك لـكن الـحراس جـلدوك هـرباً!\n———————————————\n◈ ─────────────── ◈`, threadID, messageID);
    }

    if (victim == senderID || victim == api.getCurrentUserID()) {
        return api.sendMessage("◈ ───『 تـنـبـيـه 』─── ◈\n\n◯ سيدي، لا يمكنك السرقة من نفسك أو من البوت!\n———————————————\n◈ ─────────────── ◈", threadID, messageID);
    }

    let nameVictim = (await Users.getData(victim)).name;
    let nameStealer = (await Users.getData(senderID)).name;
    
    var route = Math.floor(Math.random() * 2); // احتمالية النجاح أو الفشل (50/50)

    // --- سيناريو النجاح (السرقة تمت) ---
    if (route == 0) {
        const victimData = await Currencies.getData(victim);
        const victimMoney = victimData.money;
        
        // مبالغ سرقة إمبراطورية (من 1000 إلى 50000)
        var stolenMoney = Math.floor(Math.random() * 49001) + 1000;

        if (victimMoney <= 0) {
            return api.sendMessage(`◈ ───『 سـطـو فـاشـل 』─── ◈\n\n◯ الـضحـية: ${nameVictim}\n◉ الـنتيـجة: لـقد سـرقت ${nameVictim} لـكنه مـفلس تـماماً!\n———————————————\n◈ ─────────────── ◈`, threadID, messageID);
        }

        let amountToTake = (victimMoney < stolenMoney) ? victimMoney : stolenMoney;

        await Currencies.decreaseMoney(victim, amountToTake);
        await Currencies.increaseMoney(senderID, amountToTake);

        return api.sendMessage(`◈ ───『 سـطـو نـاجـح 💸 』─── ◈\n\n◯ الـسارق: ${nameStealer}\n◉ الـضحـية: ${nameVictim}\n◉ الـمبلغ: ${amountToTake.toLocaleString()}$\n———————————————\n◈ ─────────────── ◈`, threadID, messageID);
    } 

    // --- سيناريو الفشل (تم القبض على السارق) ---
    else {
        const stealerData = await Currencies.getData(senderID);
        const stealerMoney = stealerData.money;

        if (stealerMoney <= 500) {
            return api.sendMessage(`◈ ───『 تـنـبـيـه 』─── ◈\n\n◯ لـيس لـديك مـال كـافٍ لـدفع الـغرامة إذا قُـبض عـليك!\n———————————————\n◈ ─────────────── ◈`, threadID, messageID);
        }

        // غرامة: خسارة 30% من أموالك
        let fine = Math.floor(stealerMoney * 0.3);
        let reward = Math.floor(fine / 2);

        await Currencies.decreaseMoney(senderID, fine);
        await Currencies.increaseMoney(victim, reward);

        return api.sendMessage(`◈ ───『 تـم الـقبـض عـليك 👮 』─── ◈\n\n◯ الـسارق: ${nameStealer}\n◉ الـضحـية: ${nameVictim}\n◉ الـعقـوبة: غـرامـة بـقيمة ${fine.toLocaleString()}$\n———————————————\n◯ مـكافـأة الـضحـية: ${reward.toLocaleString()}$\n◈ ─────────────── ◈`, threadID, messageID);
    }
};
