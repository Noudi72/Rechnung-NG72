// === Styles für Listen und Rahmen (wird in HTML geladen, falls nicht bereits eingebunden)
const style = document.createElement('style');
style.innerHTML = `
#kunden_list, #artikel_list {
  border: 1px solid #ccc;
  border-radius: 6px;
  padding: 8px 12px;
  margin-bottom: 16px;
  background: #fafbfc;
}
#kunden_list li, #artikel_list li {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}
#kunden_list button, #artikel_list button {
  background: none;
  border: none;
  padding: 0;
  margin-left: 6px;
  cursor: pointer;
  font-size: 18px;
}
#kunden_list button:hover, #artikel_list button:hover {
  filter: brightness(0.8);
}
`;
document.head.appendChild(style);
// === Button: Neue Rechnung starten einfügen
const neuerBtn = document.createElement("button");
neuerBtn.textContent = "Neue Rechnung starten";
neuerBtn.style = "margin-left:12px;background:#555;";
neuerBtn.onclick = () => {
  positionen = [];
  renderPositionen();
  $("#rechnr").value = generateNextRechnungsnummer();
  $("#frist").value = 30;
  $("#artikel_select").selectedIndex = 0;
  $("#menge").value = 1;
  $("#empfaenger").selectedIndex = 0;
  $("#status").textContent = "Formular zurückgesetzt.";
  setTimeout(() => $("#status").textContent = "", 4000);
};
setTimeout(() => {
  const makePdfBtn = document.getElementById("makepdf");
  if (makePdfBtn && makePdfBtn.parentNode) {
    makePdfBtn.parentNode.insertBefore(neuerBtn, makePdfBtn.nextSibling);
  }
}, 200);

// === Backup- & Restore-Buttons einfügen
const backupBtn = document.createElement("button");
backupBtn.textContent = "Backup erstellen";
backupBtn.style = "margin-left:12px;background:#1b5e20;";
backupBtn.onclick = () => {
  const data = {
    kunden,
    artikel,
    fuss,
    letzteRechnr: ls.getItem("ng_last_rechnr")
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "rechnung-ng72-backup.json";
  a.click();
  URL.revokeObjectURL(url);
};

const restoreInput = document.createElement("input");
restoreInput.type = "file";
restoreInput.accept = "application/json";
restoreInput.style = "display:none";
restoreInput.addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);
      if (data.kunden && data.artikel) {
        kunden = data.kunden;
        artikel = data.artikel;
        fuss = data.fuss || fuss;
        if (data.letzteRechnr) ls.setItem("ng_last_rechnr", data.letzteRechnr);
        saveKunden(kunden);
        saveArtikel(artikel);
        ls.setItem("ng_fuss", fuss);
        renderKunden();
        renderArtikel();
        renderEmpfaenger();
        renderArtikelDropdown();
        renderPositionen();
        $("#fusszeile").value = fuss;
        $("#rechnr").value = generateNextRechnungsnummer();
        alert("Backup erfolgreich importiert!");
      } else {
        alert("Ungültiges Backup-Format.");
      }
    } catch {
      alert("Fehler beim Einlesen der Datei.");
    }
  };
  reader.readAsText(file);
});
document.body.appendChild(restoreInput);

const restoreBtn = document.createElement("button");
restoreBtn.textContent = "Backup importieren";
restoreBtn.style = "margin-left:12px;background:#9c27b0;";
restoreBtn.onclick = () => restoreInput.click();

setTimeout(() => {
  const makePdfBtn = document.getElementById("makepdf");
  if (makePdfBtn && makePdfBtn.parentNode) {
    makePdfBtn.parentNode.append(backupBtn, restoreBtn);
  }
}, 400);

