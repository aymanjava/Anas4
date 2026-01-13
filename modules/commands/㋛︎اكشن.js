const axios = require("axios");
const fs = require("fs-extra");

module.exports.config = {
  name: "اكشن",
  version: "3.0.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "مقترح الأفلام الملكي (أفضل 100 فيلم مع الصور)",
  commandCategory: "العاب",
  usages: "",
  cooldowns: 5,
};

module.exports.run = async function({ api, event, Currencies }) {
  const { threadID, messageID, senderID } = event;
  const reward = 3; // منحة ترفيهية تقشفية

  // قائمة الـ 100 فيلم المختارين بعناية (عينة لأفضلهم والبحث يتم بالاسم)
  const movies = [
    "Inception", "The Dark Knight", "The Matrix", "John Wick", "Gladiator", 
    "Interstellar", "Pulp Fiction", "The Godfather", "The Revenant", "Dune 2021",
    "Mad Max: Fury Road", "Django Unchained", "The Prestige", "The Departed", "Se7en",
    "Fight Club", "Saving Private Ryan", "The Wolf of Wall Street", "Batman Begins", "Top Gun: Maverick",
    "The Northman", "Extraction", "Nobody", "Bullet Train", "The Batman",
    "Spider-Man: No Way Home", "Avenger: Endgame", "Joker", "Parasite", "The Platform",
    "Oldboy", "Train to Busan", "The Raid", "Logan", "Deadpool", 
    "Fury", "Hacksaw Ridge", "1917", "All Quiet on the Western Front", "The Irishman",
    "Heat", "Sicario", "No Country for Old Men", "The Gentlemen", "Snatch",
    "The Hateful Eight", "The Gray Man", "The Adam Project", "Moonfall", "Tenet",
    "Blade Runner 2049", "Arrival", "Edge of Tomorrow", "Looper", "Source Code",
    "Oblivion", "Upgrade", "Hardcore Henry", "Lucy", "Limitless",
    "The Bourne Identity", "Mission: Impossible - Fallout", "Skyfall", "Casino Royale", "Kingsman",
    "The Nice Guys", "Baby Driver", "The Transporter", "Taken", "Equalizer",
    "Man on Fire", "Law Abiding Citizen", "Primal Fear", "The Invisible Guest", "Shutter Island",
    "Gone Girl", "Knives Out", "Glass Onion", "The Menu", "Fresh",
    "The Terminal", "Cast Away", "The Pursuit of Happyness", "Green Book", "The Intouchables",
    "Whiplash", "A Star Is Born", "La La Land", "The Great Gatsby", "The Big Short",
    "Ford v Ferrari", "Rush", "The Social Network", "Zodiac", "Prisoners",
    "Nightcrawler", "Drive", "Taxi Driver", "Goodfellas", "Scarface"
  ];

  const randomMovie = movies[Math.floor(Math.random() * movies.length)];
  const path = __dirname + `/cache/movie_${senderID}.png`;

  api.sendMessage(`🎬 جاري البحث في الأرشيف السينمائي عن فيلم يليق بك سيدي..`, threadID, messageID);

  try {
    // جلب بيانات الفيلم وصورته عبر API (OMDb أو مصدر صور)
    const res = await axios.get(`https://www.omdbapi.com/?t=${encodeURIComponent(randomMovie)}&apikey=ecc05b99`);
    const data = res.data;

    if (!data.Poster || data.Poster === "N/A") throw new Error("No Poster");

    const image = (await axios.get(data.Poster, { responseType: "arraybuffer" })).data;
    fs.writeFileSync(path, Buffer.from(image, "utf-8"));

    await Currencies.increaseMoney(senderID, reward);

    let msg = `◈ ───『 الـسـينـمـا الـمـلـكـيـة 』─── ◈\n\n` +
              `🎞️ الـفيـلم الـمقـترح: ${data.Title}\n` +
              `📅 الـسـنة: ${data.Year}\n` +
              `⭐ الـتـقيـيـم: ${data.imdbRating}\n` +
              `🎭 الـتـصنـيـف: ${data.Genre}\n` +
              `📝 الـقـصة: ${data.Plot}\n\n` +
              `💰 مـنـحـة الـمـشاهدة: +${reward}$\n` +
              ` ———————————————\n` +
              `│←› الـقـيـصر: الـتـوب ايـمـن 👑\n` +
              `◈ ──────────────── ◈`;

    return api.sendMessage({ body: msg, attachment: fs.createReadStream(path) }, threadID, () => fs.unlinkSync(path), messageID);

  } catch (err) {
    // في حال فشل الـ API، نرسل الاسم فقط كخطة احتياطية
    return api.sendMessage(` [🥀] سيدي، لم أستطع جلب البوستر، ولكن أرشح لك فيلم:\n\n🎥 ${randomMovie}`, threadID, messageID);
  }
};
