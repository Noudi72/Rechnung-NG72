// Hilfsfunktionen für Speicher
function save(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
function load(key, fallback) { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }

// Kundenverwaltung
let kunden = load("kunden", []);
let artikel = load("artikel", []);
let rechnung = { empfaenger: "", positionen: [], fusszeile: "" };

function renderKunden() {
    let ul = document.getElementById("kundenListe");
    ul.innerHTML = "";
    kunden.forEach((k, i) => {
        let li = document.createElement("li");
        li.textContent = k.replace(/\n/g, " / ");
        let del = document.createElement("button");
        del.textContent = "✕";
        del.onclick = () => { kunden.splice(i,1); save("kunden", kunden); renderKunden(); renderEmpfaenger(); };
        li.append(del);
        ul.append(li);
    });
}
function addKunde() {
    let ta = document.getElementById("kunde");
    if (ta.value.trim()) {
        kunden.push(ta.value.trim());
        save("kunden", kunden);
        ta.value = "";
        renderKunden();
        renderEmpfaenger();
    }
}
function renderEmpfaenger() {
    let sel = document.getElementById("empfaenger");
    sel.innerHTML = "";
    kunden.forEach((k, i) => {
        let opt = document.createElement("option");
        opt.value = i;
        opt.textContent = k.split('\n')[0];
        sel.append(opt);
    });
}
renderKunden(); renderEmpfaenger();

// Artikelverwaltung
function renderArtikel() {
    let ul = document.getElementById("artikelListe");
    ul.innerHTML = "";
    artikel.forEach((a, i) => {
        let li = document.createElement("li");
        li.textContent = `${a.name} (${Number(a.preis).toFixed(2)} CHF)`;
        let del = document.createElement("button");
        del.textContent = "✕";
        del.onclick = () => { artikel.splice(i,1); save("artikel", artikel); renderArtikel(); };
        li.append(del);
        ul.append(li);
    });
}
function addArtikel() {
    let n = document.getElementById("artikelName");
    let p = document.getElementById("artikelPreis");
    if (n.value.trim() && p.value) {
        artikel.push({name: n.value.trim(), preis: Number(p.value), beschreibung: ""});
        save("artikel", artikel);
        n.value = ""; p.value = "";
        renderArtikel();
    }
}
renderArtikel();

// Rechnung Positionen
let positionen = [];
function renderPositionen() {
    let cont = document.getElementById("positionen");
    cont.innerHTML = "";
    positionen.forEach((pos, i) => {
        let wrap = document.createElement("div");
        let sel = document.createElement("select");
        artikel.forEach(a => {
            let opt = document.createElement("option");
            opt.value = a.name;
            opt.textContent = a.name;
            sel.append(opt);
        });
        sel.value = pos.name || "";
        sel.onchange = () => { 
            pos.name = sel.value;
            let a = artikel.find(a => a.name == sel.value);
            if (a) pos.preis = a.preis;
            renderPositionen();
        };
        let menge = document.createElement("input");
        menge.type = "number"; menge.value = pos.menge || 1; menge.min = 1;
        menge.onchange = () => { pos.menge = Number(menge.value); }
        let preis = document.createElement("input");
        preis.type = "number"; preis.value = pos.preis || 0; preis.step = 0.05;
        preis.onchange = () => { pos.preis = Number(preis.value); }
        let del = document.createElement("button");
        del.textContent = "✕";
        del.onclick = () => { positionen.splice(i,1); renderPositionen(); }
        wrap.append(sel, menge, preis, del);
        cont.append(wrap);
    });
}
function addPosition() {
    positionen.push({name: artikel[0]?.name || "", menge: 1, preis: artikel[0]?.preis || 0});
    renderPositionen();
}
renderPositionen();

// Rechnung erstellen
function createPDF() {
    let empfaengerIdx = document.getElementById("empfaenger").value;
    let empfaenger = kunden[empfaengerIdx] || "";
    let fusszeile = document.getElementById("fusszeile").value;
    let pos = positionen;
    // PDFKit oder jsPDF wird hier normalerweise benötigt.
    // Wir nutzen jsPDF (CDN laden, dann weiter)
    if (typeof jsPDF === "undefined") {
        let script = document.createElement('script');
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
        script.onload = () => setTimeout(createPDF, 200);
        document.body.append(script);
        return;
    }
    const { jsPDF } = window.jspdf;
    let doc = new jsPDF({unit: 'pt', format: 'a4'});
    doc.setFont("helvetica", ""); // Fallback: Avenir ist online nicht Standard, aber als PDF einbettbar (lokal ginge auch Avenir)
    let y = 70;
    // Logo
    let logoImg = document.getElementById("logo");
    if (logoImg && logoImg.src.startsWith("data:")) {
        doc.addImage(logoImg.src, "PNG", 36, y, 100, 40);
    }
    // Empfängerblock (rechts oben, Fenstercouvert)
    let empf = empfaenger.split('\n');
    empf.forEach((line, i) => doc.text(line, 400, 70 + i * 16));
    y += 60 + empf.length * 16 + 8;
    // Tabelle Kopf
    doc.setFontSize(13);
    doc.text("Rechnung", 40, y); y += 32;
    doc.setFontSize(10);
    doc.text("Pos", 40, y); doc.text("Beschreibung", 80, y); doc.text("Menge", 300, y); doc.text("Preis (CHF)", 370, y);
    y += 14;
    doc.setDrawColor(180,180,180); doc.line(40, y, 540, y); y += 8;
    // Positionen
    let total = 0;
    pos.forEach((p, i) => {
        doc.text(String(i+1), 40, y);
        doc.text(p.name, 80, y);
        doc.text(String(p.menge), 310, y, {align: "right"});
        doc.text(p.preis.toFixed(2), 420, y, {align: "right"});
        total += p.menge * p.preis;
        y += 18;
    });
    y += 14;
    doc.setFontSize(12);
    doc.text("Total: CHF " + total.toFixed(2), 380, y, {align: "right"});
    y += 30;
    // Fusszeile
    doc.setFontSize(9);
    doc.text(fusszeile, 40, y, {maxWidth: 500});
    // QR (optional)
    // TODO: Swiss QR Integration
    let url = doc.output("bloburl");
    document.getElementById("pdfPreview").src = url;
    let a = document.createElement("a");
    a.href = url;
    a.download = "Rechnung.pdf";
    a.click();
}