// === Button: PDF Vorschau anzeigen einfügen
const vorschauBtn = document.createElement("button");
vorschauBtn.textContent = "PDF Vorschau anzeigen";
vorschauBtn.style = "margin-left:12px;background:#006fb9;";
vorschauBtn.onclick = async () => {
  if(kunden.length == 0) { alert("Bitte Empfänger auswählen."); return; }
  let empfaenger = kunden[$("#empfaenger").value];
  let pos = positionen.length ? positionen : [{ name: artikel[0]?.name || "Position", menge: 1, preis: artikel[0]?.preis || 0 }];
  let frist = $("#frist").value;
  let rechnr = $("#rechnr").value.trim() || "2024-001";
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  await addImageToPDF(doc, 'logoimg', 16, 12, 28, 28);
  let empf_x = 110, empf_y = 58, empf_ls = 6;
  let adr_x = 16, adr_y = empf_y, adr_ls = 6;
  doc.setFontSize(11).setFont("helvetica", "normal");
  doc.text("Noël Guyaz", adr_x, adr_y);
  doc.text("Bellacherstrasse 4a", adr_x, adr_y + adr_ls);
  doc.text("2545 Selzach", adr_x, adr_y + 2 * adr_ls);
  const absText = "Abs. Noël Guyaz, Bellacherstrasse 4a, 2545 Selzach";
  doc.setFontSize(8).setFont("helvetica", "italic");
  const abs_x = 110, abs_y = 50;
  doc.text(absText, abs_x, abs_y);
  const absWidth = doc.getTextWidth(absText);
  doc.setLineWidth(0.2);
  doc.line(abs_x, abs_y + 1.2, abs_x + absWidth, abs_y + 1.2);
  let empf = empfaenger.split("\n");
  doc.setFont("helvetica", "normal").setFontSize(11);
  empf.forEach((l, i) => doc.text(l, empf_x, empf_y + i * empf_ls));
  let titel_y = empf_y + empf_ls * empf.length + 15;
  doc.setFont("helvetica", "bold").setFontSize(18);
  doc.text("Rechnung", 16, titel_y);
  let fristen_y = titel_y + 13;
  doc.setFont("helvetica", "normal").setFontSize(13);
  doc.text(`Rechnungsnummer: ${rechnr}`, 16, fristen_y);
  doc.text(`Zahlungsfrist: ${frist} Tage`, 16, fristen_y + 8);
  let tab_y = fristen_y + 18;
  doc.setFont("helvetica", "bold").setFontSize(13);
  doc.text("Beschreibung", 16, tab_y);
  doc.text("Menge", 98, tab_y);
  doc.text("Preis", 198, tab_y, { align: "right" });
  let table_start_y = tab_y + 2;
  doc.setLineWidth(0.3);
  doc.line(16, table_start_y, 200, table_start_y);
  let row_y = table_start_y + 7;
  doc.setFont("helvetica", "normal").setFontSize(12);
  let total = 0;
  pos.forEach(p => {
    doc.text(p.name, 16, row_y);
    doc.text(String(p.menge), 105, row_y, { align: "right" });
    doc.text(Number(p.preis).toFixed(2) + " CHF", 198, row_y, { align: "right" });
    row_y += 7;
    total += Number(p.preis) * Number(p.menge);
  });
  doc.line(16, row_y - 3, 200, row_y - 3);
  row_y += 2;
  doc.setFont("helvetica", "bold");
  doc.text("Total:", 98, row_y);
  doc.text(total.toFixed(2) + " CHF", 198, row_y, { align: "right" });
  let fussY = 180;
  doc.setFont("helvetica", "normal").setFontSize(10);
  doc.text(fuss, 16, fussY, { maxWidth: 175 });
  
  // Zahlteil wird weggelassen - kann auf qr-rechnung.net hinzugefügt werden

  window.open(doc.output("bloburl"), '_blank');
};

setTimeout(() => {
  const makePdfBtn = document.getElementById("makepdf");
  if (makePdfBtn && makePdfBtn.parentNode) {
    makePdfBtn.parentNode.insertBefore(vorschauBtn, makePdfBtn.nextSibling);
  }
}, 300);

// === Lokale Speicherung
const ls = window.localStorage;
function loadKunden() { return JSON.parse(ls.getItem("ng_kunden") || "[]"); }
function saveKunden(arr) { ls.setItem("ng_kunden", JSON.stringify(arr)); }
function loadArtikel() { return JSON.parse(ls.getItem("ng_artikel") || "[]"); }
function saveArtikel(arr) { ls.setItem("ng_artikel", JSON.stringify(arr)); }
function loadIBAN() { return ls.getItem("ng_iban") || ""; }
function saveIBAN(iban) { ls.setItem("ng_iban", iban); }

// $ muss VOR allen anderen Verwendungen definiert sein
const $ = sel => document.querySelector(sel);

let kunden = loadKunden();
let artikel = loadArtikel();
let positionen = [];
let fuss = ls.getItem("ng_fuss") || "Kein MWST-Ausweis, da nicht mehrwertsteuerpflichtig gemäss Art. 10 MWSTG. Vielen Dank für Ihr Vertrauen! Kontakt: n.guyaz@icloud.com / +41 79 414 42 049";

// === IBAN laden und anzeigen (nach DOM geladen)
document.addEventListener("DOMContentLoaded", () => {
  const ibanInput = $("#iban_input");
  if (ibanInput) {
    ibanInput.value = loadIBAN();
    const ibanSaveBtn = $("#iban_save");
    if (ibanSaveBtn) {
      ibanSaveBtn.addEventListener("click", () => {
        saveIBAN(ibanInput.value.trim());
        const statusEl = $("#status");
        if (statusEl) {
          statusEl.textContent = "IBAN gespeichert!";
          setTimeout(() => {
            if (statusEl) statusEl.textContent = "";
          }, 3000);
        }
      });
    }
  }
});

