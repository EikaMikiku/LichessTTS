document.addEventListener("DOMContentLoaded", (e) => {
	let volume = document.getElementById("volume");
	let volumeCurrent = document.getElementById("currentVolume");
	let rate = document.getElementById("rate");
	let rateCurrent = document.getElementById("currentRate");
	let pitch = document.getElementById("pitch");
	let pitchCurrent = document.getElementById("currentPitch");
	let voicesSelect = document.getElementById("voices");
	let save = document.getElementById("save");
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
	voicesSelect.addEventListener("change", (e) => {
		save.style.display = "block";
	});
	save.addEventListener("click", (e) => {
		save.style.display = "none";
		let settings = {
			"volume": volume.value,
			"pitch": pitch.value,
			"rate": rate.value,
			"voice": voicesSelect.value
		};
		//Save to sync
		chrome.storage.sync.set({"settings": settings});
	});

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
		});
	}
});