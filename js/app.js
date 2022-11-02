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
        "ID_Surname": IDCardData.ID_Surname.toUpperCase(),
        "ID_Names": IDCardData.ID_Names,
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

function SubmitIDForm() {
    let form = document.getElementById("IDForm");

    let Picture = form.children["Picture"].files[0];
    // read base64 encoded image
    let reader = new FileReader();
    reader.onloadend = function () {
        document.getElementById("ID_Picture_Image").src = reader.result;
    }
    if (Picture) {
        reader.readAsDataURL(Picture);
    } else {
        document.getElementById("ID_Picture_Image").src = "";
    }

    let IDCardData = {
        "ID_Surname": form.children["Surname"].value,
        "ID_Names": form.children["Names"].value,
        "ID_Sex": form.children["Sex"].value,
        "ID_Picture": form.children["Picture"].value,
        "ID_BirthPlace": form.children["BirthPlace"].value,
    }

    IDCardData.ID_Validity = true;
    document.getElementById("errors").innerHTML = "";


    if(!form.children["Picture"].files[0]) {
        IDCardData.ID_Validity = false;
        document.getElementById("errors").innerHTML += `
            <div class="error">
                <p>Il n'y a pas de photo d'identité ou celle ci n'est pas dans un format supporté.</p>
            </div>
        `;
    }
    
    if(!IDCardData.ID_Surname || !IDCardData.ID_Names) {
        IDCardData.ID_Validity = false;
        document.getElementById("errors").innerHTML += `
            <div class="error">
                <p>Des informations sur vous sont manquantes.</p>
            </div>
        `;
    }

    if(IDCardData.ID_Surname.length > 14 || IDCardData.ID_Names.length > 14) {
        IDCardData.ID_Validity = false;
        document.getElementById("errors").innerHTML += `
            <div class="error">
                <p>Votre nom ou votre prénom est trop long.</p>
            </div>
        `;
    }

    let FinalID = CreateIDCard(IDCardData);
    ApplyIDCard(document.getElementById("IDCard"), FinalID);
}

function ApplyIDCard(IDCardElem, IDCardData) {
    // filling the card in DOM
    IDCardElem.children["ID_Surname"]    .innerText =          IDCardData.ID_Surname;
    IDCardElem.children["ID_Names"]      .innerText =          IDCardData.ID_Names;
    IDCardElem.children["ID_Sex"]        .innerText =          IDCardData.ID_Sex;
    IDCardElem.children["ID_Nationality"].innerText =          IDCardData.ID_Nationality;
    IDCardElem.children["ID_Delivery"]   .innerText = new Date(IDCardData.ID_DeliverDate).toLocaleDateString();
    IDCardElem.children["ID_Expiration"] .innerText = new Date(IDCardData.ID_ExpireDate) .toLocaleDateString();
    IDCardElem.children["ID_BirthPlace"] .innerText =          IDCardData.ID_BirthPlace;

    IDCardElem                         .classList.remove("waiting");
    document.getElementByID("Download").classList.remove("disabled");

    // applying QR
    applyQRCode(IDCardData);

    // checking validity
    if(!IDCardData.ID_Validity) {
        document.getElementsByClassName("IDCardOverlay")[0].src = "./assets/InvalidOverlay.svg";
    }
    else {
        document.getElementsByClassName("IDCardOverlay")[0].src = "./assets/CardOverlay.svg";
    }

    // scroll up
    document.getElementById("PreviewIDCard").scrollIntoView();
}

function applyQRCode(IDCard) {
    document.getElementById("qrcode-container").innerHTML = "";

    let QRData = "";

    for (const [key, value] of Object.entries(IDCard)) {
        if(key != "ID_Picture") {
            QRData += value + ",";
        }
    }

    QRData = QRData.slice(0, -1);

    let QRHash = QRData.hashCode();

    QRData += "," + QRHash;

    var qrc = new QRCode(
        document.getElementById("qrcode-container"),
        btoa(QRData)
    );
}

function DownloadIDForm() {
    let IDCard = document.getElementById("ShareIDCard");
    IDCard.classList.add("aboutToPrint");
    html2canvas(IDCard).then(canvas => {
        var link = document.createElement('a');
        link.download = 'idcard.png';
        link.href = canvas.toDataURL()
        link.click();
    });
    IDCard.classList.remove("aboutToPrint");
}