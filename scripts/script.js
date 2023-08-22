let schepenData = [
    {naam: "vliegdekschip", lengte: 5, kleur: "groen", afbeelding: "boot_groen.png", actief: true},
    {naam: "slagschip", lengte: 4, kleur: "rood", afbeelding: "boot_rood.png", actief: true},
    {naam: "onderzeeer", lengte: 3, kleur: "geel", afbeelding: "boot_geel.png", actief: true},
    {naam: "torpedo", lengte: 3, kleur: "oranje", afbeelding: "boot_oranje.png", actief: true},
    {naam: "patrouille", lengte: 2, kleur: "blauw", afbeelding: "boot_blauw.png", actief: true}
    ];

let speelbord = Array(10)
	.fill(null)
	.map(() => Array(10).fill(null)); //array om geplaatste schepen op te slaan

function vulDropdown(elementId, waarden) {
	const dropdown = document.getElementById(elementId);
	waarden.forEach((waarde) => {
		dropdown.appendChild(
			Object.assign(document.createElement("option"), waarde)
		);
	});
}

function maakSchipOpties() {
	return [{ value: "", label: "--Kies een schip--" }].concat(
		schepenData
			.filter((schip) => schip.actief)
			.map((schip) => ({
				value: schip.naam,
				label: `${schip.lengte}* ${schip.naam}`,
			}))
	);
}

function maakRijOpties() {
	return Array.from({ length: 10 }, (_, index) => ({
		value: index + 1,
		textContent: (index + 1).toString(),
	}));
}

function maakKolomOpties() {
	const kolommen = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
	return kolommen.map((kolom) => ({ value: kolom, textContent: kolom }));
}

function isSchipGeselecteerd() {
	return document.getElementById("schepen").value !== "";
}

function haalGeselecteerdeWaarden() {
	return {
		schip: document.getElementById("schepen").value,
		rij: parseInt(document.getElementById("rij").value, 10) - 1,
		kolom: document.getElementById("kolom").value.charCodeAt(0) - 65,
		richting: document.querySelector("input[name=richting]:checked").value,
	};
}

function kanSchipPlaatsen(schipNaam, rij, kolom, richting) {
	const schip = schepenData.find((s) => s.naam === schipNaam);
	for (let i = 0; i < schip.lengte; i++) {
		if (richting === "horizontaal") {
			if (kolom + i > 9 || speelbord[rij][kolom + i] !== null) {
				return false;
			}
		} else {
			if (rij + i > 9 || speelbord[rij + i][kolom] !== null) {
				return false;
			}
		}
	}
	return true;
}

function plaatsSchip(schipNaam, rij, kolom, richting) {
	const schip = schepenData.find((s) => s.naam === schipNaam);
	for (let i = 0; i < schip.lengte; i++) {
		let cel;
		if (richting === "horizontaal") {
			speelbord[rij][kolom + i] = schipNaam;
			cel = document.getElementById(`${rij}${kolom + i}`);
		} else {
			speelbord[rij + i][kolom] = schipNaam;
			cel = document.getElementById(`${rij + i}${kolom}`);
		}
		const img = document.createElement("img");
		img.src = `img/${schip.afbeelding}`;
		img.alt = schipNaam;
		cel.appendChild(img);
	}

	markeerSchipAlsGeplaatst(schipNaam);
	refreshSchepenDropdown();
	slaGamestateOp();
}

function markeerSchipAlsGeplaatst(schipNaam) {
	const schip = schepenData.find((s) => s.naam === schipNaam);
	if (schip) {
		schip.actief = false;
	}
}

function refreshSchepenDropdown() {
	const dropdown = document.getElementById("schepen");
	while (dropdown.options.length > 1) {
		dropdown.remove(1);
	}
	vulDropdown("schepen", maakSchipOpties());
}

function toonFoutbericht(bericht) {
	const foutDiv = document.getElementById("msg");
	foutDiv.textContent = bericht;
	setTimeout(() => (foutDiv.textContent = ""), 3000);
}

