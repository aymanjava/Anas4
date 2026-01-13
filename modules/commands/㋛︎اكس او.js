const fs = require("fs");
const { loadImage, createCanvas } = require("canvas");

module.exports.config = {
  name: "اكس او",
  version: "2.5.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "تحدى الذكاء الاصطناعي في لعبة إكس أو الملكية",
  commandCategory: "العاب",
  cooldowns: 5,
  usages: "[x / o / مسح / كمل]"
};

// --- دالة رسم لوحة اللعب الضخمة ---
async function displayBoard(data) {
  const path = __dirname + "/cache/xo_board.png";
  let canvas = createCanvas(1200, 1200);
  let cc = canvas.getContext("2d");
  
  // خلفية اللوحة (شبكة اللعب)
  let background = await loadImage("https://i.postimg.cc/nhDWmj1h/background.png");
  cc.drawImage(background, 0, 0, 1200, 1200);
  
  var quanO = await loadImage("https://i.postimg.cc/rFP6xLXQ/O.png");
  var quanX = await loadImage("https://i.postimg.cc/HLbFqcJh/X.png");

  for (var i = 0; i < 3; i++) {
    for (var j = 0; j < 3; j++) {
      var temp = data.board[i][j].toString();
      var x = 54 + 366 * j;
      var y = 54 + 366 * i;
      if (temp == "1") data.isX ? cc.drawImage(quanO, x, y, 360, 360) : cc.drawImage(quanX, x, y, 360, 360);
      if (temp == "2") data.isX ? cc.drawImage(quanX, x, y, 360, 360) : cc.drawImage(quanO, x, y, 360, 360);
    }
  }
  fs.writeFileSync(path, canvas.toBuffer("image/png"));
  return fs.createReadStream(path);
}

// --- وظائف منطق اللعبة والذكاء الاصطناعي ---
function startBoard({isX, data}) {
  data.board = Array.from({ length: 3 }, () => Array(3).fill(0));
  data.isX = isX;
  data.gameOn = true;
  return data;
}

function checkWinner(board, player) {
  const s = player;
  if ((board[0][0]==s && board[1][1]==s && board[2][2]==s) || (board[0][2]==s && board[1][1]==s && board[2][0]==s)) return true;
  for (let i = 0; i < 3; i++) {
    if (board[i][0]==s && board[i][1]==s && board[i][2]==s) return true;
    if (board[0][i]==s && board[1][i]==s && board[2][i]==s) return true;
  }
  return false;
}

var AIMove;
function solveMinimax(board, depth, isMaximizing) {
  if (checkWinner(board, 1)) return 10 - depth;
  if (checkWinner(board, 2)) return depth - 10;
  let available = [];
  for(let r=0; r<3; r++) for(let c=0; c<3; c++) if(board[r][c] == 0) available.push([r,c]);
  if (available.length == 0) return 0;

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let [r, c] of available) {
      board[r][c] = 1;
      let score = solveMinimax(board, depth + 1, false);
      board[r][c] = 0;
      if (score > bestScore) {
        bestScore = score;
        if (depth === 0) AIMove = [r, c];
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let [r, c] of available) {
      board[r][c] = 2;
      let score = solveMinimax(board, depth + 1, true);
      board[r][c] = 0;
      bestScore = Math.min(score, bestScore);
    }
    return bestScore;
  }
}

module.exports.handleReply = async function({ event, api, handleReply }) {
  let { body, threadID, messageID, senderID } = event;
  if (!global.moduleData.xo) return;
  let data = global.moduleData.xo.get(threadID);
  if (!data || senderID !== handleReply.author) return;

  let num = parseInt(body);
  if (isNaN(num) || num < 1 || num > 9) return api.sendMessage("❌ اختر رقماً من 1 إلى 9 سيدي!", threadID, messageID);

  let row = Math.floor((num - 1) / 3);
  let col = (num - 1) % 3;

  if (data.board[row][col] !== 0) return api.sendMessage("⚠️ هذا المربع مشغول، اختر غيره!", threadID, messageID);

  data.board[row][col] = 2; // حركة اللاعب
  
  if (!checkWinner(data.board, 2) && data.board.flat().includes(0)) {
    solveMinimax(data.board, 0, true);
    data.board[AIMove[0]][AIMove[1]] = 1; // حركة البوت
  }

  let resultMsg = "";
  if (checkWinner(data.board, 1)) resultMsg = "💀 خـسـرت! هـاردلك، الـبوت بـرعـاية الـتوب ايـمن لا يـرحـم. 😎";
  else if (checkWinner(data.board, 2)) resultMsg = "🏆 مـعـجزة! لـقد هـزمـت الـذكاء الاصـطـناعـي!";
  else if (!data.board.flat().includes(0)) resultMsg = "🤝 تـعادل! مـباراة جـيـدة.";

  let attachment = await displayBoard(data);
  let msg = resultMsg || "🎮 دورك الـتـالـي (رد بـرقم الـمربـع):";

  if (resultMsg) global.moduleData.xo.delete(threadID);

  api.sendMessage({ body: msg, attachment }, threadID, (err, info) => {
    if (!resultMsg) global.client.handleReply.push({ name: this.config.name, author: senderID, messageID: info.messageID });
  }, messageID);
};

module.exports.run = async function ({ event, api, args }) {
  if (!global.moduleData.xo) global.moduleData.xo = new Map();
  let { threadID, messageID, senderID } = event;
  let data = global.moduleData.xo.get(threadID) || { gameOn: false };

  if (args[0] == "مسح") {
    global.moduleData.xo.delete(threadID);
    return api.sendMessage("🧹 تـم تـطهـير الـطاولـة وإنـهاء اللـعبـة.", threadID, messageID);
  }

  if (data.gameOn) return api.sendMessage("⚠️ هـناك مـبـاراة جـاريـة بالفعل! اسـتخدم 'كمل' أو 'مسح'.", threadID, messageID);

  let choice = args[0]?.toLowerCase();
  if (choice !== "x" && choice !== "o") return api.sendMessage("🕹️ ابـدأ اللـعـبة بـاختـيار: اكس او x أو اكس او o", threadID, messageID);

  let newData = startBoard({ isX: (choice === "x"), data: { board: [] } });
  if (choice === "x") solveMinimax(newData.board, 0, true), newData.board[AIMove[0]][AIMove[1]] = 1;

  let attachment = await displayBoard(newData);
  global.moduleData.xo.set(threadID, { ...newData, author: senderID });

  return api.sendMessage({ body: "✨ بـدأت الـمـباراة الـمـلكيـة!\nرد بـرقم الـمربـع (1-9) لـتـلعب.", attachment }, threadID, (err, info) => {
    global.client.handleReply.push({ name: this.config.name, author: senderID, messageID: info.messageID });
  }, messageID);
};
