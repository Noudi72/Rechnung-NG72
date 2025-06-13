// app.js – RG72 Rechnungs-App, Stand: 2025-06-11

let kunden = [];
let artikel = [];
let positionen = [];
let logoDataUrl = null;

// Logo als Data-URL einlesen
window.addEventListener("DOMContentLoaded", () => {
    // Logo laden
    let logoImg = document.getElementById("logo");
    if (logoImg && !logoImg.src.startsWith("data:")) {
        fetch(logoImg.src)
            .then(r => r.blob())
            .then(blob => {
                let reader = new FileReader();
                reader.onload = e => { logoDataUrl = e.target.result; };
                reader.readAsDataURL(blob);
            });
    } else if (logoImg) {
        logoDataUrl = logoImg.src;
    }

    // LocalStorage laden
    if (localStorage.getItem("kunden")) kunden = JSON.parse(localStorage.getItem("kunden"));
    if (localStorage.getItem("artikel")) artikel = JSON.parse(localStorage.getItem("artikel"));
    if (localStorage.getItem("positionen")) positionen = JSON.parse(localStorage.getItem("positionen"));

    renderKunden();
    renderArtikel();
    renderEmpfaengerDropdown();
    renderArtikelDropdown();
    renderPositionen();

    // Events
    document.getElementById("neuerKundeBtn").onclick = neuerKunde;
    document.getElementById("neuerArtikelBtn").onclick = neuerArtikel;
    document.getElementById("neuePositionBtn").onclick = neuePosition;
    document.getElementById("pdfBtn").onclick = createPDF;
    document.getElementById("pdfVorschauBtn").onclick = createPDFVorschau;
});

function speichereDaten() {
    localStorage.setItem("kunden", JSON.stringify(kunden));
    localStorage.setItem("artikel", JSON.stringify(artikel));
    localStorage.setItem("positionen", JSON.stringify(positionen));
}

// --- Kundenverwaltung ---
function renderKunden() {
    let list = document.getElementById("kundenListe");
    if (!list) return;
    list.innerHTML = "";
    kunden.forEach((k, idx) => {
        let li = document.createElement("li");
        li.textContent = k.name;
        let del = document.createElement("button");
        del.textContent = "❌";
        del.onclick = () => { kunden.splice(idx,1); speichereDaten(); renderKunden(); renderEmpfaengerDropdown(); }
        li.appendChild(del);
        list.appendChild(li);
    });
}

function neuerKunde() {
    let name = document.getElementById("kundenName").value.trim();
    if (!name) return;
    kunden.push({ name });
    speichereDaten();
    renderKunden();
    renderEmpfaengerDropdown();
    document.getElementById("kundenName").value = "";
}

function renderEmpfaengerDropdown() {
    let select = document.getElementById("empfaenger");
    if (!select) return;
    select.innerHTML = "";
    kunden.forEach(k => {
        let option = document.createElement("option");
        option.value = k.name;
        option.textContent = k.name;
        select.appendChild(option);
    });
}

// --- Artikelverwaltung ---
function renderArtikel() {
    let list = document.getElementById("artikelListe");
    if (!list) return;
    list.innerHTML = "";
    artikel.forEach((a, idx) => {
        let li = document.createElement("li");
        li.textContent = `${a.name} (${parseFloat(a.preis).toFixed(2)} CHF)`;
        let del = document.createElement("button");
        del.textContent = "❌";
        del.onclick = () => { artikel.splice(idx,1); speichereDaten(); renderArtikel(); renderArtikelDropdown(); }
        li.appendChild(del);
        list.appendChild(li);
    });
}

function neuerArtikel() {
    let name = document.getElementById("artikelName").value.trim();
    let preis = parseFloat(document.getElementById("artikelPreis").value.replace(",", "."));
    if (!name || isNaN(preis)) return;
    artikel.push({ name, preis });
    speichereDaten();
    renderArtikel();
    renderArtikelDropdown();
    document.getElementById("artikelName").value = "";
    document.getElementById("artikelPreis").value = "";
}

function renderArtikelDropdown() {
    let select = document.getElementById("positionsArtikel");
    if (!select) return;
    select.innerHTML = "";
    artikel.forEach(a => {
        let option = document.createElement("option");
        option.value = a.name;
        option.textContent = `${a.name} (${parseFloat(a.preis).toFixed(2)} CHF)`;
        select.appendChild(option);
    });
}

