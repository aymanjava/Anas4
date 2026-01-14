module.exports.config = {
	name: "رؤية",
	version: "1.0.0",
	hasPermssion: 2,
	credits: "S H A D O W",
	description: "",
	prefix: false,
		category: "الـــمــطـــور",
  usages: "",
	cooldowns: 0
};

module.exports.handleEvent = async ({ api, event, args }) => {
    api.markAsReadAll(() => {});
};

module.exports.run = async function({}) {}