// === Kunden-Listen mit Bearbeiten
function renderKunden() {
  let list = $("#kunden_list");
  if (!list) return;
  list.innerHTML = "";
  kunden.forEach((k, i) => {
    let li = document.createElement("li");

    function showView() {
      li.innerHTML = "";
      k.split('\n').forEach(line => {
        let div = document.createElement("div");
        div.textContent = line;
        li.appendChild(div);
      });
      let editBtn = document.createElement("button");
      editBtn.textContent = "✏️";
      editBtn.title = "Bearbeiten";
      editBtn.onclick = () => showEdit();
      let delBtn = document.createElement("button");
      delBtn.textContent = "🗑";
      delBtn.title = "Löschen";
      delBtn.onclick = () => { kunden.splice(i, 1); saveKunden(kunden); renderKunden(); renderEmpfaenger(); }
      li.append(editBtn, delBtn);
    }

    function showEdit() {
      li.innerHTML = "";
      let ta = document.createElement("textarea");
      ta.value = k;
      ta.rows = 3;
      ta.style.width = "220px";
      let saveBtn = document.createElement("button");
      saveBtn.textContent = "💾";
      saveBtn.title = "Speichern";
      saveBtn.onclick = () => {
        kunden[i] = ta.value;
        saveKunden(kunden); renderKunden(); renderEmpfaenger();
      };
      li.append(ta, saveBtn);
    }

    showView();
    list.append(li);
  });
}
$("#kunde_save")?.addEventListener("click", () => {
  let val = $("#kunde_input").value.trim();
  if(val && !kunden.includes(val)) {
    kunden.push(val); saveKunden(kunden); renderKunden(); renderEmpfaenger();
    $("#kunde_input").value = "";
  }
});
renderKunden();

// === Artikel-Listen mit Bearbeiten
function renderArtikel() {
  let list = $("#artikel_list");
  if (!list) return;
  list.innerHTML = "";
  artikel.forEach((a, i) => {
    let li = document.createElement("li");

    function showView() {
      li.innerHTML = "";
      let span = document.createElement("span");
      span.textContent = `${a.name} (${Number(a.preis).toFixed(2)} CHF)`;
      li.appendChild(span);
      let editBtn = document.createElement("button");
      editBtn.textContent = "✏️";
      editBtn.title = "Bearbeiten";
      editBtn.onclick = () => showEdit();
      let delBtn = document.createElement("button");
      delBtn.textContent = "🗑";
      delBtn.title = "Löschen";
      delBtn.onclick = () => { artikel.splice(i, 1); saveArtikel(artikel); renderArtikel(); renderArtikelDropdown(); }
      li.append(editBtn, delBtn);
    }

    function showEdit() {
      li.innerHTML = "";
      let nameInput = document.createElement("input");
      nameInput.value = a.name;
      nameInput.style.width = "100px";
      let preisInput = document.createElement("input");
      preisInput.type = "number";
      preisInput.step = "0.01";
      preisInput.value = a.preis;
      preisInput.style.width = "70px";
      let saveBtn = document.createElement("button");
      saveBtn.textContent = "💾";
      saveBtn.title = "Speichern";
      saveBtn.onclick = () => {
        a.name = nameInput.value.trim();
        a.preis = parseFloat(preisInput.value) || 0;
        saveArtikel(artikel); renderArtikel(); renderArtikelDropdown();
      };
      li.append(nameInput, preisInput, saveBtn);
    }

    showView();
    list.append(li);
  });
  renderArtikelDropdown();
}
$("#art_save")?.addEventListener("click", () => {
  let name = $("#art_name").value.trim();
  let preis = parseFloat($("#art_preis").value.replace(",", "."));
  if(name && !isNaN(preis)) {
    artikel.push({ name, preis }); saveArtikel(artikel); renderArtikel();
    $("#art_name").value = ""; $("#art_preis").value = "";
  }
});
renderArtikel();

// === Dropdown für Artikelpositionen
function renderArtikelDropdown() {
  let sel = $("#artikel_select");
  if (!sel) return;
  sel.innerHTML = "";
  artikel.forEach((a, i) => {
    let o = document.createElement("option");
    o.value = i;
    o.textContent = `${a.name} (${Number(a.preis).toFixed(2)} CHF)`;
    sel.append(o);
  });
}

// === Empfänger Select
function renderEmpfaenger() {
  let sel = $("#empfaenger");
  if (!sel) return;
  sel.innerHTML = "";
  kunden.forEach((k, i) => {
    let o = document.createElement("option");
    o.value = i;
    o.textContent = k.split("\n")[0] + (k.split("\n").length > 1 ? " ..." : "");
    sel.append(o);
  });
}
renderEmpfaenger();

