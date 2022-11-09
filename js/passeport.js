const MULTIPLIER = 4;
const SIZE = {
	width: 620 * MULTIPLIER,
	height: 436 * MULTIPLIER,
};

let passeport = null,
	passeport_filo = null;

window.addEventListener("load", () =>
	Promise.all([
		getImg("./assets/PASSEPORT.svg").then((img) => (passeport = img)),
		getImg("./assets/PASSEPORT-FILI.svg").then((img) => (passeport_filo = img)),
		new FontFace(
			"Courrier-Prime-BOLD",
			"url(https://fonts.gstatic.com/s/courierprime/v7/u-4k0q2lgwslOqpF_6gQ8kELY7pMT-Dfqw.woff2)"
		)
			.load()
			.then((loaded_face) => document.fonts.add(loaded_face)),
	])
);

const randNum = () =>
	Math.round(Math.random() * 10 ** 9)
		.toString()
		.padStart(9, "0");

const calculateTextLength = (text, font) => {
	const canvas = document.createElement("canvas");
	const context = canvas.getContext("2d");
	context.font = font;
	const metrics = context.measureText(text);
	return metrics.width;
};

const preventOverflow = (text, font, maxWidth) => {
	let textLength = calculateTextLength(text, font);
	return text.slice(
		0,
		Math.trunc(
			// calculate the number of characters that can fit in the maxWidth
			(text.length * maxWidth) / textLength
		)
	);
};

const canvadraw = async (
	nom,
	prenom,
	sexe,
	date_naissance,
	date_deliv,
	date_expi,
	lieu,
	raw_image
) => {
	const image = await getImg(
		(window.webkitURL || window.URL).createObjectURL(raw_image)
	);
	const passportNum = randNum();
	const persoNum = randNum();
	const [MegaText1, MegaText2] = generateMrzTd3({
		passport: {
			mrzType: "td3",
			type: "p",
			issuingCountry: "LIS",
			number: passportNum,
			expirationDate: new Date(date_expi.split("/").reverse().join("-")),
		},
		user: {
			surname: nom
				.trim()
				.toUpperCase()
				.slice(0, 15 /* max length for the machine-readable zone */),
			givenNames: prenom
				.trim()
				.toUpperCase()
				.slice(0, 15 /* max length for the machine-readable zone */),
			nationality: "LSB",
			dateOfBirth: new Date(date_naissance.split("/").reverse().join("-")),
			sex: sexe,
		},
	})
		.split("\n")
		.map((e) => e.trim());

	const infos = [
		passportNum,
		nom,
		prenom,
		date_naissance,
		sexe,
		date_deliv,
		lieu,
		date_expi,
		persoNum,
	];

	applyQRCode(infos);
	const canvas = document.getElementById("canvas");
	const ctx = canvas.getContext("2d");
	canvas.width = SIZE.width;
	canvas.height = SIZE.height;
	ctx.clearRect(0, 0, SIZE.width, SIZE.height);
	ctx.font = `${18 * MULTIPLIER}px Roboto-BOLD`;
	ctx.drawImage(passeport, 0, 0, SIZE.width, SIZE.height);
	ctx.fillText("P", 201 * MULTIPLIER, (90 + 15) * MULTIPLIER);
	ctx.fillText("LIS", 310.5 * MULTIPLIER, (90 + 15) * MULTIPLIER);
	ctx.fillText(passportNum, 488 * MULTIPLIER, (90 + 15) * MULTIPLIER);

	// How it works: "WWWWWWWWWWWWWWWWWWWWWWWWW" is the biggest text possible before an
	// overflow (I assumed W is the widest character). If the text WIDTH is bigger than
	// the max width, we reduce the text size using a math formula (see `preventOverflow`).
	let maxWidth = Math.trunc(
		calculateTextLength("WWWWWWWWWWWWWWWWWWWWWWWWW", ctx.font)
	);

	nom = preventOverflow(nom, ctx.font, maxWidth);
	prenom = preventOverflow(prenom, ctx.font, maxWidth);

	ctx.fillText(nom, 201 * MULTIPLIER, (131.67 + 15) * MULTIPLIER);
	ctx.fillText(prenom, 201 * MULTIPLIER, (173.33 + 15) * MULTIPLIER);
	ctx.fillText(
		"LISTENBOURGEOIS" + (sexe === "F" ? "E" : ""),
		201 * MULTIPLIER,
		(215 + 15) * MULTIPLIER
	);
	ctx.fillText(date_naissance, 201 * MULTIPLIER, (256.67 + 15) * MULTIPLIER);
	ctx.fillText(sexe, 201 * MULTIPLIER, (298.33 + 15) * MULTIPLIER);
	ctx.fillText(date_deliv, 201 * MULTIPLIER, (340 + 15) * MULTIPLIER);
	ctx.fillText(lieu, 396 * MULTIPLIER, (299.33 + 15) * MULTIPLIER);
	ctx.fillText(date_expi, 396 * MULTIPLIER, (340 + 15) * MULTIPLIER);
	ctx.fillText(persoNum, 431 * MULTIPLIER, (256.67 + 15) * MULTIPLIER);
	ctx.font = `${21.75 * MULTIPLIER}px Courrier-Prime-BOLD`;
	ctx.fillText(MegaText1, 24 * MULTIPLIER, (371 + 15) * MULTIPLIER);
	ctx.fillText(MegaText2, 24 * MULTIPLIER, (396 + 15) * MULTIPLIER);
	const imgPos = {
		width: 161,
		height: 229,
	};
	const pos = crop(
		{ naturalWidth: image.naturalWidth, naturalHeight: image.naturalHeight },
		imgPos
	);
	ctx.drawImage(
		image,
		pos.x,
		pos.y,
		pos.width,
		pos.height,
		22 * MULTIPLIER,
		73 * MULTIPLIER,
		imgPos.width * MULTIPLIER,
		imgPos.height * MULTIPLIER
	);
	ctx.drawImage(
		document.querySelector("#qrcode"),
		514.05 * MULTIPLIER,
		131.05 * MULTIPLIER,
		78.9 * MULTIPLIER,
		78.9 * MULTIPLIER
	);
	ctx.drawImage(passeport_filo, 0, 0, SIZE.width, SIZE.height);
	document.querySelector("#PreviewIDCard").classList.add("visible");
	document.querySelector("#downloadBtn").classList.remove("disabled");
	// statistiques
	mixpanel.track("Passeport généré");
};

