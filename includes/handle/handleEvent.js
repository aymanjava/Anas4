module.exports = function ({ api, models, Users, Threads, Currencies }) {
    const logger = require("../../utils/log.js");
    const moment = require("moment-timezone"); // تصحيح الاستدعاء

    return function ({ event }) {
        const timeStart = Date.now();
        const time = moment.tz("Asia/Baghdad").format("HH:mm:ss DD/MM/YYYY"); // ضبط الوقت للعراق
        const { userBanned, threadBanned } = global.data;
        const { events } = global.client;
        const { allowInbox, DeveloperMode } = global.config;
        
        var { senderID, threadID } = event;
        senderID = String(senderID);
        threadID = String(threadID);

        // التحقق من الحظر
        if (userBanned.has(senderID) || threadBanned.has(threadID)) return;
        if (allowInbox == false && senderID == threadID) return;

        for (const [key, value] of events.entries()) {
            // التحقق من نوع الحدث أو إذا كان الحدث يستمع لكل الرسائل (مثل الفراشة)
            if (value.config.eventType.indexOf(event.logMessageType) !== -1 || value.config.eventType.includes("message") || value.config.eventType.includes("message_reply")) {
                const eventRun = events.get(key);
                try {
                    const Obj = {
                        api,
                        event,
                        models,
                        Users,
                        Threads,
                        Currencies
                    };

                    // تشغيل الحدث سواء كان مسمى run أو handleEvent
                    if (typeof eventRun.run === "function") {
                        eventRun.run(Obj);
                    } else if (typeof eventRun.handleEvent === "function") {
                        eventRun.handleEvent(Obj);
                    }

                    if (DeveloperMode == true) {
                        logger(`Event: ${eventRun.config.name} | Thread: ${threadID} | Time: ${Date.now() - timeStart}ms`, '[ Event ]');
                    }
                } catch (error) {
                    console.error(error);
                }
            }
        }
        return;
    };
};