// === Positionen-Rendering
function renderPositionen() {
  let area = $("#pos_area");
  if (!area) return;
  area.innerHTML = "";
  if(positionen.length == 0) return;
  let tbl = document.createElement("table");
  tbl.className = "tbl";
  tbl.innerHTML = `<tr><th>Beschreibung</th><th>Menge</th><th>Preis</th><th></th></tr>`;
  positionen.forEach((p, i) => {
    let tr = document.createElement("tr");
    tr.innerHTML = `<td>${p.name}</td>
      <td class="center">${p.menge}</td>
      <td class="right">${Number(p.preis).toFixed(2)} CHF</td>
      <td class="center"><button type="button">🗑</button></td>`;
    tr.querySelector("button").onclick = () => { positionen.splice(i, 1); renderPositionen(); }
    tbl.append(tr);
  });
  area.append(tbl);
}
$("#add_pos")?.addEventListener("click", () => {
  if(artikel.length == 0) { alert("Bitte zuerst einen Artikel erfassen."); return; }
  let idx = Number($("#artikel_select").value);
  let a = artikel[idx];
  let menge = Number($("#menge").value) || 1;
  positionen.push({ name: a.name, menge, preis: a.preis });
  renderPositionen();
});
renderPositionen();

// === Rechnungsnummer, Fusszeile, Frist
$("#fusszeile") && ($("#fusszeile").value = fuss);
$("#fusszeile") && ($("#fusszeile").oninput = e => { fuss = e.target.value; ls.setItem("ng_fuss", fuss); });
$("#rechnr") && ($("#rechnr").value = generateNextRechnungsnummer());
$("#frist") && ($("#frist").value = 30);

// === Automatische Rechnungsnummer
function generateNextRechnungsnummer() {
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const prefix = `20${today.slice(2)}`; // z.B. 20250701
  let last = ls.getItem("ng_last_rechnr") || "";

  if (last.startsWith(prefix)) {
    let num = parseInt(last.split("-")[1] || "0", 10) + 1;
    return `${prefix}-${String(num).padStart(3, '0')}`;
  } else {
    return `${prefix}-001`;
  }
}

// === PDF-Export: Hilfsfunktion für PNGs aus img-Tag (Canvas to DataURL)
async function addImageToPDF(doc, imgId, x, y, w, h) {
  return new Promise(resolve => {
    let img = document.getElementById(imgId);
    if (!img) { resolve(); return; }
    let canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    let ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    let dataURL = canvas.toDataURL('image/png');
    doc.addImage(dataURL, 'PNG', x, y, w, h);
    resolve();
  });
}

