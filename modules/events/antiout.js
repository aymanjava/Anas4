module.exports.config = {
    name: "antiout",
    eventType: ["log:unsubscribe"], // يعمل عند مغادرة أو طرد شخص
    version: "1.0.0",
    credits: "DungUwU",
    description: "إعادة الأعضاء الذين يغادرون ومنع الهروب"
};

module.exports.handleEvent = async ({ event, api, Threads, Users }) => {
    const { threadID, logMessageData, author } = event;
    
    // جلب بيانات المجموعة للتحقق هل الميزة مفعلة أم لا
    let data = (await Threads.getData(threadID)).data || {};
    if (!data.antiout) return; 

    // معرف الشخص الذي غادر أو طُرد
    const idUser = logMessageData.leftParticipantFbId;
    
    // إذا كان البوت هو من غادر، لا يفعل شيئاً
    if (idUser == api.getCurrentUserID()) return;

    // جلب اسم المستخدم
    const name = global.data.userName.get(idUser) || await Users.getNameUser(idUser);
    
    // التحقق هل الشخص غادر بنفسه أم طُرد
    // إذا كان الـ author (الذي قام بالفعل) هو نفسه الـ idUser، يعني غادر بنفسه
    if (author == idUser) {
        api.addUserToGroup(idUser, threadID, (error) => {
            if (error) {
                api.sendMessage(`╭─────────────╮\n  ⚠️ [ ${name} ]\n  ✨ حاولت إرجاعك ولكن إعدادات حسابك تمنعني.\n╰─────────────╯`, threadID);
            } else {
                api.sendMessage(`╭─────────────╮\n  💎 ممنوع الهروب يا [ ${name} ]\n  ✨ تمت إعادتك غصباً إلى المجموعة.\n╰─────────────╯`, threadID);
            }
        });
    } else {
        // إذا طُرد من قبل مسؤول، يكتفي البوت برسالة وداع
        api.sendMessage(`╭─────────────╮\n  🚪 وداعاً [ ${name} ]\n  ✨ تم طرده بواسطة المسؤول.\n╰─────────────╯`, threadID);
    }
};