// --- Positionen für die Rechnung ---
function renderPositionen() {
    let list = document.getElementById("positionenListe");
    if (!list) return;
    list.innerHTML = "";
    positionen.forEach((p, idx) => {
        let li = document.createElement("li");
        li.textContent = `${p.beschreibung} | Menge: ${p.menge} | Einzelpreis: ${parseFloat(p.preis).toFixed(2)} CHF`;
        let del = document.createElement("button");
        del.textContent = "❌";
        del.onclick = () => { positionen.splice(idx,1); speichereDaten(); renderPositionen(); }
        li.appendChild(del);
        list.appendChild(li);
    });
}

function neuePosition() {
    let beschreibung = document.getElementById("positionsArtikel").value;
    let menge = parseInt(document.getElementById("positionsMenge").value, 10) || 1;
    let preis = 0;
    let artikelObj = artikel.find(a => a.name === beschreibung);
    if (artikelObj) preis = artikelObj.preis;
    else preis = 0;
    if (!beschreibung || isNaN(menge) || menge < 1) return;
    positionen.push({ beschreibung, menge, preis });
    speichereDaten();
    renderPositionen();
}

// --- PDF-Funktionen ---
function createPDF() {
    generatePDF(false);
}
function createPDFVorschau() {
    generatePDF(true);
}

function generatePDF(isPreview) {
    // Warte, falls das Logo noch als DataURL geladen wird
    if (logoDataUrl === null) {
        alert("Logo wird geladen – bitte nach 2 Sekunden nochmal versuchen.");
        return;
    }
    const doc = new window.jspdf.jsPDF({
        unit: "pt",
        format: "a4"
    });

    let y = 70;

    // Logo
    if (logoDataUrl) {
        doc.addImage(logoDataUrl, "PNG", 36, y, 100, 40);
    }
    y += 50;

    // Empfänger (rechts für C5 Fenster)
    let empfaenger = document.getElementById("empfaenger").value;
    doc.setFont("Avenir", "bold");
    doc.setFontSize(13);
    doc.text(empfaenger, 400, 90, { align: "left" });

    // Titel
    doc.setFont("Avenir", "bold");
    doc.setFontSize(26);
    doc.text("Rechnung", 36, y + 30);

    // Rechnungsdaten
    doc.setFont("Avenir", "normal");
    doc.setFontSize(12);
    doc.text("Rechnungsdatum: " + new Date().toLocaleDateString(), 36, y + 60);
    doc.text("Rechnungsnummer: " + getInvoiceNumber(), 36, y + 80);

    // Tabelle Positionen
    y = y + 110;
    doc.setFont("Avenir", "bold");
    doc.text("Beschreibung", 36, y);
    doc.text("Menge", 300, y, { align: "right" });
    doc.text("Preis", 400, y, { align: "right" });

    doc.setLineWidth(0.5);
    doc.line(36, y + 5, 500, y + 5);

    doc.setFont("Avenir", "normal");
    let sum = 0;
    y += 25;
    positionen.forEach(p => {
        doc.text(p.beschreibung, 36, y);
        doc.text(String(p.menge), 300, y, { align: "right" });
        doc.text((parseFloat(p.preis) * p.menge).toFixed(2) + " CHF", 400, y, { align: "right" });
        sum += parseFloat(p.preis) * p.menge;
        y += 18;
    });

    // Total
    doc.setFont("Avenir", "bold");
    doc.text("Total:", 300, y + 8, { align: "right" });
    doc.text(sum.toFixed(2) + " CHF", 400, y + 8, { align: "right" });

    // Fusszeile
    let fuss = document.getElementById("fusszeile").value;
    doc.setFont("Avenir", "normal");
    doc.setFontSize(10);
    doc.text(fuss, 36, 790);

    // Download oder Vorschau
    if (isPreview) {
        window.open(doc.output("bloburl"), "_blank");
    } else {
        doc.save("Rechnung-NG72.pdf");
    }
}

// --- Hilfsfunktion für Rechnungsnummer ---
function getInvoiceNumber() {
    // Einfache Nummerierung nach Datum + Zähler (besser: speichern)
    const today = new Date();
    return today.getFullYear() + "-" + String(today.getMonth()+1).padStart(2, "0") + "-" + String(today.getDate()).padStart(2,"0") + "-001";
}