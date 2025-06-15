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
$("#rechnr") && ($("#rechnr").value = `20${(new Date()).toISOString().slice(2,10).replace(/-/g,'')}-001`);
$("#frist") && ($("#frist").value = 30);

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
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  // 1. Logo und Adresse
  await addImageToPDF(doc, 'logoimg', 16, 10, 36, 36); // Logo schön hoch
  let adr_x = 16, adr_y = 49, adr_ls = 6;
  doc.setFontSize(11).setFont("helvetica", "normal");
  doc.text("Noël Guyaz", adr_x, adr_y);
  doc.text("Bellacherstrasse 4a", adr_x, adr_y + adr_ls);
  doc.text("2545 Selzach", adr_x, adr_y + 2 * adr_ls);

  // 2. Absender (klein, unterstrichen, rechts oben)
  doc.setFontSize(8).setFont("helvetica", "italic");
  doc.text("Abs. Noël Guyaz, Bellacherstrasse 4a, 2545 Selzach", 110, 41);
  doc.setLineWidth(0.2);
  doc.line(110, 42.2, 200, 42.2);

  // 3. Empfänger-Block (mehrzeilig, neutral)
  let empf = empfaenger.split("\n");
  let empf_x = 110, empf_y = 47, empf_ls = 6;
  doc.setFont("helvetica", "normal").setFontSize(11);
  empf.forEach((l, i) => doc.text(l, empf_x, empf_y + i * empf_ls));
  let empf_block_end_y = empf_y + empf_ls * empf.length;

  // 4. Titel "Rechnung"
  let titel_y = empf_block_end_y + 15;
  doc.setFont("helvetica", "bold").setFontSize(22);
  doc.text("Rechnung", 16, titel_y);

  // 5. Rechnungsnummer & Frist
  let fristen_y = titel_y + 13;
  doc.setFont("helvetica", "normal").setFontSize(13);
  doc.text(`Rechnungsnummer: ${rechnr}`, 16, fristen_y);
  doc.text(`Zahlungsfrist: ${frist} Tage`, 16, fristen_y + 8);

  // 6. Tabelle mit mehr Abstand nach unten
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
    doc.text(String(p.menge), 98, row_y, { align: "right" });
    doc.text(Number(p.preis).toFixed(2) + " CHF", 198, row_y, { align: "right" });
    row_y += 7;
    total += Number(p.preis) * Number(p.menge);
  });
  // Tabellenlinie UNTER den Positionen, aber NICHT ins Total!
  doc.line(16, row_y - 3, 200, row_y - 3);
  // Total-Block darunter
  row_y += 2;
  doc.setFont("helvetica", "bold");
  doc.text("Total:", 98, row_y, { align: "right" });
  doc.text(total.toFixed(2) + " CHF", 198, row_y, { align: "right" });

  // 7. Fusszeile – garantiert hoch genug!
  let fussY = 240;
  doc.setFont("helvetica", "normal").setFontSize(10);
  doc.text(fuss, 16, fussY, { maxWidth: 175 });

  // 8. QR-Zahlteil (PNG) GANZ UNTEN – Höhe max. 32mm
  await addImageToPDF(doc, 'zahlteilimg', 10, 500, 190, 90);

  doc.save(`Rechnung-${rechnr}.pdf`);
  $("#status").textContent = "PDF erstellt!";
});