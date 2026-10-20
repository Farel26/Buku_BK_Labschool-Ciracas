# Kartu Refleksi & Tantangan Kuis · Buku BK Kelas 7

Game online pendamping **Buku Bimbingan dan Konseling Kelas 7 SMP Labschool Ciracas**.
Setiap bab punya halaman sendiri dengan dua permainan:

- **Kartu Refleksi**: kartu tanya dan tantangan untuk mengenal diri.
- **Tantangan Kuis**: Menjodohkan, Benar–Salah, dan Pilih Semua yang Benar (skor maks 12).

Jawaban refleksi dan skor kuis siswa dikirim ke **Google Spreadsheet guru BK**.

| Halaman | Bab |
|---|---|
| `index.html` | Beranda, daftar semua bab |
| `dunia.html` | Bab 1 · Dunia SMP |
| `akm.html` | Bab 2 · AKM |
| `remaja.html` | Bab 3 · Masa Remaja |
| `teman.html` | Bab 4 · Teman & Relasi |
| `napza.html` | Bab 5 · NAPZA |
| `minat.html` | Bab 6 · Minat & Bakat |

## Isi folder

```
index.html, dunia.html, akm.html, remaja.html, teman.html, napza.html, minat.html
config.js            ← alamat Web App Google Apps Script diisi di sini
assets/style.css     ← tampilan
assets/data.js       ← isi kartu dan soal kuis (edit di sini kalau mau mengubah soal)
assets/app.js        ← logika game dan pengiriman data
apps-script/Code.gs  ← kode untuk Google Spreadsheet (tidak dipakai GitHub, ditempel di Apps Script)
```

## Langkah 1 · Siapkan Google Spreadsheet

1. Buka Google Drive, buat **Google Spreadsheet** baru, beri nama misalnya `Data Game Buku BK Kelas 7`.
2. Menu **Ekstensi → Apps Script**.
3. Hapus isi `Code.gs`, lalu tempel seluruh isi file `apps-script/Code.gs`. Klik ikon simpan.
4. Di daftar fungsi (atas), pilih **setup**, klik **Jalankan**. Saat diminta, klik **Tinjau izin**, pilih akun sekolah, lalu **Izinkan**.
   Spreadsheet sekarang punya lembar **Refleksi**, **Kuis**, dan **Rekap Skor**.
5. Klik **Terapkan → Deployment baru**. Ikon roda gigi → pilih **Aplikasi web**.
   - Deskripsi: `Game Buku BK v1`
   - Jalankan sebagai: **Saya**
   - Yang memiliki akses: **Siapa saja**
6. Klik **Terapkan**, lalu salin **URL aplikasi web** (berakhiran `/exec`).
7. Cek: buka URL itu di browser. Harus muncul `{"ok":true,"pesan":"Server Buku BK Kelas 7 aktif."}`.

> Kalau nanti `Code.gs` diubah, pakai **Terapkan → Kelola deployment → edit → Versi baru** supaya URL-nya tetap sama.

## Langkah 2 · Isi config.js

Buka `config.js`, ganti `TEMPEL_URL_WEB_APP_DI_SINI` dengan URL dari langkah 1.6. Contoh:

```js
window.BK_CONFIG = {
  SCRIPT_URL: "https://script.google.com/macros/s/AKfy.../exec"
};
```

## Langkah 3 · Unggah ke GitHub dan aktifkan GitHub Pages

1. Di GitHub, klik **New repository**.
2. Isi:
   - **Repository name**: `buku-bk-labscira`
   - **Description**: `Kartu refleksi dan tantangan kuis Buku BK Kelas 7 SMP Labschool Ciracas`
   - **Public** (wajib untuk GitHub Pages gratis)
   - **Add a README file**: jangan dicentang (README sudah ada di folder ini)
   - **.gitignore**: None · **License**: None
3. Klik **Create repository**, lalu klik tautan **uploading an existing file**.
4. Seret **semua isi** folder ini (termasuk folder `assets` dan `apps-script`) ke halaman unggah. Klik **Commit changes**.
5. Buka **Settings → Pages**. Di **Build and deployment**: Source **Deploy from a branch**, Branch **main**, folder **/ (root)**, klik **Save**.
6. Tunggu 1–2 menit. Alamat situsnya: `https://NAMA-AKUN-GITHUB.github.io/buku-bk-labscira/`

## Langkah 4 · Uji coba

1. Buka `https://NAMA-AKUN-GITHUB.github.io/buku-bk-labscira/teman.html` dari HP.
2. Isi nama `Uji Coba`, kelas `7A`, mainkan kuis sampai **Periksa jawaban**.
3. Pastikan muncul "✓ Terkirim ke guru BK" dan barisnya muncul di lembar **Kuis**. Hapus baris uji coba setelahnya.

## Membaca data

- **Refleksi**: satu baris per kartu yang dijawab (waktu, nama, kelas, bab, pertanyaan, jawaban). Pakai filter untuk melihat per kelas atau per bab.
- **Kuis**: satu baris per percobaan, lengkap dengan skor tiap game dan jawaban siswa.
- **Rekap Skor**: skor terbaik dan jumlah percobaan tiap siswa per bab, terisi otomatis.

## Privasi

- Data siswa hanya tersimpan di spreadsheet, **tidak di GitHub**. Jangan bagikan spreadsheet selain ke guru BK.
- Siswa diberi tahu di layar bahwa jawabannya dikirim ke guru BK.
- Refleksi bisa memuat cerita pribadi. Kalau ada jawaban yang mengkhawatirkan, tindak lanjuti lewat layanan konseling.
- Alamat `/exec` di `config.js` bisa dilihat orang lain karena repository publik. Server hanya menerima data dengan format yang benar, tetapi tetap periksa spreadsheet secara berkala.
