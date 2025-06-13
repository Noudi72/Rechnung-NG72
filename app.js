// === Lokale Speicherung
const ls = window.localStorage;

function loadKunden() {
  return JSON.parse(ls.getItem("ng_kunden") || "[]");
}
function saveKunden(arr) {
  ls.setItem("ng_kunden", JSON.stringify(arr));
}
function loadArtikel() {
  return JSON.parse(ls.getItem("ng_artikel") || "[]");
}
function saveArtikel(arr) {
  ls.setItem("ng_artikel", JSON.stringify(arr));
}

// === DOM Helper
const $ = sel => document.querySelector(sel);
const $$ = sel => document.querySelectorAll(sel);

// === State
let kunden = loadKunden();
let artikel = loadArtikel();
let positionen = [];
let fuss = ls.getItem("ng_fuss") || "Zahlbar innert 30 Tagen. Kein MWST-Ausweis, da nicht mehrwertsteuerpflichtig gemäss Art. 10 MWSTG. Vielen Dank für Ihr Vertrauen! Kontakt: n.guyaz@icloud.com / +41 79 414 42 049";
let absender = "Noël Guyaz\nBellacherstrasse 4a\n2545 Selzach";
let logo = "logo.png";

// === Kunden-UI
function renderKunden() {
  // Liste
  let list = $("#kunden_list");
  list.innerHTML = "";
  kunden.forEach((k, i) => {
    let li = document.createElement("li");
    li.textContent = k.replace(/\n/g, ", ");
    let btn = document.createElement("button");
    btn.textContent = "🗑";
    btn.onclick = () => { kunden.splice(i, 1); saveKunden(kunden); renderKunden(); renderEmpfaenger(); }
    li.append(btn);
    list.append(li);
  });
}
$("#kunde_save").onclick = () => {
  let val = $("#kunde_input").value.trim();
  if(val && !kunden.includes(val)) {
    kunden.push(val);
    saveKunden(kunden);
    renderKunden();
    renderEmpfaenger();
    $("#kunde_input").value = "";
  }
};
renderKunden();

// === Artikel-UI
function renderArtikel() {
  let list = $("#artikel_list");
  list.innerHTML = "";
  artikel.forEach((a, i) => {
    let li = document.createElement("li");
    li.textContent = `${a.name} (${Number(a.preis).toFixed(2)} CHF)`;
    let btn = document.createElement("button");
    btn.textContent = "🗑";
    btn.onclick = () => { artikel.splice(i, 1); saveArtikel(artikel); renderArtikel(); }
    li.append(btn);
    list.append(li);
  });
}
$("#art_save").onclick = () => {
  let name = $("#art_name").value.trim();
  let preis = parseFloat($("#art_preis").value.replace(",", "."));
  if(name && !isNaN(preis)) {
    artikel.push({ name, preis });
    saveArtikel(artikel);
    renderArtikel();
    $("#art_name").value = ""; $("#art_preis").value = "";
  }
};
renderArtikel();

// === Empfänger Select
function renderEmpfaenger() {
  let sel = $("#empfaenger");
  sel.innerHTML = "";
  kunden.forEach((k, i) => {
    let o = document.createElement("option");
    o.value = i;
    o.textContent = k.split("\n").join(", ");
    sel.append(o);
  });
}
renderEmpfaenger();

// === Positionen
function renderPositionen() {
  let area = $("#pos_area");
  area.innerHTML = "";
  let tbl = document.createElement("table");
  tbl.className = "pos-tbl";
  tbl.innerHTML = `<tr><th>Beschreibung</th><th>Menge</th><th>Preis</th><th></th></tr>`;
  positionen.forEach((p, i) => {
    let tr = document.createElement("tr");
    tr.innerHTML = `<td>${p.name}</td>
      <td class="center">${p.menge}</td>
      <td class="right">${Number(p.preis).toFixed(2)} CHF</td>
      <td><button type="button">🗑</button></td>`;
    tr.querySelector("button").onclick = () => { positionen.splice(i, 1); renderPositionen(); }
    tbl.append(tr);
  });
  area.append(tbl);
}
$("#add_pos").onclick = () => {
  if(artikel.length == 0) { alert("Bitte zuerst einen Artikel erfassen."); return; }
  let a = artikel[0];
  positionen.push({ name: a.name, menge: 1, preis: a.preis });
  renderPositionen();
};
renderPositionen();

// === Rechnungsnummer, Fusszeile, Frist
$("#fusszeile").value = fuss;
$("#fusszeile").oninput = e => { fuss = e.target.value; ls.setItem("ng_fuss", fuss); }

// === PDF-Generierung
$("#makepdf").onclick = () => {
  if(kunden.length == 0) { alert("Bitte Empfänger auswählen."); return; }
  let empfaenger = kunden[$("#empfaenger").value];
  let pos = positionen.length ? positionen : [{ name: artikel[0]?.name || "Position", menge: 1, preis: artikel[0]?.preis || 0 }];
  let frist = $("#frist").value;
  let rechnr = $("#rechnr").value.trim() || "2024-001";
  // PDF
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  let y = 20;
  // Logo
  let img = new Image();
  img.onload = function() {
    doc.addImage(img, "PNG", 18, 10, 34, 22);
    drawPDF();
  }
  img.onerror = function() { drawPDF(); }
  img.src = logo;

  function drawPDF() {
    // Absender links oben
    doc.setFontSize(11).setFont("helvetica","normal");
    doc.text(absender, 18, y+20);
    // Absender rechts oben unterstrichen
    doc.setFontSize(9).setFont("helvetica","italic");
    doc.textWithLink("Abs. Noël Guyaz, Bellacherstrasse 4a, 2545 Selzach", 145, y+11, { url: "" });
    doc.line(145, y+12, 200, y+12); // underline

    // Empfänger rechts, 2-3 Zeilen
    doc.setFont("helvetica","bold").setFontSize(13);
    let empf = empfaenger.split("\n");
    empf.forEach((l, i) => doc.text(l, 145, y+20 + i*6));
    y += Math.max(empf.length * 6, 26) + 12;

    // Rechnung
    doc.setFont("helvetica","bold").setFontSize(22);
    doc.text("Rechnung", 18, y);
    y += 10;
    doc.setFont("helvetica","normal").setFontSize(13);
    doc.text(`Rechnungsnummer: ${rechnr}`, 18, y);
    y += 10;
    doc.text(`Zahlungsfrist: ${frist} Tage`, 18, y);
    y += 10;
    // Positionen Tabelle
    doc.setFont("helvetica","bold").setFontSize(13);
    doc.text("Beschreibung", 18, y);
    doc.text("Menge", 98, y);
    doc.text("Preis", 158, y);
    y += 2; doc.line(18, y, 200, y); y += 7;
    doc.setFont("helvetica","normal").setFontSize(12);
    let total = 0;
    pos.forEach(p => {
      doc.text(p.name, 18, y);
      doc.text(String(p.menge), 98, y, { align: "right" });
      doc.text(Number(p.preis).toFixed(2)+" CHF", 198, y, { align: "right" });
      y += 7;
      total += Number(p.preis) * Number(p.menge);
    });
    y += 2;
    doc.setFont("helvetica","bold");
    doc.text("Total:", 98, y, { align: "right" });
    doc.text(total.toFixed(2)+" CHF", 198, y, { align: "right" });

    // Fusszeile
    doc.setFont("helvetica","normal").setFontSize(10);
    doc.text(fuss, 18, 287, { maxWidth: 175 });

    doc.save(`Rechnung-${rechnr}.pdf`);
    $("#status").textContent = "PDF erstellt!";
  }
};