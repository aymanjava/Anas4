module.exports.config = {
    name: "antiout",
    eventType: ["log:unsubscribe"],
    version: "0.0.1",
    credits: "DungUwU",
    description: "إعادة الأعضاء الذين يغادرون ومنع الهروب"
};

module.exports.run = async({ event, api, Threads, Users }) => {
    let data = (await Threads.getData(event.threadID)).data || {};
    
    // التحقق من تفعيل الميزة
    if (!data.antiout) return;
    
    // إذا كان البوت هو المغادر لا يفعل شيء
    if (event.logMessageData.leftParticipantFbId == api.getCurrentUserID()) return;

    const idUser = event.logMessageData.leftParticipantFbId;
    const name = global.data.userName.get(idUser) || await Users.getNameUser(idUser);
    
    // التحقق من طريقة الخروج
    const isSelfOut = (event.author == idUser);

    if (isSelfOut) {
        // حالة المغادرة بنفسه - يحاول البوت إعادته
        api.addUserToGroup(idUser, event.threadID, (error, info) => {
            if (error) {
                api.sendMessage(`╭─────────────╮\n  ⚠️ [ ${name} ]\n  ✨ حـاولـت ارجـاعـك ولـكن لـم أسـتـطـع\n╰─────────────╯`, event.threadID);
            } else {
                api.sendMessage(`╭─────────────╮\n  💎 مـمـنـوع الـهـروب يـا [ ${name} ]\n  ✨ تـمـت إعـادتـك غـصـبـاً إلـى الـمـجـمـوعة\n╰─────────────╯`, event.threadID);
            }
        });
    } else {
        // حالة الطرد بواسطة أدمن - البوت يرسل رسالة وداع بسيطة ولا يعيده
        api.sendMessage(`╭─────────────╮\n  🚪 وداعـاً [ ${name} ]\n  ✨ تـم طـرده بـواسـطـة الأدمن\n╰─────────────╯`, event.threadID);
    }
}
