(() => {
	let regexp = /((([NBRQK][a-h]?[0-9]?)[\u0445x]([a-h][0-9]))|(([NBRQK]?[a-h]?[0-9]?)([a-h][0-9]))|([a-h])[\u0445x]([a-h][0-9])|(O-O-O)|(O-O))(=[NBRQ])?([+#])?/;
	let numbers = ["zero","one","two","three","four","five","six","seven","eight","nine","ten"];
	let old = null;
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
				settings = data.settings || {};
				resolve();
			}).catch(reject);
		});
	}

	function start() {
		setInterval(getSettings, 100);
		setInterval(checkNewMove, 20);
	}

	function checkNewMove() {
		let curr = document.querySelector("move.active");
		if(!curr) return;
		let parent = curr.parentNode;
		let text = null;
		if(parent.classList.contains("moves")) {
			text = curr.textContent;
		} else if(parent.classList.contains("inline") || parent.tagName === "LINE" || parent.tagName === "INLINE") {
			text = curr.textContent.replace(/^.*\./g, "");
		} else {
			let san = curr.getElementsByTagName("san")[0];
			if(san) {
				text = san.textContent;
			} else {
				text = curr.textContent;
			}
		}
		if(!text) {
			return "Move history is invalid";
		}

		if(old !== curr) {
			old = curr;
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
		utter.rate = settings.rate ? settings.rate / 100 : 1;
		utter.pitch = settings.pitch ? settings.pitch / 100 : 1;
		utter.volume = settings.volume ? settings.volume / 100 : 1;
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
				text += "on " + replaceNumbers(nonTakePiece.slice(1).toUpperCase()) + " to ";
			}
		}
		if(nonTakeSquare && nonTakeSquare.length > 0) {
			text += replaceNumbers(nonTakeSquare.toUpperCase());
		}
		if(pawnTakes && pawnTakes.length > 0) {
			text += pawnTakes.toUpperCase() + " takes ";
		}
		if(pawnTakesSquare && pawnTakesSquare.length > 0) {
			text += replaceNumbers(pawnTakesSquare.toUpperCase());
		}
		if(pieceTakes && pieceTakes.length > 0) {
			text += getPieceText(pieceTakes[0]);
			if(pieceTakes.length > 1) {
				text += " on " + replaceNumbers(pieceTakes.slice(1).toUpperCase()) + " to ";
			}
		}
		if(pieceTakesSquare && pieceTakesSquare.length > 0) {
			text += " takes " + replaceNumbers(pieceTakesSquare.toUpperCase());
		}
		if(queenCastles && queenCastles.length > 0) {
			text += "Queenside castle";
		}
		if(kingCastles && kingCastles.length > 0) {
			text += "Kingside castle";
		}
		if(promotion && promotion.length > 0) {
			text += " promotion to " + getPieceText(promotion[1]);
		}
		if(checkOrMate && checkOrMate.length > 0) {
			if(checkOrMate[0] === "#") {
				text += " check mate";
			} else if(checkOrMate[0] === "+") {
				text += " check";
			}
		}

		read(text);
	}

	function replaceNumbers(text) {
		return text.replace(/([\d])/g, (a, b) => {
			return " " + numbers[parseInt(b)];
		});
	}

	function getPieceText(code) {
		if(code === "N") {
			return "Knight";
		} else if(code === "B") {
			return "Bishop";
		} else if(code === "R") {
			return "Rook";
		} else if(code === "Q") {
			return "Queen";
		} else if(code === "K") {
			return "King";
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

	function setToStorage(obj, local) {
		return new Promise((resolve, reject) => {
			try {
				if(local) {
					chrome.storage.local.set(obj, resolve);
				} else {
					chrome.storage.sync.set(obj, resolve);
				}
			} catch(e) {
				reject(e);
			}
		});
	}
})();