// === SVG-Vorlage laden und mit Daten füllen ===
async function generateQRBillSVG(invoiceData) {
  return new Promise(async (resolve, reject) => {
    try {
      // SVG-Vorlage laden
      const response = await fetch('qr-rechnung-vorlage.svg');
      if (!response.ok) {
        throw new Error(`SVG-Vorlage konnte nicht geladen werden: ${response.status}`);
      }
      let svgText = await response.text();
      
      // Daten extrahieren
      const { iban, qrReference, total, customer, invoiceNumber, qrImageData } = invoiceData;
      
      // IBAN formatieren (4er-Blöcke)
      const formattedIban = iban.replace(/(.{4})/g, '$1 ').trim();
      
      // QR-Referenz formatieren (2 + 5x5 Blöcke)
      const formattedRef = qrReference.substring(0, 2) + ' ' + 
                           qrReference.substring(2).match(/.{1,5}/g).join(' ');
      
      // Betrag formatieren (mit Tausendertrennzeichen)
      const formattedAmount = total.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
      
      // Kundenadresse extrahieren (für "Zahlbar durch" Feld)
      const customerLines = customer ? customer.split('\n').filter(l => l.trim()) : [];
      const customerName = customerLines[0] || '';
      const customerAddress = customerLines.slice(1).join(', ') || '';
      
      // 1. IBAN ersetzen (in Empfangsschein und Zahlteil)
      svgText = svgText.replace(/CH31 0631 3429 3319 6450 0/g, formattedIban);
      
      // 2. Zusätzliche Informationen (Rechnungsnummer)
      svgText = svgText.replace(/Auftrag vom 26\.11\.2025/g, `Rechnung ${invoiceNumber}`);
      
      // 3. QR-Code ersetzen (falls vorhanden)
      if (qrImageData && qrImageData.startsWith('data:image')) {
        // Finde das QR-Code SVG-Element und ersetze den Inhalt
        const qrCodeRegex = /<svg id="qr_code_svg"[^>]*>[\s\S]*?<\/svg>/;
        const qrCodeMatch = svgText.match(qrCodeRegex);
        if (qrCodeMatch) {
          // Erstelle ein image-Element mit dem QR-Code
          const qrImg = `<image href="${qrImageData}" x="0mm" y="0mm" width="46mm" height="46mm" preserveAspectRatio="xMidYMid meet"/>`;
          svgText = svgText.replace(qrCodeRegex, `<svg id="qr_code_svg" width="46mm" height="46mm" x="0mm" y="12mm">${qrImg}</svg>`);
        }
      }
      
      // 4. Betrag im Empfangsschein hinzufügen (nach dem Betrag-Feld SVG)
      // Suche nach dem Betrag-Feld SVG im Empfangsschein (x="21.7mm")
      const empfBetragRegex = /(<svg[^>]*x="21\.7mm"[^>]*>[\s\S]*?<\/svg>)/;
      svgText = svgText.replace(empfBetragRegex, (match) => {
        return match + `<text x="22mm" y="70mm" font-size="8pt" font-weight="bold">${formattedAmount}</text>`;
      });
      
      // 5. Betrag im Zahlteil hinzufügen (nach dem Betrag-Feld SVG)
      // Suche nach dem Betrag-Feld SVG im Zahlteil (x="9.7mm")
      const zahlBetragRegex = /(<svg[^>]*x="9\.7mm"[^>]*>[\s\S]*?<\/svg>)/;
      svgText = svgText.replace(zahlBetragRegex, (match) => {
        return match + `<text x="22mm" y="70mm" font-size="10pt" font-weight="bold">${formattedAmount}</text>`;
      });
      
      // 6. Referenz im Empfangsschein hinzufügen (nach "Referenz" Text)
      // Die Referenz fehlt in der Vorlage, füge sie nach dem "Zahlbar durch" Feld hinzu
      // Suche nach dem "Zahlbar durch" Text im Empfangsschein
      const empfRefRegex = /(<text[^>]*>Zahlbar durch \(Name\/Adresse\)<\/text>)/;
      svgText = svgText.replace(empfRefRegex, (match) => {
        return `<text x="0mm" y="42mm" font-size="6pt" font-weight="bold">Referenz</text>
        <text x="0mm" y="45mm" font-size="8pt">${formattedRef}</text>
        ${match}`;
      });
      
      // 7. Referenz im Zahlteil hinzufügen (nach "Konto / Zahlbar an")
      // Suche nach dem letzten tspan im "Konto / Zahlbar an" Block
      const zahlRefRegex = /(<tspan[^>]*>2545 Selzach<\/tspan>)/;
      svgText = svgText.replace(zahlRefRegex, (match) => {
        return match + `<tspan x="51mm" dy="22pt" font-size="8pt" font-weight="bold">Referenz</tspan>
        <tspan x="51mm" dy="11pt" font-size="10pt">${formattedRef}</tspan>`;
      });
      
      // 8. "Zahlbar durch" im Zahlteil mit Kundenadresse füllen (falls vorhanden)
      if (customerName) {
        // Suche nach dem "Zahlbar durch" Feld im Zahlteil und füge Kundenname hinzu
        const zahlbarDurchRegex = /(<text[^>]*>Zahlbar durch \(Name\/Adresse\)<\/text>[\s\S]*?<svg[^>]*x="50\.7mm"[^>]*>[\s\S]*?<\/svg>)/;
        svgText = svgText.replace(zahlbarDurchRegex, (match) => {
          return match + `<text x="51mm" y="62mm" font-size="10pt">${customerName}</text>
          ${customerAddress ? `<text x="51mm" y="65mm" font-size="10pt">${customerAddress}</text>` : ''}`;
        });
      }
      
      resolve(svgText);
    } catch (error) {
      console.error("❌ Fehler beim Generieren der SVG:", error);
      reject(error);
    }
  });
}

// === SVG zu Canvas rendern und als Bild zurückgeben ===
async function renderSVGToImage(svgText, width, height) {
  return new Promise((resolve, reject) => {
    try {
      // SVG als Blob erstellen
      const svgBlob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      
      // Bild erstellen
      const img = new Image();
      img.onload = () => {
        // Canvas erstellen
        const canvas = document.createElement('canvas');
        canvas.width = width || img.width;
        canvas.height = height || img.height;
        const ctx = canvas.getContext('2d');
        
        // Bild auf Canvas zeichnen
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Data URL erstellen
        const dataURL = canvas.toDataURL('image/png');
        
        // Cleanup
        URL.revokeObjectURL(url);
        
        resolve(dataURL);
      };
      
      img.onerror = (error) => {
        URL.revokeObjectURL(url);
        reject(new Error('SVG konnte nicht geladen werden: ' + error));
      };
      
      img.src = url;
    } catch (error) {
      reject(error);
    }
  });
}

