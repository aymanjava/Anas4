module.exports = function ({ api, models, Users, Threads, Currencies }) {
    const logger = require("../../utils/log.js");
    const moment = require("moment-timezone");

    return function ({ event }) {
        const timeStart = Date.now();
        const time = moment.tz("Asia/Baghdad").format("HH:mm:ss DD/MM/YYYY");
        const { userBanned, threadBanned } = global.data;
        const { events } = global.client;
        const { allowInbox, DeveloperMode } = global.config;

        let { senderID, threadID, type } = event;
        senderID = String(senderID);
        threadID = String(threadID);

        // منع الحظر
        if (userBanned.has(senderID) || threadBanned.has(threadID)) return;
        if (allowInbox === false && senderID === threadID) return;

        // تكرار جميع الأحداث المسجلة
        for (const [key, eventObj] of events.entries()) {
            // دعم جميع الرسائل بما فيها الردود والمنشن
            if (
                eventObj.config.eventType.includes(type) ||
                eventObj.config.eventType.includes("message") ||
                eventObj.config.eventType.includes("message_reply")
            ) {
                try {
                    const Obj = { api, event, models, Users, Threads, Currencies };

                    if (typeof eventObj.run === "function") {
                        eventObj.run(Obj);
                    } else if (typeof eventObj.handleEvent === "function") {
                        eventObj.handleEvent(Obj);
                    }

                    if (DeveloperMode) {
                        logger(`Event: ${eventObj.config.name} | Thread: ${threadID} | Time: ${Date.now() - timeStart}ms`, '[ EVENT ]');
                    }
                } catch (error) {
                    console.error(`Error in event ${eventObj.config.name}:`, error);
                }
            }
        }
    };
};
