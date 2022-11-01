function CreateIDCard(IDCardData) {
    let DeliverDate = new Date();

    let ExpireDate = new Date();
    ExpireDate.setFullYear(ExpireDate.getFullYear() + 5);

    let IDCard = {
        "ID_Surname": IDCardData.ID_Surname,
        "ID_Names": IDCardData.ID_Names,
        "ID_Sex": IDCardData.ID_Sex,
        "ID_Nationality": "LIS",
        "ID_Picture": IDCardData.ID_Picture,
        "ID_DeliverDate": DeliverDate.getTime(),
        "ID_ExpireDate": ExpireDate.getTime(),
        "ID_BirthPlace": "Listenbourg",
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
    }

    let FinalID = CreateIDCard(IDCardData);
    ApplyIDCardAnimation(document.getElementById("IDCard"), FinalID);
}

function ApplyIDCard(IDCardElem, IDCardData) {
    // filling the card in DOM
    IDCardElem.children["ID_Surname"].innerText = IDCardData.ID_Surname;
    IDCardElem.children["ID_Names"].innerText = IDCardData.ID_Names;
    IDCardElem.children["ID_Sex"].innerText = IDCardData.ID_Sex;
    IDCardElem.children["ID_Nationality"].innerText = IDCardData.ID_Nationality;
    IDCardElem.children["ID_Delivery"].innerText = new Date(IDCardData.ID_DeliverDate).toLocaleDateString();
    IDCardElem.children["ID_Expiration"].innerText = new Date(IDCardData.ID_ExpireDate).toLocaleDateString();
    IDCardElem.children["ID_BirthPlace"].innerText = IDCardData.ID_BirthPlace;

    // applying QR
    applyQRCode(IDCardData)
}

function ApplyIDCardAnimation(IDCardElem, IDCardData) {
    ApplyIDCard(IDCardElem, IDCardData);
}

function applyQRCode(IDCard) {
    document.getElementById("qrcode-container").innerHTML = "";

    let QRData = `(LISTENBOURGID)(V1),(SURNAME:${IDCard.ID_Surname}),(NAMES:${IDCard.ID_Names})`;

    var qrc = new QRCode(
        document.getElementById("qrcode-container"),
        btoa(QRData)
    );
}

function DownloadIDForm() {
    let IDCard = document.getElementById("IDCard");
    IDCard.classList.add("aboutToPrint");
    html2canvas(IDCard).then(canvas => {
        var link = document.createElement('a');
        link.download = 'idcard.png';
        link.href = canvas.toDataURL()
        link.click();
    });
    IDCard.classList.remove("aboutToPrint");
}