// === QR-Rechnung Generator nach Schweizer Standard
function generateQRReference(invoiceNumber) {
  // QR-Referenz muss 27 Stellen haben (2-stellige Prüfziffer + 25-stellige Referenz)
  const cleaned = invoiceNumber.replace(/[^0-9]/g, '').substring(0, 25).padStart(25, '0');
  
  // Modulo 97 Prüfziffer berechnen
  let remainder = 0;
  for (let i = 0; i < cleaned.length; i++) {
    remainder = (remainder * 10 + parseInt(cleaned[i])) % 97;
  }
  const checkDigit = String((98 - remainder) % 97).padStart(2, '0');
  
  return checkDigit + cleaned;
}

function generateQRInvoiceString(invoice, iban, qrReference) {
  const lines = [];
  
  // Header - exakt nach Schweizer QR-Rechnung Standard
  lines.push("SPC"); // QR-Type
  lines.push("0200"); // Version
  lines.push("1"); // Coding Type (1 = UTF-8)
  
  // Account (IBAN) - OHNE Leerzeichen (Pflichtfeld)
  const cleanIban = iban.replace(/\s+/g, '').toUpperCase();
  lines.push(cleanIban);
  
  // Creditor Information (Pflichtfeld - strukturierte Adresse)
  // Minimiert für kürzesten möglichen String (alle Sonderzeichen entfernt)
  lines.push("S"); // Address Type (S = structured)
  lines.push("Noel Guyaz"); // Name (ohne é für kürzeren UTF-8 String)
  lines.push("Bellacherstr4a"); // Strasse minimal (ohne Leerzeichen und Punkt)
  lines.push(""); // Hausnummer (optional)
  lines.push(""); // Zusatzzeile 2 (leer)
  lines.push("2545"); // Nur PLZ (Ort weggelassen für kürzeren String)
  lines.push("CH"); // Land (CH = Schweiz)
  
  // Ultimate Creditor (optional, aber 7 Zeilen müssen vorhanden sein)
  lines.push(""); // Address Type (leer wenn nicht vorhanden)
  lines.push(""); // Name
  lines.push(""); // Strasse
  lines.push(""); // Zusatzzeile 1
  lines.push(""); // Zusatzzeile 2
  lines.push(""); // PLZ und Ort
  lines.push(""); // Land
  
  // Amount (Pflichtfeld wenn > 0)
  const total = invoice.positions.reduce((sum, p) => sum + (p.preis * p.menge), 0);
  lines.push(total > 0 ? total.toFixed(2) : "");
  
  // Currency (Pflichtfeld)
  lines.push("CHF");
  
  // Debtor Information (optional, aber 7 Zeilen müssen vorhanden sein)
  lines.push(""); // Address Type (leer wenn nicht vorhanden)
  lines.push(""); // Name
  lines.push(""); // Strasse
  lines.push(""); // Zusatzzeile 1
  lines.push(""); // Zusatzzeile 2
  lines.push(""); // PLZ und Ort
  lines.push(""); // Land
  
  // Reference Type (Pflichtfeld)
  if (qrReference && qrReference.length === 27) {
    lines.push("QRR"); // QR-Referenz (27 Stellen)
    lines.push(qrReference);
  } else {
    lines.push("NON"); // Keine Referenz
    lines.push("");
  }
  
  // Additional Information (optional)
  // Unstrukturierte Mitteilung (Ustrd) - optional, minimal
  // Leer lassen für kürzesten String (optional laut Spezifikation)
  lines.push("");
  
  // Trailer (MANDATORY!) - End Payment Data
  lines.push("EPD");
  
  // Rechnungsinformationen (StrdBkgInf) - optional, Status A
  // Wird weggelassen (Status A - kann entfallen)
  
  // Alternative Procedures (optional, Status A - können weggelassen werden)
  // Werden nicht geliefert wenn nicht verwendet
  
  return lines.join("\n");
}

