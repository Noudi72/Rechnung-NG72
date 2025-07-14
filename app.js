// === Button: Neue Rechnung starten einfügen
const neuerBtn = document.createElement("button");
neuerBtn.textContent = "Neue Rechnung starten";
neuerBtn.type = "button";
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
backupBtn.type = "button";
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
restoreBtn.type = "button";
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
vorschauBtn.type = "button";
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
  let fussY = 190;
  doc.setFont("helvetica", "normal").setFontSize(10);
  doc.text(fuss, 16, fussY, { maxWidth: 175 });
  await addImageToPDF(doc, 'zahlteilimg', 1, 200, 209, 93);

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

const $ = sel => document.querySelector(sel);

let kunden = loadKunden();
let artikel = loadArtikel();
let positionen = [];
let fuss = ls.getItem("ng_fuss") || "Kein MWST-Ausweis, da nicht mehrwertsteuerpflichtig gemäss Art. 10 MWSTG. Vielen Dank für Ihr Vertrauen! Kontakt: n.guyaz@icloud.com / +41 79 414 42 049";

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
      editBtn.type = "button";
      editBtn.onclick = () => showEdit();
      let delBtn = document.createElement("button");
      delBtn.textContent = "🗑";
      delBtn.type = "button";
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
      saveBtn.type = "button";
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
      editBtn.type = "button";
      editBtn.onclick = () => showEdit();
      let delBtn = document.createElement("button");
      delBtn.textContent = "🗑";
      delBtn.type = "button";
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
      saveBtn.type = "button";
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

// === PDF-Generierung nach Schweizer Vorlage ===
$("#makepdf")?.addEventListener("click", async () => {
  if(kunden.length == 0) { alert("Bitte Empfänger auswählen."); return; }
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

  // 9. Fusszeile – deutlich höher für Zahlteil
  let fussY = 190;
  doc.setFont("helvetica", "normal").setFontSize(10);
  doc.text(fuss, 16, fussY, { maxWidth: 175 });

  // 10. QR-Zahlteil GANZ UNTEN, volle Breite und mehr Höhe (Beispiel: 210mm x 100mm)
  await addImageToPDF(doc, 'zahlteilimg', 1, 200, 209, 93);

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
