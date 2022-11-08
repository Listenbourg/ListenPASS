/**
 * @param {string} value - Valeur à nettoyer
 * @param {number} [limit=30] - Limite de caractères
 */
const clear = (value, limit = 30) =>
	value
		.trim()
		.replaceAll("ß", "SS")
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[^a-zA-Z- ]/g, "")
		.replace(/\s\s+/g, " ")
		.toUpperCase()
		.slice(0, limit);

const getImg = (url) =>
	new Promise((resolve) => {
		const imageObj = new Image();
		imageObj.onload = () => resolve(imageObj);
		imageObj.src = url;
	});

window.addEventListener("load", () =>
	new FontFace(
		"Roboto-BOLD",
		"url(https://fonts.gstatic.com/s/roboto/v20/KFOlCnqEu92Fr1MmWUlfBBc4.woff2)"
	)
		.load()
		.then((loaded_face) => document.fonts.add(loaded_face))
);

const crop = (image, size) => {
	const aspectRatio = size.width / size.height;

	let width;
	let height;

	if (aspectRatio >= image.naturalWidth / image.naturalHeight) {
		width = image.naturalWidth;
		height = image.naturalWidth / aspectRatio;
	} else {
		width = image.naturalHeight * aspectRatio;
		height = image.naturalHeight;
	}

	return {
		x: (image.naturalWidth - width) / 2,
		y: (image.naturalHeight - height) / 2,
		width,
		height,
	};
};

// If error : show the error label
/**
 *  Traite les erreurs des inputs
 *
 * @param {boolean} error
 * @param {string} label
 */
const errorLabel = (error, label) => (
	document
		.querySelector("label[for='" + label + "'] span.label-error")
		?.classList[error ? "add" : "remove"]("error-visible"),
	error
);

const DownloadIDForm = (name) => {
	let canvas = document.getElementById("canvas");
	canvas.crossOrigin = "Anonymous";

	const link = document.createElement("a");

	link.download = name;
	link.href = canvas.toDataURL("image/png");
	link.click();
};

const hashCode = (str) => {
	var hash = 0,
		i,
		chr;
	if (str.length === 0) return hash;
	for (i = 0; i < str.length; i++) {
		chr = str.charCodeAt(i);
		hash = (hash << 5) - hash + chr;
		hash |= 0; // Convert to 32bit integer
	}
	return hash;
};
