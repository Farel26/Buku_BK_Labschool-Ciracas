/* Logika game Buku BK Kelas 7 SMP Labschool Ciracas.
   Setiap halaman bab menetapkan window.BAB (misalnya "teman") sebelum file ini dimuat.
   Jawaban refleksi dan skor kuis dikirim ke Google Spreadsheet lewat Google Apps Script
   (alamatnya diisi di config.js). */
(function () {
  "use strict";
  var L = "ABCDE";
  var CFG = window.BK_CONFIG || {};
  var URL_OK = /^https:\/\/script\.google\.com\/macros\/s\/.+\/exec$/.test(CFG.SCRIPT_URL || "");
  var KEY = window.BAB;
  var $ = function (id) { return document.getElementById(id); };
  var deck = [], i = 0, done = 0, jawaban = [];

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function show(s, diam) {
    ["identitas", "menu", "play", "end", "kuis"].forEach(function (x) { var el = $(x); if (el) el.hidden = x !== s; });
    if (diam) return;
    var pg = $("main-di-sini");
    if (pg) pg.scrollIntoView({ block: "start", behavior: "smooth" }); else window.scrollTo(0, 0);
  }
  function shuffle(a) { a = a.slice(); for (var k = a.length - 1; k > 0; k--) { var j = Math.floor(Math.random() * (k + 1)); var t = a[k]; a[k] = a[j]; a[j] = t; } return a; }

  /* ---------- identitas siswa (diingat di perangkat ini saja) ---------- */
  function getSiswa() { try { return JSON.parse(localStorage.getItem("bk_siswa") || "null"); } catch (e) { return null; } }
  function setSiswa(s) { try { localStorage.setItem("bk_siswa", JSON.stringify(s)); } catch (e) { } window._siswa = s; }
  function siswa() { return window._siswa || getSiswa(); }
  function renderWho() {
    var s = siswa(); if (!s) return;
    document.querySelectorAll(".whoName").forEach(function (el) { el.textContent = s.nama + " · " + s.kelas + (s.absen ? " · No. " + s.absen : ""); });
  }

  /* ---------- kirim ke Google Spreadsheet ---------- */
  function kirim(payload, statusEl) {
    var s = siswa();
    payload.nama = s.nama; payload.kelas = s.kelas; payload.absen = s.absen || "";
    payload.bab = window.DECKS[KEY].b + " · " + window.DECKS[KEY].n; payload.babKey = KEY;
    if (!URL_OK) { statusEl.className = "status no"; statusEl.textContent = "Belum terhubung ke spreadsheet guru BK. Jawabanmu tidak terkirim."; return; }
    statusEl.className = "status wait"; statusEl.textContent = "Mengirim ke guru BK…";
    fetch(CFG.SCRIPT_URL, { method: "POST", body: JSON.stringify(payload) })
      .then(function (r) { return r.json(); })
      .then(function (res) {
        if (res && res.ok) { statusEl.className = "status ok"; statusEl.textContent = "Terkirim ke guru BK. Terima kasih!"; }
        else throw new Error(res && res.error || "gagal");
      })
      .catch(function () {
        statusEl.className = "status no";
        statusEl.innerHTML = "Gagal mengirim. Cek internetmu, lalu <button class='linkbtn' type='button'>coba kirim lagi</button>.";
        statusEl.querySelector("button").onclick = function () { kirim(payload, statusEl); };
      });
  }

  /* ---------- beranda ---------- */
  function beranda() {
    $("cats").innerHTML = Object.keys(window.DECKS).map(function (k) {
      var D = window.DECKS[k];
      return '<a class="cat" href="' + k + '.html"><small>' + D.b + "</small><b>" + D.e + " " + D.n + "</b><span>" + D.d + "</span></a>";
    }).join("");
  }

  /* ---------- halaman bab ---------- */
  function mulai() {
    var D = window.DECKS[KEY];
    document.title = D.n + " · Buku BK Kelas 7";
    
    $("refInfo").textContent = D.c.length + " kartu tanya & tantangan untuk mengenal dirimu. Tidak ada jawaban benar atau salah.";
    if (!URL_OK) document.querySelectorAll(".cfgwarn").forEach(function (el) { el.hidden = false; });
    var s = getSiswa();
    if (s) { window._siswa = s; renderWho(); show("menu", true); } else show("identitas", true);
  }
  function simpanIdentitas(e) {
    e.preventDefault();
    var nama = $("fNama").value.trim(), kelas = $("fKelas").value.trim().toUpperCase(), absen = $("fAbsen").value.trim();
    if (nama.length < 3) { $("fErr").textContent = "Tulis nama lengkapmu (minimal 3 huruf)."; return; }
    if (!/^7/.test(kelas)) { $("fErr").textContent = "Tulis kelasmu, misalnya 7A."; return; }
    setSiswa({ nama: nama, kelas: kelas, absen: absen }); renderWho(); show("menu");
  }
  function gantiNama() { var s = siswa() || {}; $("fNama").value = s.nama || ""; $("fKelas").value = s.kelas || ""; $("fAbsen").value = s.absen || ""; show("identitas"); }

  /* refleksi */
  function startRef() { deck = shuffle(window.DECKS[KEY].c); i = 0; done = 0; jawaban = []; show("play"); card(); }
  function card() {
    if (i >= deck.length) return finish();
    var c = deck[i], D = window.DECKS[KEY];
    $("tag").textContent = D.b + " · " + (c[0] === "Tanya" ? "Kartu tanya" : "Kartu tantangan");
    $("q").textContent = c[1]; $("ans").value = "";
    $("prog").textContent = "Kartu " + (i + 1) + " dari " + deck.length;
    $("fill").style.width = (i / deck.length * 100) + "%";
  }
  function selesaiKartu(skip) {
    var c = deck[i];
    if (!skip) { done++; jawaban.push({ jenis: c[0], pertanyaan: c[1], jawaban: $("ans").value.trim() || "(direfleksikan tanpa tulisan)" }); }
    i++; card();
  }
  function finish() {
    $("fill").style.width = "100%";
    var r = done / deck.length;
    
    $("endt").textContent = done + " dari " + deck.length + " kartu sudah kamu refleksikan";
    $("endp").textContent = r >= .8 ? "Hebat! Mengenal diri sendiri adalah langkah awal yang penting." : "Setiap kartu yang kamu renungkan sudah berarti. Kamu bisa mengulangnya kapan saja.";
    show("end");
    var st = $("refStatus");
    if (jawaban.length) kirim({ jenis: "refleksi", jumlahKartu: deck.length, jawaban: jawaban }, st);
    else { st.className = "status wait"; st.textContent = "Tidak ada kartu yang dikirim karena semuanya dilewati."; }
  }

  /* kuis */
  function kuis() {
    var K = window.KUIS[KEY], h = '<div class="game"><h3>Game 1 · Menjodohkan</h3><p class="howto">Pilih huruf pasangan yang tepat untuk setiap istilah.</p>';
    K.jodoh.forEach(function (t, n) {
      h += '<div class="pair" id="jp' + n + '"><b>' + (n + 1) + ". " + esc(t) + '</b><select id="j' + n + '" aria-label="Pasangan untuk ' + esc(t) + '"><option value="">–</option>' + L.split("").map(function (x) { return "<option>" + x + "</option>"; }).join("") + "</select></div>";
    });
    h += '<div class="opts">' + K.kanan.map(function (x, j) { return "<div><b>" + L[j] + ".</b> " + esc(x[0]) + "</div>"; }).join("") + '</div><div id="jfb"></div></div>';
    h += '<div class="game"><h3>Game 2 · Benar atau Salah</h3><p class="howto">Tekan B kalau pernyataannya benar, S kalau salah.</p>';
    K.bs.forEach(function (s, n) {
      h += '<div class="bs" id="bp' + n + '"><span>' + (n + 1) + ". " + esc(s[0]) + '</span><div class="seg" role="group" aria-label="Pernyataan ' + (n + 1) + '"><button type="button" data-b="' + n + '" data-v="1" aria-pressed="false">B</button><button type="button" data-b="' + n + '" data-v="0" aria-pressed="false">S</button></div></div><div id="bfb' + n + '"></div>';
    });
    h += '</div><div class="game"><h3>Game 3 · Pilih Semua yang Benar</h3><p class="howto">Jawaban benar bisa lebih dari satu. Poin didapat kalau semua pilihanmu tepat.</p>';
    K.mcma.forEach(function (q, n) {
      h += '<div class="mc" id="mp' + n + '"><p>' + (n + 1) + ". " + esc(q[0]) + "</p>" + q[1].map(function (o, j) { return '<label><input type="checkbox" id="m' + n + "_" + j + '"> <span><b>' + L[j] + ".</b> " + esc(o[0]) + "</span></label>"; }).join("") + '<div id="mfb' + n + '"></div></div>';
    });
    $("kbody").innerHTML = h + "</div>";
    $("kscore").textContent = "Jawab semua soal, lalu periksa."; $("kStatus").className = ""; $("kStatus").textContent = "";
    $("kcheck").disabled = false; show("kuis");
  }
  function fb(ok, txt) { return '<div class="fb ' + (ok ? "ok" : "no") + '">' + (ok ? "Benar" : "Belum tepat") + (txt ? " · " + esc(txt) : "") + "</div>"; }
  function periksa() {
    var K = window.KUIS[KEY], sj = 0, sb = 0, sm = 0, aj = [], ab = [], am = [];
    function kunciJ(n) { return L[K.kanan.findIndex(function (x) { return x[1] === n + 1; })]; }
    K.jodoh.forEach(function (t, n) { var v = $("j" + n).value, ok = v === kunciJ(n); if (ok) sj++; aj.push((n + 1) + "-" + (v || "?")); $("jp" + n).className = "pair " + (ok ? "good" : "wrong"); });
    $("jfb").innerHTML = fb(sj === 5, "Kunci: " + K.jodoh.map(function (t, n) { return (n + 1) + "-" + kunciJ(n); }).join(", "));
    K.bs.forEach(function (q, n) {
      var p = document.querySelector("#bp" + n + ' button[aria-pressed="true"]'), ok = !!p && (p.dataset.v === "1") === q[1];
      if (ok) sb++; ab.push((n + 1) + "-" + (p ? (p.dataset.v === "1" ? "B" : "S") : "?"));
      $("bfb" + n).innerHTML = fb(ok, "Jawaban: " + (q[1] ? "Benar" : "Salah (" + q[2] + ")"));
    });
    K.mcma.forEach(function (q, n) {
      var pil = "", ok = q[1].every(function (o, j) { var c = $("m" + n + "_" + j).checked; if (c) pil += L[j]; return c === o[1]; });
      if (ok) sm++; am.push((n + 1) + "-" + (pil || "?"));
      $("mfb" + n).innerHTML = fb(ok, "Kunci: " + q[1].map(function (o, j) { return o[1] ? L[j] : ""; }).join(""));
    });
    var s = sj + sb + sm, g = s >= 11 ? "Jagoan Refleksi!" : s >= 7 ? "Mantap, tinggal sedikit lagi!" : "Ayo baca lagi babnya, lalu coba ulang.";
    $("kscore").innerHTML = "<strong>Skormu: " + s + " / 12</strong> " + g;
    $("kcheck").disabled = true;
    kirim({ jenis: "kuis", skor: s, skorJodoh: sj, skorBS: sb, skorMCMA: sm, jawabJodoh: aj.join(", "), jawabBS: ab.join(", "), jawabMCMA: am.join(", ") }, $("kStatus"));
  }

  /* ---------- sambungkan tombol ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    if (!KEY) { if ($("cats")) beranda(); return; }
    if (!window.DECKS[KEY]) { document.body.textContent = "Bab tidak ditemukan."; return; }
    $("fIdent").addEventListener("submit", simpanIdentitas);
    document.querySelectorAll(".ganti").forEach(function (b) { b.onclick = gantiNama; });
    $("goRef").onclick = startRef; $("goKuis").onclick = kuis;
    $("done").onclick = function () { selesaiKartu(false); };
    $("skip").onclick = function () { selesaiKartu(true); };
    $("back").onclick = function () { show("menu"); };
    $("kback").onclick = function () { show("menu"); };
    $("again").onclick = startRef; $("home2").onclick = function () { show("menu"); };
    $("kreset").onclick = kuis; $("kcheck").onclick = periksa;
    $("kbody").addEventListener("click", function (e) {
      var b = e.target.closest("button[data-b]"); if (!b) return;
      b.parentNode.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
    });
    mulai();
  });
})();
