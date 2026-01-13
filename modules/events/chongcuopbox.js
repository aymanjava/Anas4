module.exports.config = {
    name: "guard",
    eventType: ["log:thread-admins"],
    version: "2.0.0",
    credits: "Ayman",
    description: "نظام الحماية الملكي - منع تغيير المسؤولين والحفاظ على السلطة",
};

module.exports.run = async function ({ event, api, Threads, Users }) {
    const { logMessageType, logMessageData, author, threadID, messageID } = event;
    const botID = api.getCurrentUserID();
    
    // جلب بيانات المجموعة والتحقق من تفعيل وضع الحماية
    let threadData = (await Threads.getData(threadID)).data || {};
    if (threadData.guard !== true) return;

    // الحصانة الملكية: إذا كان الفاعل هو "التوب أيمن" أو "البوت نفسه" يتم تجاهل الحماية
    const isTopAdmin = global.config.ADMINBOT.includes(author);
    if (isTopAdmin || author == botID) return;

    switch (logMessageType) {
        case "log:thread-admins": {
            // الحالة الأولى: محاولة إضافة مسؤول جديد (بدون إذن التوب)
            if (logMessageData.ADMIN_EVENT == "add_admin") {
                const targetID = logMessageData.TARGET_ID;
                
                // سحب الرتبة من الفاعل ومن الشخص المضاف فوراً
                api.changeAdminStatus(threadID, author, false);
                api.changeAdminStatus(threadID, targetID, false);
                
                let msg = `◈ ───『 تـدخل الـحارس الـمـلكي 』─── ◈\n\n` +
                          `⚠️ كـشف مـحاولة تـعيـين مـسؤول جـديد!\n` +
                          `🚫 تـم عـزل الـفـاعـل وسـحب الـرتبة مـن الـطرفـين.\n` +
                          `🛡️ الـحـالـة: تـم إحـبـاط الـإنـقـلاب بـنـجـاح.\n\n` +
                          `│←› بـأوامـر مـن: الـتـوب ايـمـن 👑\n` +
                          `◈ ──────────────── ◈`;
                return api.sendMessage(msg, threadID);
            }

            // الحالة الثانية: محاولة إزالة مسؤول (خيانة أو تمرد)
            else if (logMessageData.ADMIN_EVENT == "remove_admin") {
                const targetID = logMessageData.TARGET_ID;

                // إذا حاول شخص إزالة البوت أو إزالة مسؤول آخر
                api.changeAdminStatus(threadID, author, false); // سحب رتبة الخائن
                api.changeAdminStatus(threadID, targetID, true); // إعادة الرتبة للمسؤول المعزول

                let msg = `◈ ───『 تـدخل الـحارس الـمـلكي 』─── ◈\n\n` +
                          `🚨 تـنـبيـه: مـحـاولة عـزل مـسؤول بـدون تـفـويـض!\n` +
                          `⚔️ تـم طـرد الـخـائـن مـن الـإدارة وإعـادة الـحق لـأصـحابه.\n\n` +
                          `│←› الـقـرار لـلإمـبـراطـور: الـتـوب ايـمـن 👑\n` +
                          `◈ ──────────────── ◈`;
                return api.sendMessage(msg, threadID);
            }
            break;
        }
    }
};
