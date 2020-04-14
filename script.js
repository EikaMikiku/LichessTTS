(() => {
	let regexp = /((([NBRQK][a-h]?[0-9]?)[\u0445x]([a-h][0-9]))|(([NBRQK]?[a-h]?[0-9]?)([a-h][0-9]))|([a-h])[\u0445x]([a-h][0-9])|(O-O-O)|(O-O))(=[NBRQ])?([+#])?/;
	let oldMoveActive = null;
	let synth = window.speechSynthesis;
	let settings = {};
	synth.getVoices(); //Init voices
	synth.onvoiceschanged = function() {
		getSettings().then(start);
	};

	function getSettings() {
		return new Promise((resolve, reject) => {
			getFromStorage("settings")
			.then((data) => {
				settings = data.settings || {
					"volume": 100,
					"rate": 100,
					"pitch": 100,
					"tokens":{
						"knight": "Knight",
						"bishop": "Bishop",
						"rook": "Rook",
						"queen": "Queen",
						"king": "King",
						"takes": "Takes",
						"check": "Check",
						"checkmate": "Check mate",
						"oo": "Kingside castle",
						"ooo": "Queenside castle",
						"promo": "Promotion to",
						"files": "A,B,C,D,E,F,G,H",
						"ranks": "one,two,three,four,five,six,seven,eight"
					}
				};
				resolve();
			}).catch(reject);
		});
	}

	function start() {
		setInterval(getSettings, 1000);
		setInterval(checkNewMove);
	}

	function checkNewMove() {
		let currentMoveActiveAnalysis = document.querySelector("move.active");
		let currentMoveActiveGame = document.querySelector(".moves .active");

		if(!currentMoveActiveAnalysis && !currentMoveActiveGame) return;

		let text = null;

		if(currentMoveActiveGame) {
			text = currentMoveActiveGame.innerText.trim();
		} else if(currentMoveActiveAnalysis) {
			// Can be inline, which can add move index to inner text, which we need to remove
			let san = currentMoveActiveAnalysis.getElementsByTagName("san")[0];
			if(san) {
				text = san.innerText.trim();
			} else {
				//Inline view, or sub-line
				text = currentMoveActiveAnalysis.innerText.replace(/^.*\./g, "");
			}
		}

		let currentMoveActive = currentMoveActiveGame || currentMoveActiveAnalysis;
		if(oldMoveActive !== currentMoveActive) {
			oldMoveActive = currentMoveActive;
			parseMove(regexp.exec(text))
		}
	}

	function read(text) {
		if(synth.speaking) {
			synth.cancel();
		}
		let utter = new SpeechSynthesisUtterance(text);
		if(settings.voice) {
			utter.voice = synth.getVoices().find((e) => e.voiceURI === settings.voice);
		}
		utter.rate = settings.rate / 100;
		utter.pitch = settings.pitch / 100;
		utter.volume = settings.volume / 100;
		synth.speak(utter);
	}

	function parseMove(results) {
		let nonTakePiece = results[6];
		let nonTakeSquare = results[7];
		let pawnTakes = results[8];
		let pawnTakesSquare = results[9];
		let pieceTakes = results[3];
		let pieceTakesSquare = results[4];
		let queenCastles = results[10];
		let kingCastles = results[11];
		let promotion = results[12];
		let checkOrMate = results[13];
		let text = "";
		if(nonTakePiece && nonTakePiece.length > 0) {
			text += getPieceText(nonTakePiece[0]) + " ";
			if(nonTakePiece.length > 1) {
				text += tokeniseSquare(nonTakePiece.slice(1).toUpperCase()) + " ";
			}
		}
		if(nonTakeSquare && nonTakeSquare.length > 0) {
			text += tokeniseSquare(nonTakeSquare.toUpperCase());
		}
		if(pawnTakes && pawnTakes.length > 0) {
			text += pawnTakes.toUpperCase() + " " + settings.tokens.takes + " ";
		}
		if(pawnTakesSquare && pawnTakesSquare.length > 0) {
			text += tokeniseSquare(pawnTakesSquare.toUpperCase());
		}
		if(pieceTakes && pieceTakes.length > 0) {
			text += getPieceText(pieceTakes[0]);
			if(pieceTakes.length > 1) {
				text += tokeniseSquare(pieceTakes.slice(1).toUpperCase()) + " ";
			}
		}
		if(pieceTakesSquare && pieceTakesSquare.length > 0) {
			text += " " + settings.tokens.takes + " " + tokeniseSquare(pieceTakesSquare.toUpperCase());
		}
		if(queenCastles && queenCastles.length > 0) {
			text += settings.tokens.ooo;
		}
		if(kingCastles && kingCastles.length > 0) {
			text += settings.tokens.oo;
		}
		if(promotion && promotion.length > 0) {
			text += " " + settings.tokens.promo + " " + getPieceText(promotion[1]);
		}
		if(checkOrMate && checkOrMate.length > 0) {
			if(checkOrMate[0] === "#") {
				text += " " + settings.tokens.checkmate;
			} else if(checkOrMate[0] === "+") {
				text += " " + settings.tokens.check;
			}
		}

		read(text);
		console.log(text);
	}

	function tokeniseSquare(text) {
		let file = null;
		let rank = null;
		let output = "";
		if(text.length === 2) {
			file = text[0];
			rank = text[1];
		} else if(text.length === 1) {
			if(isNaN(parseInt(text))) {
				file = text;
			} else {
				rank = text;
			}
		}
		if(file) {
			output += file.replace(/([\w])/g, (a, b) => {
				let idx = b.toLowerCase().charCodeAt(0) - 97; //97 = a
				return settings.tokens.files.split(",")[idx];
			});
		}
		if(output.length > 0) {
			output += " ";
		}
		if(rank) {
			output += rank.replace(/([\d])/g, (a, b) => {
				return settings.tokens.ranks.split(",")[parseInt(b) - 1];
			});
		}

		return output.trim();
	}

	function getPieceText(code) {
		if(code === "N") {
			return settings.tokens.knight;
		} else if(code === "B") {
			return settings.tokens.bishop;
		} else if(code === "R") {
			return settings.tokens.rook;
		} else if(code === "Q") {
			return settings.tokens.queen;
		} else if(code === "K") {
			return settings.tokens.king;
		}
	}

	function getFromStorage(keys, local) {
		return new Promise((resolve, reject) => {
			try {
				if(local) {
					chrome.storage.local.get(keys, resolve);
				} else {
					chrome.storage.sync.get(keys, resolve);
				}
			} catch(e) {
				reject(e);
			}
		});
	}
})();