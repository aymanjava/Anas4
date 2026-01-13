const fs = require("fs-extra");
const axios = require("axios");

module.exports.config = {
    name: "كهف",
    version: "2.5.0",
    hasPermssion: 0,
    credits: "Ayman",
    description: "العمل في مناجم وكهوف العالم لجمع الثروة",
    commandCategory: "الاموال",
    cooldowns: 5,
    envConfig: {
        cooldownTime: 600000 // 10 دقائق
    }
};

module.exports.handleReply = async ({ event, api, handleReply, Currencies }) => {
    const { threadID, messageID, senderID, body } = event;
    let data = (await Currencies.getData(senderID)).data || {};

    if (handleReply.author != senderID) 
        return api.sendMessage("⚠️ سيدي، هذا العمل مخصص لمن طلب الأمر فقط!", threadID, messageID);

    // مبالغ إمبراطورية ضخمة
    const salary = Math.floor(Math.random() * (20000 - 8000 + 1)) + 8000; 
    
    const destinations = {
        "1": "فيتنام 🇻🇳", "2": "الصين 🇨🇳", "3": "اليابان 🇯🇵",
        "4": "تايلاند 🇹🇭", "5": "أمريكا 🇺🇸", "6": "العراق 🇮🇶",
        "7": "مصر 🇪🇬", "8": "المكسيك 🇲🇽", "9": "أيسلندا 🇮🇸",
        "10": "البرازيل 🇧🇷", "11": "أستراليا 🇦🇺", "12": "فرنسا 🇫🇷",
        "13": "الأردن 🇯🇴", "14": "اليونان 🇬🇷", "15": "روسيا 🇷🇺"
    };

    if (!(body in destinations)) 
        return api.sendMessage("⚠️ اختر رقماً من القائمة المعروضة (1-15) سيدي!", threadID, messageID);

    const country = destinations[body];
    await Currencies.increaseMoney(senderID, salary);
    api.unsendMessage(handleReply.messageID);

    // روابط صور كهوف متنوعة لإبهار الرعية
    const caveImages = [
        "https://images.alphacoders.com/224/224856.jpg",
        "https://images.alphacoders.com/605/605178.jpg",
        "https://images6.alphacoders.com/433/433503.jpg",
        "https://images.alphacoders.com/100/1001150.jpg"
    ];
    const randomImg = caveImages[Math.floor(Math.random() * caveImages.length)];
    const path = __dirname + `/cache/work_${senderID}.jpg`;
    
    const imgRes = await axios.get(randomImg, { responseType: "arraybuffer" });
    fs.writeFileSync(path, Buffer.from(imgRes.data, "utf-8"));

    return api.sendMessage({
        body: `⛏️ | نـتـائـج الـتـنـقـيـب:\n————————————————\n✨ لـقد عـدت مـن كـهوف: ${country}\n💰 الـثروة الـمُكتـسبة: ${salary}$\n\n✅ تـم إيـداع الـذهب في خـزنتـك بـنجاح!`,
        attachment: fs.createReadStream(path)
    }, threadID, () => {
        data.lastWork = Date.now();
        Currencies.setData(senderID, { data });
        if (fs.existsSync(path)) fs.unlinkSync(path);
    }, messageID);
};

module.exports.run = async ({ event, api, Currencies }) => {
    const { threadID, messageID, senderID } = event;
    const cooldownTime = global.configModule[this.config.name].cooldownTime;
    let data = (await Currencies.getData(senderID)).data || {};

    if (typeof data.lastWork !== "undefined" && cooldownTime - (Date.now() - data.lastWork) > 0) {
        const timeLeft = cooldownTime - (Date.now() - data.lastWork);
        const mins = Math.floor(timeLeft / 60000);
        const secs = Math.floor((timeLeft % 60000) / 1000);
        return api.sendMessage(`⚠️ سيدي، الـعـمـال يـرتـاحـون الآن..\nاستعد للرحلة القادمة خلال: ${mins}د و ${secs}ث.`, threadID, messageID);
    }

    let menu = `⛏️ | خـريـطـة الـكـهـوف الـعـالـمـيـة\n————————————————\n`;
    menu += `1- فيتنام 🇻🇳  2- الصين 🇨🇳  3- اليابان 🇯🇵\n`;
    menu += `4- تايلاند 🇹🇭  5- أمريكا 🇺🇸  6- العراق 🇮🇶\n`;
    menu += `7- مصر 🇪🇬  8- المكسيك 🇲🇽  9- أيسلندا 🇮🇸\n`;
    menu += `10- البرازيل 🇧🇷  11- أستراليا 🇦🇺  12- فرنسا 🇫🇷\n`;
    menu += `13- الأردن 🇯🇴  14- اليونان 🇬🇷  15- روسيا 🇷🇺\n\n`;
    menu += `📌 رد بـرقـم الـدولـة لـتبدأ الـمغامـرة!`;

    return api.sendMessage(menu, threadID, (error, info) => {
        global.client.handleReply.push({
            type: "choosee",
            name: this.config.name,
            author: senderID,
            messageID: info.messageID
        });
    }, messageID);
};
