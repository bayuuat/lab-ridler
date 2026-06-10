# PRODUCT REQUIREMENT DOCUMENT (PRD)

## Project Name: HabitQuest (Gamified Habit & Growth Tracker)

**Objective:** Aplikasi iOS dan Central Backend untuk melacak habit dan tugas dinamis berbasis *proof-of-work* (bukti foto, teks, atau integrasi API) menggunakan sistem *streak* dan *Live Activities* ala Duolingo.
**Target Platform:** iOS App (Swift/SwiftUI) & Central Backend (API)

---

## 1. System Architecture Overview

Aplikasi ini menggunakan arsitektur **Centralized Backend Aggregator**. Aplikasi iOS berfungsi sebagai Frontend Utama yang menampilkan progress, *Live Activities*, dan berinteraksi dengan pengguna. Platform eksternal (Web Coding/Platform Menulis) dan AI Service akan berkomunikasi dengan Central Backend menggunakan REST API dan Webhooks untuk memperbarui status secara *real-time*.

```
[ Web Daily Coding ]  ───(Webhook / API)───► [ Central Backend ] ◄───(Upload Proof)─── [ iOS Mobile App ]
                                                    │
                                            (Push Notification)
                                                    │
                                                    ▼
                                            [ iOS Mobile App ]
                                      (Live Activity / Today Widget)

```

---

## 2. Core Product Features & Rules

### 2.1 Time Engine & Streak Logic

