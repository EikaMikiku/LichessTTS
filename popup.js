document.addEventListener("DOMContentLoaded", (e) => {
	let save = document.getElementById("save");
	let voicesSelect = document.getElementById("voices");
	let volume = document.getElementById("volume");
	let volumeCurrent = document.getElementById("currentVolume");
	let rate = document.getElementById("rate");
	let rateCurrent = document.getElementById("currentRate");
	let pitch = document.getElementById("pitch");
	let pitchCurrent = document.getElementById("currentPitch");
	let tokenKnight = document.getElementById("tokenKnight");
	let tokenBishop = document.getElementById("tokenBishop");
	let tokenRook = document.getElementById("tokenRook");
	let tokenQueen = document.getElementById("tokenQueen");
	let tokenKing = document.getElementById("tokenKing");
	let tokenTakes = document.getElementById("tokenTakes");
	let tokenCheck = document.getElementById("tokenCheck");
	let tokenCheckmate = document.getElementById("tokenCheckmate");
	let tokenOO = document.getElementById("tokenOO");
	let tokenOOO = document.getElementById("tokenOOO");
	let tokenPromo = document.getElementById("tokenPromo");
	let tokenFiles = document.getElementById("tokenFiles");
	let tokenRanks = document.getElementById("tokenRanks");

	let s = window.speechSynthesis;
	s.getVoices();
	s.addEventListener("voiceschanged", (e) => {
		let voices = s.getVoices();
		for(let i = 0; i < voices.length; i++) {
			let v = voices[i];
			let option = document.createElement("option");
			option.value = v.voiceURI;
			option.text = v.name + " (" + v.lang + ")";
			voicesSelect.options.add(option);

			if(v.default) {
				option.selected = true;
			}
		}
		loadData();
	});
	save.addEventListener("click", (e) => {
		if(tokenFiles.value.split(",").length > 8) {
			alert("Too many files given, some will not be used.");
		} else if(tokenFiles.value.split(",").length < 8) {
			alert("Not all files in the token were set. Add some more");
			return false;
		}
		if(tokenRanks.value.split(",").length > 8) {
			alert("Too many ranks given, some will not be used.");
		} else if(tokenRanks.value.split(",").length < 8) {
			alert("Not all ranks in the token were set. Add some more");
			return false;
		}
		save.style.display = "none";
		let settings = {
			"volume": volume.value,
			"pitch": pitch.value,
			"rate": rate.value,
			"voice": voicesSelect.value,
			"tokens": {
				"knight": tokenKnight.value,
				"bishop": tokenBishop.value,
				"rook": tokenRook.value,
				"queen": tokenQueen.value,
				"king": tokenKing.value,
				"takes": tokenTakes.value,
				"check": tokenCheck.value,
				"checkmate": tokenCheckmate.value,
				"oo": tokenOO.value,
				"ooo": tokenOOO.value,
				"promo": tokenPromo.value,
				"files": tokenFiles.value,
				"ranks": tokenRanks.value
			}
		};
		//Save to sync
		chrome.storage.sync.set({"settings": settings});
	});
	voicesSelect.addEventListener("change", (e) => {
		save.style.display = "block";
	});
	volume.addEventListener("input", (e) => {
		volumeCurrent.textContent = volume.value + "%";
		save.style.display = "block";
	});
	rate.addEventListener("input", (e) => {
		rateCurrent.textContent = rate.value + "%";
		save.style.display = "block";
	});
	pitch.addEventListener("input", (e) => {
		pitchCurrent.textContent = pitch.value + "%";
		save.style.display = "block";
	});
	tokenKnight.addEventListener("keydown", (e) => save.style.display = "block");
	tokenBishop.addEventListener("keydown", (e) => save.style.display = "block");
	tokenRook.addEventListener("keydown", (e) => save.style.display = "block");
	tokenQueen.addEventListener("keydown", (e) => save.style.display = "block");
	tokenKing.addEventListener("keydown", (e) => save.style.display = "block");
	tokenTakes.addEventListener("keydown", (e) => save.style.display = "block");
	tokenCheck.addEventListener("keydown", (e) => save.style.display = "block");
	tokenCheckmate.addEventListener("keydown", (e) => save.style.display = "block");
	tokenOO.addEventListener("keydown", (e) => save.style.display = "block");
	tokenOOO.addEventListener("keydown", (e) => save.style.display = "block");
	tokenPromo.addEventListener("keydown", (e) => save.style.display = "block");
	tokenFiles.addEventListener("keydown", (e) => save.style.display = "block");
	tokenRanks.addEventListener("keydown", (e) => save.style.display = "block");

	function loadData() {
		chrome.storage.sync.get("settings", (data) => {
			let settings = data.settings || {};
			let v = settings.volume || 100;
			let p = settings.pitch || 100;
			let r = settings.rate || 100;
			let vo = settings.voice;
			if(vo) {
				voicesSelect.value = vo;
			}
			volume.value = v;
			pitch.value = p;
			rate.value = r;
			volumeCurrent.textContent = volume.value + "%";
			rateCurrent.textContent = rate.value + "%";
			pitchCurrent.textContent = pitch.value + "%";

			settings.tokens = settings.tokens || {};

			tokenKnight.value = settings.tokens.knight || "Knight";
			tokenBishop.value = settings.tokens.bishop || "Bishop";
			tokenRook.value = settings.tokens.rook || "Rook";
			tokenQueen.value = settings.tokens.queen || "Queen";
			tokenKing.value = settings.tokens.king || "King";
			tokenTakes.value = settings.tokens.takes || "Takes";
			tokenCheck.value = settings.tokens.check || "Check";
			tokenCheckmate.value = settings.tokens.checkmate || "Check mate";
			tokenOO.value = settings.tokens.oo || "Kingside castle";
			tokenOOO.value = settings.tokens.ooo || "Queenside castle";
			tokenPromo.value = settings.tokens.promo || "Promotion to";
			tokenFiles.value = settings.tokens.files || "A,B,C,D,E,F,G,H";
			tokenRanks.value = settings.tokens.ranks || "one,two,three,four,five,six,seven,eight";
		});
	}
});