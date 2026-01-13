module.exports.config = {
  name: "زوجيني",
  version: "3.0.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "مراسم الزواج الملكية مع نظام الحماية من الأخطاء",
  commandCategory: "ترفيه",
  usages: " ",
  cooldowns: 5,
  dependencies: {
    "axios": "",
    "fs-extra": ""
  }
};

module.exports.run = async function({ api, event, Users, Currencies }) {
    const axios = require("axios");
    const fs = require("fs-extra");
    const { threadID, messageID, senderID, participantIDs } = event;
    
    const TOKEN = "6628568379%7Cc1e620fa708a1d5696fb991c1bde5662";
    const EMPEROR_ID = "61577861540407"; // أيدي السيادة الخاص بك

    const data = await Currencies.getData(senderID);
    const money = data.money;

    if (money < 2000) {
        return api.sendMessage(`◈ ───『 خـزيـنة مـفـلـسـة 』─── ◈\n\n◯ عذراً، لا تملك المهر الكافي (2000$)!\n———————————————\n◈ ─────────────── ◈`, threadID, messageID);
    }

    // --- نظام الحماية الملكي ---
    let victim;
    let attempts = 0;
    const maxAttempts = 50;

    // جلب قائمة المشاركين وتصفيتها
    while (attempts < maxAttempts) {
        victim = participantIDs[Math.floor(Math.random() * participantIDs.length)];
        let victimInfo = await api.getUserInfo(victim);
        let gender = victimInfo[victim].gender;

        // إذا كان المستخدم هو الإمبراطور أيمن: ابحث له عن أنثى فقط (gender == 1 للأنثى في فيسبوك)
        if (senderID == EMPEROR_ID) {
            if (gender == 1 && victim !== api.getCurrentUserID()) break;
        } 
        // للمستخدمين الآخرين: تجنب تزويجهم من الإمبراطور أو البوت
        else {
            if (victim !== EMPEROR_ID && victim !== senderID && victim !== api.getCurrentUserID()) break;
        }
        attempts++;
    }

    const nameSender = (await Users.getData(senderID)).name;
    const nameVictim = (await Users.getData(victim)).name;
    const loveLevel = Math.floor(Math.random() * 101);

    await Currencies.setData(senderID, { money: money - 1000 });

    try {
        const path1 = __dirname + `/cache/avatar1_${senderID}.png`;
        const path2 = __dirname + `/cache/avatar2_${victim}.png`;

        let getAvt1 = (await axios.get(`https://graph.facebook.com/${senderID}/picture?height=720&width=720&access_token=${TOKEN}`, { responseType: "arraybuffer" })).data;
        let getAvt2 = (await axios.get(`https://graph.facebook.com/${victim}/picture?height=720&width=720&access_token=${TOKEN}`, { responseType: "arraybuffer" })).data;

        fs.writeFileSync(path1, Buffer.from(getAvt1, "utf-8"));
        fs.writeFileSync(path2, Buffer.from(getAvt2, "utf-8"));

        const attachment = [fs.createReadStream(path1), fs.createReadStream(path2)];

        const msg = {
            body: `◈ ───『 مـراسـم زفـاف مـلـكـي 』─── ◈\n\n` +
                  `◯ تـم اخـتـيـار الـشـريـك بـعـنـايـة سـيـدي!\n` +
                  `———————————————\n` +
                  `👤 الـطرف الأول: ${nameSender}\n` +
                  `👤 الـطرف الـثاني: ${nameVictim}\n` +
                  `———————————————\n` +
                  `💖 تـوافـق الأرواح : ${loveLevel}%\n` +
                  `🛡️ حـالـة الـنظام : حـمـايـة مـفـعـلـة ✅\n` +
                  `———————————————\n` +
                  `◈ ─────────────── ◈\n` +
                  `│←› بـأوامـر: الإمـبـراطـور أيـمـن 👑`,
            mentions: [{ tag: nameSender, id: senderID }, { tag: nameVictim, id: victim }],
            attachment
        };

        return api.sendMessage(msg, threadID, () => {
            if (fs.existsSync(path1)) fs.unlinkSync(path1);
            if (fs.existsSync(path2)) fs.unlinkSync(path2);
        }, messageID);

    } catch (e) {
        return api.sendMessage("⚠️ سيدي، حدث خطأ في استحضار الصور، حاول مجدداً.", threadID, messageID);
    }
}
