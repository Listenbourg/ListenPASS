const MULTIPLIER = 4;
const SIZE = {
    width: 502*MULTIPLIER,
    height: 325*MULTIPLIER,
}

const clear = (value, limit = 30) =>
    value
        .trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z- ]/g, "")
        .replace(/\s\s+/g, " ")
        .toUpperCase()
        .slice(0, limit);


let cni = null,
cni_filo = null;

const getImg = (url) =>
    new Promise(resolve => {
        const imageObj = new Image();
        imageObj.onload = ()=>resolve(imageObj);
        imageObj.src = url;
    });

window.onload = ()=>Promise.all([
    (new FontFace(
        "Roboto-BOLD",
        "url(https://fonts.gstatic.com/s/roboto/v20/KFOlCnqEu92Fr1MmWUlfBBc4.woff2)"
    )).load().then((loaded_face) => document.fonts.add(loaded_face)),
    getImg("/assets/CNI.svg").then((img) => (cni = img)),
    getImg("/assets/CNI-FILI.svg").then((img) => (cni_filo = img)),
]);

function crop(image) {
    const width = 161;
    const height = 229;
    const aspectRatio = width / height;

    let newWidth;
    let newHeight;

    const imageRatio = image.naturalWidth / image.naturalHeight;

    if (aspectRatio >= imageRatio) {
        newWidth = image.naturalWidth;
        newHeight = image.naturalWidth / aspectRatio;
    } else {
        newWidth = image.naturalHeight * aspectRatio;
        newHeight = image.naturalHeight;
    }

    const x = (image.naturalWidth - newWidth) / 2;
    const y = (image.naturalHeight - newHeight) / 2;

    return {
        x: x,
        y: y,
        width: newWidth,
        height: newHeight,
    };
}

const canvadraw = async (nom,prenom,sexe,date_deliv, date_expi, lieu,raw_image) => {
    const image = await getImg((window.webkitURL || window.URL).createObjectURL(raw_image))
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = SIZE.width;
    canvas.height = SIZE.height;
    ctx.clearRect(0, 0, SIZE.width, SIZE.height);
    ctx.font = `${18*MULTIPLIER}px Roboto-BOLD`;
    ctx.drawImage(cni, 0, 0, 502*MULTIPLIER, 325*MULTIPLIER);
    ctx.fillText(nom, 201*MULTIPLIER, 112*MULTIPLIER);
    ctx.fillText(prenom, 201*MULTIPLIER, 159*MULTIPLIER);
    ctx.fillText(sexe, 201*MULTIPLIER, 206*MULTIPLIER);
    ctx.fillText("LIS", 299*MULTIPLIER, 206*MULTIPLIER);
    ctx.fillText(date_deliv, 201*MULTIPLIER, 253*MULTIPLIER);
    ctx.fillText(date_expi, 364*MULTIPLIER, 253*MULTIPLIER);
    ctx.fillText(lieu, 201*MULTIPLIER, 300*MULTIPLIER);
    const pos = crop({naturalWidth: image.naturalWidth, naturalHeight: image.naturalHeight});
    ctx.drawImage(image,
        pos.x, pos.y,
        pos.width, pos.height,
        22*MULTIPLIER, 72*MULTIPLIER,
        161*MULTIPLIER, 229*MULTIPLIER);
        ctx.drawImage(document.querySelector("#qrcode img"), 400.05*MULTIPLIER,77.05*MULTIPLIER,78.9*MULTIPLIER,78.9*MULTIPLIER)
    ctx.drawImage(cni_filo, 0, 0, 502*MULTIPLIER, 325*MULTIPLIER);
    document.querySelector("#PreviewIDCard").classList.add("visible")
    document.querySelector(".buttons .downloadButton").classList.remove("disabled")
};

String.prototype.hashCode = function() {
    var hash = 0,
      i, chr;
    if (this.length === 0) return hash;
    for (i = 0; i < this.length; i++) {
      chr = this.charCodeAt(i);
      hash = ((hash << 5) - hash) + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
}

function CreateIDCard(IDCardData) {
    let DeliverDate = new Date();

    let ExpireDate = new Date();
    ExpireDate.setFullYear(ExpireDate.getFullYear() + 5);

    let IDCard = {
        "ID_Surname": clear(IDCardData.ID_Surname),
        "ID_Names": clear(IDCardData.ID_Names),
        "ID_Sex": IDCardData.ID_Sex,
        "ID_Nationality": "LIS",
        "ID_Picture": IDCardData.ID_Picture,
        "ID_DeliverDate": DeliverDate.getTime(),
        "ID_ExpireDate": ExpireDate.getTime(),
        "ID_BirthPlace": IDCardData.ID_BirthPlace,
        "ID_Validity": IDCardData.ID_Validity,
    }

    return IDCard;
}

// If error : show the error label
const errorLabel = (error, label)=>document.querySelector("label[for='"+label+"'] span.label-error")?.classList[error?"add":"remove"]("error-visible");

function SubmitIDForm() {
    let form = document.getElementById("IDForm");

    let Picture = form.children["Picture"]?.files?.[0];

    let IDCardData = {
        "ID_Surname": clear(form.children["Surname"].value, 15),
        "ID_Names": clear(form.children["Names"].value, 15),
        "ID_Sex": form.children["Sex"].value,
        "ID_Picture": Picture,
        "ID_BirthPlace": form.children["BirthPlace"].value,
    }

    IDCardData.ID_Validity = true;
    document.getElementById("errors").innerHTML = "";

    errorLabel(!Picture, "Picture");
    errorLabel(clear(IDCardData.ID_Surname).length <=0, "Surname");
    errorLabel(clear(IDCardData.ID_Names).length <=0, "Names");
    errorLabel(clear(IDCardData.ID_BirthPlace).length <=0, "BirthPlace");
    errorLabel(!["M","F","X"].includes(IDCardData.ID_Sex), "Sex");

    if(!Picture ||
        clear(IDCardData.ID_Surname).length <=0 ||
        clear(IDCardData.ID_Names).length <=0 ||
        clear(IDCardData.ID_BirthPlace).length <=0 ||
        !["M","F","X"].includes(IDCardData.ID_Sex)) return;
    let FinalID = CreateIDCard(IDCardData);
    ApplyIDCard(document.getElementById("IDCard"), FinalID);
}

async function ApplyIDCard(IDCardElem, IDCardData) {
    // filling the card in DOM

    
    applyQRCode(IDCardData);

    await canvadraw(IDCardData.ID_Surname, IDCardData.ID_Names, IDCardData.ID_Sex, new Date(IDCardData.ID_DeliverDate).toLocaleDateString("fr"), new Date(IDCardData.ID_ExpireDate).toLocaleDateString("fr"), IDCardData.ID_BirthPlace, IDCardData.ID_Picture);

    IDCardElem.classList.remove("waiting");
    document.getElementsByClassName("downloadButton")[0].classList.remove("disabled");

    // scroll up
    document.getElementById("canvas").scrollIntoView();
}

function applyQRCode(IDCard) {
    let QRData = Object.entries(IDCard).filter(([k])=>k!=="ID_Picture").map(([k,v])=>v).join(",");

    const qrc = new QRCode(
        document.getElementById("qrcode"),
        btoa(QRData + "," + QRData.hashCode())
    );
}

function DownloadIDForm() {
    let canvas = document.getElementById("canvas");

    let link = document.createElement("a");
    link.download = "cni-listenbourg.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
}