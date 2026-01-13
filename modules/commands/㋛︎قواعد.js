module.exports.config = {
    name: "القوانين",
    version: "2.0.0",
    hasPermssion: 0,
    credits: "Ayman",
    description: "إدارة قوانين المجموعة (إضافة، حذف، عرض)",
    commandCategory: "مسؤولي المجموعات",
    usages: "[اضف/حذف/قائمة] [النص/الرقم]",
    cooldowns: 2,
    dependencies: {
        "fs-extra": "",
        "path": ""
    }
};

module.exports.onLoad = () => {
    const fs = require("fs-extra");
    const path = require("path");
    const pathData = path.join(__dirname, "cache", "rules.json");
    if (!fs.existsSync(pathData)) fs.writeFileSync(pathData, "[]", "utf-8");
};

module.exports.run = ({ event, api, args, permssion }) => {
    const { threadID, messageID } = event;
    const fs = require("fs-extra");
    const path = require("path");
    const pathData = path.join(__dirname, "cache", "rules.json");

    let dataJson = JSON.parse(fs.readFileSync(pathData, "utf-8"));
    let thisThread = dataJson.find(item => item.threadID == threadID);

    if (!thisThread) {
        thisThread = { threadID, listRule: [] };
        dataJson.push(thisThread);
    }

    const mode = args[0];
    const content = args.slice(1).join(" ");

    switch (mode) {
        case "اضف": {
            if (permssion < 1) return api.sendMessage("⚠️ عذراً سيدي، هذا الأمر مخصص للمسؤولين فقط.", threadID, messageID);
            if (!content) return api.sendMessage("⚠️ يرجى كتابة نص القانون لإضافته.", threadID, messageID);
            
            if (content.includes("\n")) {
                const rules = content.split("\n").filter(r => r.trim() !== "");
                thisThread.listRule.push(...rules);
            } else {
                thisThread.listRule.push(content);
            }
            fs.writeFileSync(pathData, JSON.stringify(dataJson, null, 4), "utf-8");
            return api.sendMessage("✅ تم إضافة القوانين الجديدة إلى القائمة بنجاح.", threadID, messageID);
        }

        case "حذف":
        case "مسح": {
            if (permssion < 1) return api.sendMessage("⚠️ ليس لديك صلاحية لتعديل قوانين الإمبراطورية.", threadID, messageID);
            if (thisThread.listRule.length == 0) return api.sendMessage("⚠️ المجموعة لا تحتوي على قوانين لحذفها.", threadID, messageID);
            
            if (content === "الكل") {
                thisThread.listRule = [];
                api.sendMessage("🗑️ تم مسح جميع قوانين المجموعة بنجاح.", threadID, messageID);
            } else {
                let index = parseInt(content);
                if (isNaN(index) || index <= 0 || index > thisThread.listRule.length) {
                    return api.sendMessage(`⚠️ يرجى إدخال رقم قانون صحيح (1 - ${thisThread.listRule.length}).`, threadID, messageID);
                }
                const removed = thisThread.listRule.splice(index - 1, 1);
                api.sendMessage(`✅ تم حذف القانون رقم [${index}] بنجاح.`, threadID, messageID);
            }
            fs.writeFileSync(pathData, JSON.stringify(dataJson, null, 4), "utf-8");
            return;
        }

        case "قائمة":
        case "عرض":
        default: {
            if (thisThread.listRule.length == 0) {
                return api.sendMessage("◈ ──『 تـنـبـيـه 』── ◈\n\n◯ هذه المجموعة لم تضع قوانينها بعد.\n———————————————\n│←› بـأوامـر: الـتـوب أيـمـن 👑", threadID, messageID);
            }
            
            let msg = "◈ ──『 قـوانـيـن الـمـجـمـوعـة 📜 』── ◈\n\n";
            thisThread.listRule.forEach((rule, i) => {
                msg += `【 ${i + 1} 】${rule}\n`;
            });
            msg += `\n———————————————\n⚠️ مـخـالـفـة الـقـوانـيـن تـعـرضـك لـلـطـرد.\n│←› بـأوامـر: الـتـوب أيـمـن 👑`;
            
            return api.sendMessage(msg, threadID, messageID);
        }
    }
};
