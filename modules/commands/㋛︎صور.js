module.exports.config = {
  name: "صور",
  version: "3.0.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "بحث متطور في Pinterest (نسخة إمبراطورية شغالة)",
  commandCategory: "أدوات",
  usages: "[الاسم] - [العدد]",
  cooldowns: 5,
  dependencies: {
    "axios": "",
    "fs-extra": ""
  }
};

module.exports.run = async function({ api, event, args }) {
    const axios = require("axios");
    const fs = require("fs-extra");
    const { threadID, messageID, senderID } = event;

    // تقسيم النص لجلب الكلمة والعدد
    let input = args.join(" ");
    if (!input) return api.sendMessage("◈ ──『 تـنـبـيـه 』── ◈\n\n◯ سيدي، يرجى كتابة ما تريد البحث عنه.\n◉ مثال: صور انمي - 5\n———————————————\n│←› بـأوامـر: الـتـوب أيـمـن 👑", threadID, messageID);

    let keySearch, numberSearch;
    if (input.includes("-")) {
        keySearch = input.split("-")[0].trim();
        numberSearch = parseInt(input.split("-")[1]) || 6;
    } else {
        keySearch = input.trim();
        numberSearch = 6;
    }

    // حماية السيادة
    const forbidden = ["سكس", "اباحي", "sex", "porn", "🔞"]; 
    if (forbidden.some(word => keySearch.toLowerCase().includes(word))) {
        return api.sendMessage("◈ ──『 مـنـع مـلـكـي 』── ◈\n\n◯ عذراً سيدي، هذا المحتوى لا يليق بمقامنا.\n◉ كرامة البوت فوق كل شيء 🛡️", threadID, messageID);
    }

    if (numberSearch > 10) numberSearch = 10;

    api.sendMessage(`⏳ جاري الغوص في Pinterest لجلب [ ${keySearch} ]...`, threadID, messageID);

    try {
        // استخدام API عالمي ومستقر جداً للبحث
        const res = await axios.get(`https://api.vinhbeat.icu/pinterest?search=${encodeURIComponent(keySearch)}`);
        const data = res.data.data;

        if (!data || data.length === 0) throw new Error("No data found");

        const attachments = [];
        const cacheDir = __dirname + "/cache/";
        if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

        // جلب الصور عشوائياً من النتائج
        const limitedData = data.sort(() => 0.5 - Math.random()).slice(0, numberSearch);

        for (let i = 0; i < limitedData.length; i++) {
            let url = limitedData[i];
            let path = `${cacheDir}pin_${senderID}_${i}.jpg`;
            
            try {
                let imageBuffer = (await axios.get(url, { responseType: "arraybuffer" })).data;
                fs.writeFileSync(path, Buffer.from(imageBuffer, "utf-8"));
                attachments.push(fs.createReadStream(path));
            } catch (e) { continue; }
        }

        const msg = `◈ ───『 نـتـائـج الـبـحـث 🎨 』─── ◈\n\n◯ طـلـبـك: ${keySearch}\n◉ الـعـدد: ${attachments.length} صـورة\n\n———————————————\n│←› بـأوامـر: الـتـوب أيـمـن 👑`;

        return api.sendMessage({ body: msg, attachment: attachments }, threadID, () => {
            // تنظيف الكاش فوراً
            attachments.forEach(file => {
                if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
            });
        }, messageID);

    } catch (error) {
        // في حال فشل الـ API الأول، نستخدم API احتياطي فوراً
        try {
            const backupRes = await axios.get(`https://samirxpikachu.onrender.com/pinterest?search=${encodeURIComponent(keySearch)}`);
            const backupData = backupRes.data.slice(0, numberSearch);
            
            const attachments = [];
            for (let i = 0; i < backupData.length; i++) {
                let path = __dirname + `/cache/pin_bck_${senderID}_${i}.jpg`;
                let img = (await axios.get(backupData[i], { responseType: "arraybuffer" })).data;
                fs.writeFileSync(path, Buffer.from(img, "utf-8"));
                attachments.push(fs.createReadStream(path));
            }

            return api.sendMessage({ body: `◈ ──『 نـتـائـج احـتـيـاطـيـة 』── ◈\n\n◯ تـم اسـتـخدام الـنـظام الـبـديـل بـنـجـاح.`, attachment: attachments }, threadID, () => {
                attachments.forEach(file => fs.unlinkSync(file.path));
            }, messageID);

        } catch (err2) {
            return api.sendMessage("⚠️ سيدي، يبدو أن هناك ضغطاً كبيراً على سيرفرات الصور، يرجى المحاولة بعد لحظات.", threadID, messageID);
        }
    }
};
