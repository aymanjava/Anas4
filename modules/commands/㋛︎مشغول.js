const fs = require('fs');
const busyPath = __dirname + '/cache/busy.json';

module.exports.config = {
  name: "مشغول",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "تشغيل وضع الاعتكاف الملكي (AFK) وحفظ التاغات",
  commandCategory: "خدمات",
  usages: "[السبب]",
  cooldowns: 5
};

module.exports.onLoad = () => {
  if (!fs.existsSync(busyPath)) fs.writeFileSync(busyPath, JSON.stringify({}));
}

module.exports.handleEvent = async function({ api, event, Users }) {
    if (!fs.existsSync(busyPath)) return;
    let busyData = JSON.parse(fs.readFileSync(busyPath));
    var { senderID, threadID, messageID, mentions } = event;

    // --- مرحلة العودة من الاعتكاف ---
    if (senderID in busyData) {
        var info = busyData[senderID];
        delete busyData[senderID];
        fs.writeFileSync(busyPath, JSON.stringify(busyData, null, 4));
        
        let returnMsg = `◈ ───『 عـودة الـمـعـتـكـف 』─── ◈\n\n✨ مـرحـباً بـعودتـك سـيدي الـمنصور.\n`;
        
        return api.sendMessage(returnMsg, threadID, () => {
            if (info.tag.length == 0) {
                api.sendMessage("🛡️ نـحيطـكم عـلماً أنـه لم يـتجرأ أحـد عـلى إزعـاجـكم بالـتاغ أثـناء غـيابـكم.", threadID);
            } else {
                var report = "📝 إليـك تـقريـر الاسـتخـبارات لـمـن ذكـرك أثـناء اعـتكـافـك:\n\n";
                for (var i of info.tag) {
                    report += `👤 ${i}\n`;
                }
                api.sendMessage(report + "\n◈ ──────────────── ◈", threadID);
            }
        }, messageID);
    }

    // --- مرحلة الرد على من يذكر المشغول ---
    if (!mentions || Object.keys(mentions).length == 0) return;

    for (const [ID, name] of Object.entries(mentions)) {
        if (ID in busyData) {
            var infoBusy = busyData[ID];
            var mentioner = await Users.getNameUser(senderID);
            var replaceName = event.body.replace(`${name}`, "").trim();
            
            // تسجيل التاغ في التقرير
            infoBusy.tag.push(`${mentioner}: ${replaceName == "" ? "أرسل منشـناً صامتاً" : replaceName}`);
            busyData[ID] = infoBusy;
            fs.writeFileSync(busyPath, JSON.stringify(busyData, null, 4));
            
            let busyNotice = `⚠️ تـنـبـيـه إمـبـراطـوري\n\n👤 الـمـطلـوب: ${name.replace("@", "")}\n🏛️ الـحـالـة: في وضـع الاعـتـكـاف\n📝 الـسـبـب: ${infoBusy.lido ? infoBusy.lido : "غـيـر مـعـلـن"}\n\n📢 سيـصلـه خـبـر ذكـرك لـه عـند عـودتـه.`;
            return api.sendMessage(busyNotice, threadID, messageID);
        }
    }
}

module.exports.run = async function({ api, event, args }) {
    let busyData = JSON.parse(fs.readFileSync(busyPath));
    const { threadID, senderID, messageID } = event;
    var content = args.join(" ") || "";

    if (!(senderID in busyData)) {
        busyData[senderID] = {
            lido: content,
            tag: []
        }
        fs.writeFileSync(busyPath, JSON.stringify(busyData, null, 4));
        
        let startBusy = `┏━━━━━━ 💤 ━━━━━━┓\n   وضـع الاعـتـكـاف الـمـلـكـي\n┗━━━━━━ 💤 ━━━━━━┛\n\n` +
                        `✅ تـم تـفعيـل الـوضـع بـنـجـاح.\n` +
                        `📝 الـسـبـب: ${content.length == 0 ? "لا يـوجـد سـبب مـذكور" : content}\n\n` +
                        `🛡️ سأقوم بـحفـظ جـميـع الإشارات الـتي تـصلك.\n` +
                        `👑 بـأمـر: الـتـوب ايـمـن\n` +
                        `◈ ──────────────── ◈`;
        return api.sendMessage(startBusy, threadID, messageID);
    }
}