async function generateQRCodeImage(qrString) {
  return new Promise((resolve) => {
    try {
      console.log("🔄 Generiere QR-Code...");
      console.log("QR-String Länge:", qrString.length, "Zeichen");
      
      // Prüfe String-Länge in Bytes (UTF-8)
      const stringBytes = new TextEncoder().encode(qrString).length;
      console.log(`📏 QR-String: ${qrString.length} Zeichen, ${stringBytes} Bytes (UTF-8)`);
      console.log("QR-String Inhalt:", qrString.substring(0, 200));
      
      if (stringBytes > 1400) {
        console.warn(`⚠️ String ist sehr lang (${stringBytes} Bytes). Maximal ~1456 Bytes bei Level M.`);
        console.warn("⚠️ Versuche String weiter zu kürzen...");
      }
      
      // Prüfe QRCode-Bibliothek
      if (typeof QRCode === 'undefined') {
        console.error("❌ QRCode Bibliothek nicht geladen");
        resolve(null);
        return;
      }
      
      console.log("✅ QRCode Bibliothek gefunden");
      
      // QRCode.js erstellt ein div mit img oder canvas darin
      const qrDiv = document.createElement('div');
      qrDiv.style.display = 'none';
      qrDiv.style.position = 'absolute';
      qrDiv.style.left = '-9999px';
      qrDiv.style.width = '400px';
      qrDiv.style.height = '400px';
      document.body.appendChild(qrDiv);
      
      // Fehlerkorrekturstufe M (MANDATORY laut Spezifikation Kapitel 6.1)
      // M = ca. 15% Fehlerkorrektur
      console.log("🔄 Generiere QR-Code mit Fehlerkorrekturstufe M (gemäss Spezifikation)...");
      
      try {
        // Leere div
        qrDiv.innerHTML = '';
        
        // Erstelle QRCode-Instanz mit Level M (wie in Spezifikation vorgeschrieben)
        const qrcode = new QRCode(qrDiv, {
          text: qrString,
          width: 400,
          height: 400,
          colorDark: '#000000',
          colorLight: '#FFFFFF',
          correctLevel: QRCode.CorrectLevel.M // MANDATORY: Level M
        });
        
        // Warte auf Rendering
        setTimeout(() => {
          const img = qrDiv.querySelector('img');
          const canvas = qrDiv.querySelector('canvas');
          
          if (img) {
            console.log("✅ QR-Code erfolgreich generiert mit Level M (IMG)");
            // Konvertiere img zu dataURL
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = 400;
            tempCanvas.height = 400;
            const ctx = tempCanvas.getContext('2d');
            
            if (img.complete) {
              ctx.drawImage(img, 0, 0);
              const dataURL = tempCanvas.toDataURL('image/png');
              if (qrDiv.parentNode) {
                document.body.removeChild(qrDiv);
              }
              resolve(dataURL);
            } else {
              img.onload = () => {
                ctx.drawImage(img, 0, 0);
                const dataURL = tempCanvas.toDataURL('image/png');
                if (qrDiv.parentNode) {
                  document.body.removeChild(qrDiv);
                }
                resolve(dataURL);
              };
              img.onerror = () => {
                console.error("❌ QR-Code IMG Fehler");
                if (qrDiv.parentNode) {
                  document.body.removeChild(qrDiv);
                }
                resolve(null);
              };
            }
          } else if (canvas) {
            console.log("✅ QR-Code erfolgreich generiert mit Level M (Canvas)");
            const dataURL = canvas.toDataURL('image/png');
            if (qrDiv.parentNode) {
              document.body.removeChild(qrDiv);
            }
            resolve(dataURL);
          } else {
            // Noch nicht gerendert, warte länger
            setTimeout(() => {
              const img2 = qrDiv.querySelector('img');
              const canvas2 = qrDiv.querySelector('canvas');
              if (img2) {
                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = 400;
                tempCanvas.height = 400;
                const ctx = tempCanvas.getContext('2d');
                ctx.drawImage(img2, 0, 0);
                const dataURL = tempCanvas.toDataURL('image/png');
                if (qrDiv.parentNode) {
                  document.body.removeChild(qrDiv);
                }
                resolve(dataURL);
              } else if (canvas2) {
                const dataURL = canvas2.toDataURL('image/png');
                if (qrDiv.parentNode) {
                  document.body.removeChild(qrDiv);
                }
                resolve(dataURL);
              } else {
                console.error("❌ QR-Code konnte nicht gerendert werden");
                if (qrDiv.parentNode) {
                  document.body.removeChild(qrDiv);
                }
                resolve(null);
              }
            }, 1000);
          }
        }, 500);
        
      } catch (error) {
        console.error("❌ QR-Code Generierung fehlgeschlagen:", error.message);
        if (qrDiv.parentNode) {
          document.body.removeChild(qrDiv);
        }
        resolve(null);
      }
      
      // Timeout nach 10 Sekunden
      setTimeout(() => {
        if (qrDiv.parentNode) {
          console.error("❌ QR-Code Generierung Timeout");
          document.body.removeChild(qrDiv);
          resolve(null);
        }
      }, 10000);
      
    } catch (error) {
      console.error("❌ QR-Code Generierung fehlgeschlagen:", error);
      resolve(null);
    }
  });
}