function herstelGamestate() {
	const opgeslagenGamestate = JSON.parse(
		localStorage.getItem("zeeslagGamestate")
	);
	vulDropdown("rij", maakRijOpties());
	vulDropdown("kolom", maakKolomOpties());
	if (opgeslagenGamestate) {
		speelbord = opgeslagenGamestate.speelbord;
		schepenData = opgeslagenGamestate.schepenData;

		// Schepen op het bord herstellen
		for (let rij = 0; rij < 10; rij++) {
			for (let kolom = 0; kolom < 10; kolom++) {
				if (speelbord[rij][kolom]) {
					const schipNaam = speelbord[rij][kolom];
					const schip = schepenData.find((s) => s.naam === schipNaam);
					const cel = document.getElementById(`${rij}${kolom}`);
					const img = document.createElement("img");
					img.src = `img/${schip.afbeelding}`;
					img.alt = schipNaam;
					cel.appendChild(img);
				}
			}
		}

		// Update de schepen dropdown
		refreshSchepenDropdown();
	} else {
		vulDropdown("schepen", maakSchipOpties());
	}
}

function slaGamestateOp() {
	const gamestate = {
		speelbord: speelbord,
		schepenData: schepenData,
	};
	localStorage.setItem("zeeslagGamestate", JSON.stringify(gamestate));
}

function startNieuwSpel() {
	localStorage.clear(); // Verwijdert alle items uit de lokale opslag
	location.reload();
}

function toonSchipPreview() {
	// Haal de geselecteerde waarden op (schip, rij, kolom, richting).
	const { schip, rij, kolom, richting } = haalGeselecteerdeWaarden();
	const schipData = schepenData.find((s) => s.naam === schip);

	if (schipData) {
		clearSchipPreview();
		// Loop door de lengte van het schip om elke cel te markeren waar het schip komt.
		for (let i = 0; i < schipData.lengte; i++) {
			let x, y;
			// Bepaal de coördinaten (x, y) van de cel op basis van de richting.
			if (richting === "horizontaal") {
				x = kolom + i;
				y = rij;
			} else {
				x = kolom;
				y = rij + i;
			}

			const cel = document.getElementById(`${y}${x}`);
			if (cel) {
				// Controleer of het schip op de geselecteerde locatie geplaatst kan worden.
				if (kanSchipPlaatsen(schip, rij, kolom, richting)) {
					cel.style.backgroundColor = "rgba(0, 128, 0, 0.5)"; // Semi-transparant groen
				} else {
					cel.style.backgroundColor = "rgba(255, 0, 0, 0.5)"; // Semi-transparant rood
				}
			}
		}
	}
}

function clearSchipPreview() {
	for (let rij = 0; rij < 10; rij++) {
		for (let kolom = 0; kolom < 10; kolom++) {
			const cel = document.getElementById(`${rij}${kolom}`);
			if (cel) {
				cel.style.backgroundColor = ""; // Reset naar de standaard kleur
			}
		}
	}
}

function plaatsGeselecteerdSchip() {
    if (!isSchipGeselecteerd()) {
        toonFoutbericht("Selecteer eerst een schip.");
        return;
    }

    const { schip, rij, kolom, richting } = haalGeselecteerdeWaarden();

    if (!kanSchipPlaatsen(schip, rij, kolom, richting)) {
        toonFoutbericht("Kan schip niet op deze locatie plaatsen.");
        return;
    }

    plaatsSchip(schip, rij, kolom, richting);
    document.getElementById("schepen").value = "";
}

window.onload = function () {
	herstelGamestate();
};
document.getElementById("nieuwspel").addEventListener("click", startNieuwSpel);
document.getElementById("schepen").addEventListener("change", toonSchipPreview);
document.getElementById("rij").addEventListener("change", toonSchipPreview);
document.getElementById("kolom").addEventListener("change", toonSchipPreview);
document.getElementById("plaatsschip").addEventListener("click", plaatsGeselecteerdSchip);
document.querySelectorAll("input[name=richting]").forEach((radio) => {
	radio.addEventListener("change", toonSchipPreview);
});