/**
 * @param {string} date
 * @return {boolean}
 */
const validateDate = (date) => {
	const d = new Date(date);
	return d instanceof Date && !isNaN(d);
};

const MAX_SURNAME_LENGTH = 30;
const MAX_NAMES_LENGTH = 30;

const SubmitIDForm = () => {
	const form = document.getElementById("IDForm");

	const Picture = form.children["Picture"]?.files?.[0];

	const IDCardData = {
		ID_Surname: clear(form.children["Surname"].value, MAX_SURNAME_LENGTH),
		ID_Names: clear(form.children["Names"].value, MAX_NAMES_LENGTH),
		ID_BirthDate: form.children["BirthDate"].value,
		ID_Sex: form.children["Sex"].children[0].value,
		ID_Picture: Picture,
		ID_BirthPlace: clear(form.children["BirthPlace"].children[0].value),
	};

	if (
		[
			errorLabel(!Picture, "Picture"),
			errorLabel(clear(IDCardData.ID_Surname).length <= 0, "Surname"),
			errorLabel(clear(IDCardData.ID_Names).length <= 0, "Names"),
			errorLabel(
				!(
					IDCardData.ID_BirthDate.length == 10 &&
					/^([0-9]{4})-([0-9]{2})-([0-9]{2})$/.test(IDCardData.ID_BirthDate) &&
					IDCardData.ID_BirthDate.split("-")[2] <= 31 &&
					IDCardData.ID_BirthDate.split("-")[1] <= 12 &&
					validateDate(IDCardData.ID_BirthDate)
				),
				"BirthDate"
			),
			errorLabel(clear(IDCardData.ID_BirthPlace).length <= 0, "BirthPlace"),
			errorLabel(!["M", "F", "X"].includes(IDCardData.ID_Sex), "Sex"),
		].some((e) => e === true)
	)
		return;

	ApplyIDCard(IDCardData);
};

const ApplyIDCard = async (IDCardData) => {
	const expir = new Date();
	expir.setFullYear(expir.getFullYear() + 5);
	await canvadraw(
		clear(IDCardData.ID_Surname, MAX_SURNAME_LENGTH),
		clear(IDCardData.ID_Names, MAX_NAMES_LENGTH),
		IDCardData.ID_Sex,
		new Date(
			IDCardData.ID_BirthDate.split("/").reverse().join("-")
		).toLocaleDateString("fr"),
		new Date().toLocaleDateString("fr"),
		expir.toLocaleDateString("fr"),
		clear(IDCardData.ID_BirthPlace),
		IDCardData.ID_Picture
	);

	document.getElementById("downloadBtn").classList.remove("disabled");

	// scroll up
	document.getElementById("canvas").scrollIntoView();
};

const applyQRCode = (infos) => {
	let QRData = ["V2", ...infos].join(",");

	new QRious({
		element: document.getElementById("qrcode"),
		value: btoa(QRData + "," + hashCode(QRData)),
		size: 512,
	});
};
