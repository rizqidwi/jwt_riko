# SOAL PROJECT BACKEND & FRONTEND DEVELOPMENT: "MINI-WALLET APP WITH JWT DASHBOARD & LOGGING" (V4)

## 1. Latar Belakang & Deskripsi Proyek

Perusahaan sedang mengembangkan purwarupa (prototype) sistem dompet digital (Mini-Wallet). Tugas kamu adalah membangun RESTful API menggunakan Node.js dan Express.js yang menangani sistem autentikasi pengguna menggunakan JWT, menyediakan beberapa fitur transaksi dasar yang aman, membuat halaman Web Dashboard Sederhana (Frontend), serta mengimplementasikan Sistem Logging (Pencatatan Aktivitas) di sisi backend untuk keperluan audit keamanan server.

Penyimpanan data backend menggunakan **In-Memory Database** (memanfaatkan Array JavaScript di dalam memori server).

---

## 2. Spesifikasi Teknis & Kebutuhan Fitur

### Fitur A: Backend API & JWT Authentication

**Endpoint Public:**

- `POST /api/v1/auth/register` — Input: `username`, `email`, `password`. Validasi email unik dan password wajib di-hash dengan bcrypt.
- `POST /api/v1/auth/login` — Input: `email`, `password`. Respons sukses wajib mengembalikan token JWT dan membawa data lengkap user (`id`, `username`, `email`). Masa berlaku JWT adalah **30 menit**. `JWT_SECRET` wajib disimpan di file `.env`.

**Endpoint Protected (Wajib Middleware JWT):**

- `GET /api/v1/wallet/balance` — Menampilkan data saldo saat ini dan riwayat transaksi milik user yang sedang login.
- `POST /api/v1/wallet/topup` — Input: `amount`. Menambahkan saldo user (tidak boleh minus atau 0).
- `POST /api/v1/wallet/transfer` — Input: `target_email`, `amount`. Mengurangi saldo pengirim, menambah saldo penerima, dan mencatat riwayat transaksi di kedua belah pihak.

---

### Fitur B: Backend Logging System

Untuk melacak aktivitas aplikasi dan menjaga keamanan sistem, kamu wajib menerapkan mekanisme logging yang terstruktur:

1. **HTTP Request Logger:** Menggunakan middleware (seperti `morgan`) untuk mencatat setiap HTTP request yang masuk.
2. **Activity & Security Logger:** Menggunakan library logger (seperti `winston`) untuk mencatat aktivitas penting secara spesifik, antara lain:
   - Log ketika ada user baru yang mendaftar (**Register Success**).
   - Log ketika terjadi login berhasil (**Login Success**) maupun login gagal (**Login Failed** — sertakan email yang mencoba login).
   - Log setiap transaksi dompet (**Top Up** dan **Transfer**), mencatat siapa pelakunya dan berapa nominalnya.
   - Log peringatan keamanan (**Security Warning**) jika ada request ke protected route yang ditolak karena token tidak valid atau expired.
3. **Destinasi Log:** Log wajib ditampilkan di terminal console server **DAN** ditulis/disimpan ke dalam file fisik (misal: `logs/app.log` atau `logs/error.log`).
4. **Format Log:** Setiap baris log wajib memiliki komponen standar:

   ```
   [Timestamp] [Log Level: INFO/WARN/ERROR] [Message]
   ```

---

### Fitur C: Frontend Web Dashboard (Sisi Klien)

Membuat antarmuka web sederhana (HTML/CSS/JS Vanilla atau Framework CSS) yang terintegrasi dengan API:

1. **Form Login & Register:** Menangani proses autentikasi ke backend.
2. **JWT Inspector Box:** Menampilkan string JWT aktif di layar, serta memecah/menampilkan isi komponen data Payload dari token secara visual (ID, Email, Expired Time).
3. **Informasi Dompet & Aksi Real-time:** Menampilkan nama user, email, dan Saldo Terkini. Menyediakan form interaktif untuk **Top Up Saldo** dan **Transfer Uang** secara real-time tanpa reload halaman web (menggunakan Fetch API).

---

## 3. Format Respons API & Standarisasi Data (Wajib)

Semua respons sukses (HTTP 200/201) dari API yang kamu buat wajib membawa data-data yang relevan di dalam properti `data`.

**Respons Sukses (Umum):**

```json
{
  "success": true,
  "message": "Deskripsi pesan sukses",
  "data": { }
}
```

> Properti `data` **WAJIB** membawa objek hasil proses.

**Respons Sukses Login (Spesifik JWT):**

```json
{
  "success": true,
  "message": "Login berhasil",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsIn...",
    "user": {
      "id": 1,
      "username": "john_doe",
      "email": "john@example.com"
    }
  }
}
```

**Respons Gagal:**

```json
{
  "success": false,
  "message": "Detail pesan error atau alasan gagal"
}
```

---

## 4. Struktur Folder yang Disarankan

```
nodejs-mini-wallet/
├── config/
│   └── db.js                 # Tempat menyimpan array data (users, transactions)
├── controllers/
│   ├── authController.js
│   └── walletController.js
├── middlewares/
│   └── authMiddleware.js      # Logika validasi JWT & Security Logging
├── logs/                      # FOLDER UNTUK MENYIMPAN FILE LOG
│   ├── app.log                # Menyimpan semua log aktivitas
│   └── error.log              # Menyimpan khusus log error/warning
├── public/                    # Tempat file frontend dashboard
│   ├── index.html             # Halaman Login / Register
│   ├── dashboard.html         # Halaman Utama Dashboard
│   └── app.js                 # Logika Fetch API Frontend
├── routes/
│   ├── authRoutes.js
│   └── walletRoutes.js
├── .env                       # PORT dan JWT_SECRET
├── .gitignore                 # Mengabaikan node_modules, .env, dan folder logs/
├── app.js                     # Entry point server & konfigurasi global logger
└── package.json
```

---

## 5. Parameter Kelulusan Project (Definition of Done)

- **Keamanan Backend:** Password terenkripsi bcrypt dan `JWT_SECRET` dikelola via `.env`.
- **Validasi & Interseptor:** Fitur protected route terkunci rapat dari request tanpa token yang valid.
- **Integrasi Dashboard:** Frontend mampu mendecode JWT payload ke layar secara visual serta fungsi transaksi berjalan dinamis via Fetch API.
- **Audit Log Terbukti Berjalan:** Ketika server diuji coba, folder `logs/` otomatis terbuat dan file log terisi rekaman aktivitas yang sesuai dengan urutan kronologis transaksi (Register → Login → Top Up → Transfer) beserta rekaman timestamp-nya.
