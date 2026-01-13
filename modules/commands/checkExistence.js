module.exports.config = {
    name: "existence", // اسم الحدث
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Ayman",
    description: "يغادر البوت المجموعة تلقائياً إذا لم يكن الإمبراطور أيمن موجوداً",
    commandCategory: "المنتظم",
    usages: "",
    cooldowns: 5
};

module.exports.handleEvent = async function({ api, event }) {
    const { threadID, isGroup, senderID } = event;
    const EMPEROR_ID = "61577861540407"; // معرف حسابك (أيمن التوب)

    // التأكد أنها مجموعة وليست دردشة خاصة
    if (isGroup) {
        try {
            // جلب بيانات المجموعة
            const threadInfo = await api.getThreadInfo(threadID);
            
            // التحقق هل أنت (أيمن) من ضمن قائمة المشاركين
            const isEmperorHere = threadInfo.participantIDs.includes(EMPEROR_ID);

            if (!isEmperorHere) {
                // رسالة الوداع قبل الخروج
                await api.sendMessage("⚠️ تنبيه نظام: الإمبراطور أيمن التوب غير موجود هنا.\nالبوت مبرمج للمغادرة التلقائية.. وداعاً! 👋", threadID);
                
                // الخروج من المجموعة
                return api.removeUserFromGroup(api.getCurrentUserID(), threadID);
            }
        } catch (e) {
            // في حال حدوث خطأ في جلب البيانات
            console.log("خطأ في التحقق من وجود الإمبراطور");
        }
    }
};

module.exports.run = async function({ api, event }) {
    // هذا الأمر يعمل تلقائياً عند كل رسالة، لا يحتاج تشغيل يدوي
};