* **Day Reset Window:** Pergantian hari untuk perhitungan streak dikunci pada **pukul 01.00 subuh waktu lokal pengguna (User's Local Timezone)**.
* *Skenario:* Jika pengguna menyelesaikan tugas pada pukul 00.55 subuh, tugas tersebut dihitung untuk hari yang baru saja lewat. Jika diselesaikan pukul 01.05 subuh, masuk ke hari berikutnya.


* **Streak Freeze:** Fitur untuk mengamankan streak jika pengguna absen (sakit/libur). Memiliki kuota terbatas (`FreezeQuota`) yang dapat dikonfigurasi. Jika kuota habis dan pengguna melewati pukul 01.00 subuh tanpa menyelesaikan seluruh target harian, streak kembali ke `0`.

### 2.2 Unified Verification Methods

Sistem mendukung 3 jenis metode pembuktian tugas agar aplikasinya dinamis dan *future-proof*:

1. **Manual Check / Text Input (`TEXT_PROOF`):** Pengguna memasukkan teks ringkasan (*takeaway*) atau kode verifikasi unik yang didapatkan dari platform eksternal/AI luar.
2. **Photo / Image Upload (`IMAGE_PROOF`):** Pengguna mengunggah gambar (*screenshot* atau foto langsung dari kamera) sebagai bukti fisik aktivitas (misal: foto olahraga atau *screenshot* mutasi tabungan).
3. **Automated Webhook (`WEB_HOOK`):** Verifikasi otomatis tanpa interaksi di aplikasi iOS. Platform eksternal (seperti Web Daily Coding milik pengguna) mengirimkan sinyal sukses langsung ke Central Backend.

---

## 3. Development Roadmap & Milestones

Proyek ini dibagi menjadi 4 Milestone terpisah agar pengembangan dapat dipantau dan diuji secara berkala.

### ## MILESTONE 1: Fondasi Backend & Time Engine

**Fokus Utama:** Membangun "otak" aplikasi di sisi server dan database tanpa UI/tampilan HP.
**Wujud Output:** Program Backend (API) yang berjalan di server/lokal, siap ditest menggunakan Postman/cURL.

#### User Stories & Requirements:

* Sebagai pengguna, saya ingin sistem mendeteksi penyelesaian tugas berdasarkan batas waktu jam 01.00 subuh waktu lokal saya, bukan jam 00.00 UTC.
* Sebagai pengguna, jika saya gagal menyelesaikan seluruh habit hingga pukul 01.00 subuh, sistem harus otomatis memotong kuota *Streak Freeze* saya (jika ada) agar streak saya tidak hangus.

#### Technical Specifications (API Endpoints):

* `POST /api/v1/habits` -> Membuat habit/goal baru dengan menentukan jenis verifikasi (`TEXT_PROOF`, `IMAGE_PROOF`, `WEB_HOOK`).
* `GET /api/v1/habits/today` -> Mengambil daftar habit yang harus diselesaikan hari ini beserta statusnya (`PENDING`, `COMPLETED`).
* `POST /api/v1/habits/verify` -> Mengirimkan tanda selesai untuk habit manual/teks.
* `GET /api/v1/streak` -> Mengambil data status streak saat ini dan sisa kuota *Freeze*.

---

### ## MILESTONE 2: Aplikasi iOS Dasar & Verifikasi Manual/Foto

**Fokus Utama:** Membuat aplikasi iOS (SwiftUI) yang terhubung ke Backend Milestone 1.
**Wujud Output:** Aplikasi iOS (.ipa / Xcode project) yang bisa diinstall di iPhone, menampilkan daftar habit dan bisa mengunggah bukti foto/teks.

#### User Stories & Requirements:

* Sebagai pengguna, saya ingin melihat jumlah streak harian saya dalam bentuk ikon api (🔥) di bagian atas dashboard aplikasi iOS.
* Sebagai pengguna, saya ingin melihat daftar habit hari ini, dan jika tipe habitnya adalah `IMAGE_PROOF`, saya bisa membuka kamera/galeri iPhone langsung dari aplikasi untuk mengunggah foto bukti olahraga atau aktivitas lainnya.
* Sebagai pengguna, jika tipe habitnya adalah `TEXT_PROOF`, saya ingin ada kolom input teks di dalam kartu habit tersebut untuk memasukkan rangkuman membaca atau kode verifikasi.

#### UI/UX Components (iOS):

* **Dashboard Screen:** Komponen *Header* (Streak Counter), *List View* (Daftar kartu habit hari ini dengan status centang hijau jika selesai), dan tombol penunjang lainnya.
* **Upload Sheet:** *Pop-up* modal untuk kamera/galeri picker dan input teks.

---

### ## MILESTONE 3: Live Activities & Integrasi Webhook (Otomatisasi)

**Fokus Utama:** Membuka akses otomatisasi dari luar dan menampilkan status *real-time* di iOS Widget.
**Wujud Output:** Widget aktif di *Lock Screen/Home Screen* iPhone, serta endpoint webhook backend yang bisa ditembak oleh aplikasi web coding milik pengguna.

#### User Stories & Requirements:

* Sebagai pengguna, saya ingin melihat sisa tugas hari ini langsung dari *Lock Screen* iPhone saya (via *Live Activity* / Widget) tanpa perlu membuka aplikasi iOS terlebih dahulu.
* Sebagai pengguna, saat saya menyelesaikan *daily problem* di **Web Daily Coding** (proyek saya yang lain), saya ingin web tersebut otomatis mengirim laporan ke server tracker sehingga status di Widget iPhone saya langsung berubah menjadi "Selesai" secara *real-time*.

#### Technical Specifications:

* **Backend Webhook Endpoint:** `POST /api/v1/webhook/external-verify`
* *Payload:* `{"habit_id": "UUID", "secret_key": "STRING", "status": "COMPLETED"}`


* **iOS APNs (Apple Push Notification service):** Backend harus mengintegrasikan *Silent Push Notification* dengan payload *Live Activity* untuk memperbarui UI Widget iOS secara instan saat webhook dari web coding masuk.

---

### ## MILESTONE 4: AI Task Generator (The Quest Giver)

**Fokus Utama:** Integrasi LLM (Gemini/OpenAI API) untuk memecahkan goal besar menjadi tugas harian konkret di dalam aplikasi.
**Wujud Output:** Fitur chat/modul AI di dalam aplikasi iOS untuk menjabarkan goal baru menjadi tantangan harian secara otomatis.

#### User Stories & Requirements:

* Sebagai pengguna, saat membuat goal baru (misal: "Belajar CPNS"), saya ingin AI di aplikasi membuatkan tantangan harian yang dinamis agar proses belajar tidak stagnan.
* Sebagai pengguna, saya ingin AI menentukan instruksi verifikasinya secara otomatis (Contoh AI: *"Minta Gemini luar buatkan 10 soal TIU, kerjakan, lalu minta kode verifikasi dari Gemini tersebut untuk dimasukkan ke aplikasi ini"*).

#### Technical Specifications:

* **Backend AI Service:** Integrasi SDK Gemini/OpenAI di backend.
* Backend menerima input goal dari user, mengirimkannya ke LLM dengan *system prompt* khusus untuk menghasilkan JSON terstruktur berisi: `Task Name`, `Description`, dan `Verification Type` (`TEXT_PROOF` atau `IMAGE_PROOF`).
* Aplikasi iOS menampilkan hasil *generate* tersebut menjadi kartu tugas baru yang siap dilacak setiap harinya.

---

## 4. Non-Functional Requirements & Guardrails

* **Security:** Komunikasi antara iOS App, Central Backend, dan Webhook pihak ketiga wajib menggunakan enkripsi **HTTPS** dengan autentikasi berbasis Bearer Token / API Key yang aman.
* **Battery Efficiency (iOS):** Pembaruan *Live Activities* melalui Push Notification harus mengikuti *best practice* dari Apple (menggunakan background/silent notification yang efisien) agar tidak menguras baterai iPhone pengguna.
* **Offline Handling:** Jika aplikasi iOS kehilangan koneksi internet, data input verifikasi lokal harus disimpan sementara (*cached*) dan disinkronisasikan ulang secara otomatis begitu koneksi internet kembali pulih.