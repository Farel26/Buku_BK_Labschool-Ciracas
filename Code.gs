/**
 * Backend Google Spreadsheet untuk game Buku BK Kelas 7 SMP Labschool Ciracas.
 *
 * Cara pakai singkat (lengkapnya di README.md):
 * 1. Buka spreadsheet guru BK > Ekstensi > Apps Script, hapus isi Code.gs, tempel file ini.
 * 2. Pilih fungsi "setup" lalu klik Jalankan (izinkan akses saat diminta).
 * 3. Terapkan > Deployment baru > Aplikasi web. Jalankan sebagai: Saya. Akses: Siapa saja.
 * 4. Salin URL /exec ke config.js di repository GitHub.
 */

var SHEET_REFLEKSI = 'Refleksi';
var SHEET_KUIS = 'Kuis';
var SHEET_REKAP = 'Rekap Skor';
var HEAD_REFLEKSI = ['Waktu', 'Nama', 'Kelas', 'No. Absen', 'Bab', 'Jenis Kartu', 'Pertanyaan', 'Jawaban'];
var HEAD_KUIS = ['Waktu', 'Nama', 'Kelas', 'No. Absen', 'Bab', 'Skor (maks 12)', 'Menjodohkan (5)', 'Benar-Salah (5)', 'MCMA (2)',
                 'Jawaban Menjodohkan', 'Jawaban Benar-Salah', 'Jawaban MCMA'];
var BAB_SAH = ['dunia', 'akm', 'remaja', 'teman', 'napza', 'minat'];

/** Jalankan sekali dari editor untuk menyiapkan lembar dan judul kolom. */
function setup() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  ss.setSpreadsheetTimeZone('Asia/Jakarta');
  siapkan_(ss, SHEET_REFLEKSI, HEAD_REFLEKSI, [150, 180, 70, 80, 200, 100, 380, 420]);
  siapkan_(ss, SHEET_KUIS, HEAD_KUIS, [150, 180, 70, 80, 200, 110, 120, 120, 90, 200, 200, 150]);
  var rk = ss.getSheetByName(SHEET_REKAP) || ss.insertSheet(SHEET_REKAP);
  rk.clear();
  rk.getRange('A1').setValue('Rekap skor terbaik per siswa per bab (otomatis dari lembar Kuis)').setFontWeight('bold');
  rk.getRange('A3').setFormula(
    "=IFERROR(QUERY(Kuis!A2:F, \"select B, C, E, max(F), count(F) where B is not null group by B, C, E order by C, B " +
    "label B 'Nama', C 'Kelas', E 'Bab', max(F) 'Skor Terbaik', count(F) 'Jumlah Percobaan'\", 0), \"Belum ada data\")");
  rk.setColumnWidths(1, 5, 170);
}

function siapkan_(ss, nama, head, lebar) {
  var sh = ss.getSheetByName(nama) || ss.insertSheet(nama);
  sh.getRange(1, 1, 1, head.length).setValues([head]).setFontWeight('bold').setBackground('#13294B').setFontColor('#FFFFFF');
  sh.setFrozenRows(1);
  lebar.forEach(function (w, i) { sh.setColumnWidth(i + 1, w); });
  sh.getRange(2, 1, sh.getMaxRows() - 1, head.length).setWrap(true).setVerticalAlignment('top');
}

/** Cek cepat: buka URL /exec di browser, harus muncul {"ok":true,...}. */
function doGet() {
  return json_({ ok: true, pesan: 'Server Buku BK Kelas 7 aktif.' });
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    var d = JSON.parse(e.postData.contents);
    var nama = teks_(d.nama, 80), kelas = teks_(d.kelas, 10), absen = teks_(d.absen, 5), bab = teks_(d.bab, 80);
    if (nama.length < 3 || !/^7/.test(kelas) || BAB_SAH.indexOf(d.babKey) < 0) throw new Error('Data siswa tidak lengkap.');
    var ss = SpreadsheetApp.getActiveSpreadsheet(), now = new Date();

    if (d.jenis === 'refleksi') {
      var list = (d.jawaban || []).slice(0, 30);
      if (!list.length) throw new Error('Tidak ada jawaban.');
      var rows = list.map(function (j) {
        return [now, nama, kelas, absen, bab, teks_(j.jenis, 20), teks_(j.pertanyaan, 400), teks_(j.jawaban, 3000)];
      });
      var sr = ss.getSheetByName(SHEET_REFLEKSI);
      sr.getRange(sr.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);
    } else if (d.jenis === 'kuis') {
      var sk = ss.getSheetByName(SHEET_KUIS);
      sk.appendRow([now, nama, kelas, absen, bab, angka_(d.skor, 12), angka_(d.skorJodoh, 5), angka_(d.skorBS, 5), angka_(d.skorMCMA, 2),
                    teks_(d.jawabJodoh, 100), teks_(d.jawabBS, 100), teks_(d.jawabMCMA, 100)]);
    } else {
      throw new Error('Jenis data tidak dikenal.');
    }
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err.message || err) });
  } finally {
    lock.releaseLock();
  }
}

/** Potong panjang teks dan cegah isian dibaca sebagai rumus spreadsheet. */
function teks_(v, max) {
  var s = String(v == null ? '' : v).slice(0, max).trim();
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}
function angka_(v, max) {
  var n = Math.round(Number(v));
  return isNaN(n) ? 0 : Math.max(0, Math.min(max, n));
}
function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