// === PDF-Generierung nach Schweizer Vorlage ===
$("#makepdf")?.addEventListener("click", async () => {
  if(kunden.length == 0) { alert("Bitte Empfänger auswählen."); return; }
  const pdfIban = loadIBAN();
  if (!pdfIban || pdfIban.trim().length === 0) {
    if (!confirm("Keine IBAN eingegeben. QR-Rechnung wird nicht generiert. Trotzdem fortfahren?")) {
      return;
    }
  }
  let empfaenger = kunden[$("#empfaenger").value];
  let pos = positionen.length ? positionen : [{ name: artikel[0]?.name || "Position", menge: 1, preis: artikel[0]?.preis || 0 }];
  let frist = $("#frist").value;
  let rechnr = $("#rechnr").value.trim() || "2024-001";
  ls.setItem("ng_last_rechnr", rechnr);
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  // 1. Logo oben links
  await addImageToPDF(doc, 'logoimg', 16, 12, 28, 28);

  // 2. Positionen für Empfänger und Adresse zuerst deklarieren!
  let empf_x = 110, empf_y = 58, empf_ls = 6;
  let adr_x = 16, adr_y = empf_y, adr_ls = 6;

  // 3. Adresse links, beginnend auf selber Höhe wie Empfänger
  doc.setFontSize(11).setFont("helvetica", "normal");
  doc.text("Noël Guyaz", adr_x, adr_y);
  doc.text("Bellacherstrasse 4a", adr_x, adr_y + adr_ls);
  doc.text("2545 Selzach", adr_x, adr_y + 2 * adr_ls);

  // 4. Absender oben rechts, unterstrichen
  const absText = "Abs. Noël Guyaz, Bellacherstrasse 4a, 2545 Selzach";
  doc.setFontSize(8).setFont("helvetica", "italic");
  const abs_x = 110, abs_y = 50;
  doc.text(absText, abs_x, abs_y);
  const absWidth = doc.getTextWidth(absText);
  doc.setLineWidth(0.2);
  doc.line(abs_x, abs_y + 1.2, abs_x + absWidth, abs_y + 1.2);

  // 5. Empfängerblock (mehrzeilig, neutral)
  let empf = empfaenger.split("\n");
  doc.setFont("helvetica", "normal").setFontSize(11);
  empf.forEach((l, i) => doc.text(l, empf_x, empf_y + i * empf_ls));
  let empf_block_end_y = empf_y + empf_ls * empf.length;

  // 6. Titel "Rechnung"
  let titel_y = empf_block_end_y + 15;
  doc.setFont("helvetica", "bold").setFontSize(18);
  doc.text("Rechnung", 16, titel_y);

  // 7. Rechnungsnummer & Frist
  let fristen_y = titel_y + 13;
  doc.setFont("helvetica", "normal").setFontSize(13);
  doc.text(`Rechnungsnummer: ${rechnr}`, 16, fristen_y);
  doc.text(`Zahlungsfrist: ${frist} Tage`, 16, fristen_y + 8);

  // 8. Tabelle
  let tab_y = fristen_y + 18;
  doc.setFont("helvetica", "bold").setFontSize(13);
  doc.text("Beschreibung", 16, tab_y);
  doc.text("Menge", 98, tab_y);
  doc.text("Preis", 198, tab_y, { align: "right" });
  // Tabellenlinie unter Überschrift
  let table_start_y = tab_y + 2;
  doc.setLineWidth(0.3);
  doc.line(16, table_start_y, 200, table_start_y);
  let row_y = table_start_y + 7;
  doc.setFont("helvetica", "normal").setFontSize(12);
  let total = 0;
  pos.forEach(p => {
    doc.text(p.name, 16, row_y);
    doc.text(String(p.menge), 105, row_y, { align: "right" });
    doc.text(Number(p.preis).toFixed(2) + " CHF", 198, row_y, { align: "right" });
    row_y += 7;
    total += Number(p.preis) * Number(p.menge);
  });
  // Tabellenlinie unter den Positionen, aber NICHT ins Total!
  doc.line(16, row_y - 3, 200, row_y - 3);
  // Total-Block darunter
  row_y += 2;
  doc.setFont("helvetica", "bold");
  doc.text("Total:", 98, row_y); // jetzt linksbündig unter "Menge"
  doc.text(total.toFixed(2) + " CHF", 198, row_y, { align: "right" });

  // 9. Fusszeile
  let fussY = 180;
  doc.setFont("helvetica", "normal").setFontSize(10);
  doc.text(fuss, 16, fussY, { maxWidth: 175 });

  // Zahlteil wird weggelassen - kann auf qr-rechnung.net hinzugefügt werden

  doc.save(`Rechnung-${rechnr}.pdf`);
  $("#status").textContent = "PDF erstellt!";
setTimeout(() => {
  $("#status").textContent = "";
}, 5000);
}); // ← diese Klammer war bisher vergessen!

// === Automatische Sicherung beim Verlassen der Seite
window.addEventListener("beforeunload", () => {
  saveKunden(kunden);
  saveArtikel(artikel);
  ls.setItem("ng_fuss", fuss);
  const rechnr = $("#rechnr")?.value;
  if (rechnr) ls.setItem("ng_last_rechnr", rechnr);
});
