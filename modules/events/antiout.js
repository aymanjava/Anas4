module.exports.config = {
    name: "antiout",
    eventType: ["log:unsubscribe"],
    version: "1.1.0",
    credits: "DungUwU",
    description: "نظام هبة لمنع الهروب من المجموعة"
};

module.exports.handleEvent = async ({ event, api, Threads, Users }) => {
    const { threadID, logMessageData, author } = event;
    
    // جلب البيانات - تأكد من تفعيل الأمر في المجموعة أولاً
    let data = (await Threads.getData(threadID)).data || {};
    if (data.antiout === undefined || data.antiout === false) return; 

    const idUser = logMessageData.leftParticipantFbId;
    if (idUser == api.getCurrentUserID()) return;

    try {
        const name = await Users.getNameUser(idUser);
        
        // إذا كان الشخص هو من خرج بنفسه
        if (author == idUser) {
            return api.addUserToGroup(idUser, threadID, (err) => {
                if (err) {
                    return api.sendMessage(`🎀 [ ${name} ]\nحاولت أرجعك لبيتك بس إعداداتك منعتني.. 🌸`, threadID);
                } else {
                    return api.sendMessage(`🎀 مـمنوع الهروب يـا [ ${name} ]\nرجعتك لمكانك، لا تعيدها مرة ثانية.. ✨`, threadID);
                }
            });
        } else {
            // إذا تم طرده
            return api.sendMessage(`🚪 وداعاً [ ${name} ]\nتم إخراجه بواسطة المسؤول.. ✨`, threadID);
        }
    } catch (e) {
        console.log("Antiout Error: " + e);
    }
};

// إضافة وظيفة run فارغة لكي لا يظهر خطأ في بعض أنظمة الفحص
module.exports.run = async ({ api, event, Threads }) => {
    const { threadID, messageID } = event;
    let data = (await Threads.getData(threadID)).data || {};
    
    if (typeof data.antiout == "undefined" || data.antiout == false) data.antiout = true;
    else data.antiout = false;
    
    await Threads.setData(threadID, { data });
    return api.sendMessage(`✨ نظام منع الخروج الآن: ${data.antiout ? "قيد التشغيل ✅" : "متوقف عن العمل ❌"}`, threadID, messageID);
};
