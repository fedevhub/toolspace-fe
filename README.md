# Toolspace

## Menjalankan aplikasi

1. Isi `backend/.env` dengan koneksi MongoDB (`MONGO_URI`), secret JWT (`JWT_SECRET`), dan kredensial admin awal (`SEED_ADMIN_USERNAME`, `SEED_ADMIN_PASSWORD`).
2. Dari root proyek, jalankan backend: `npm --prefix backend run dev`.
3. Di terminal lain, jalankan frontend: `npm run dev`.
4. Buka URL frontend yang ditampilkan Vite dan login menggunakan akun admin yang dikonfigurasi.

Frontend memakai `VITE_API_URL` dari `.env` root untuk menghubungi API Express. Koneksi MongoDB hanya dilakukan oleh backend.

## Mengelola pengguna

Login sebagai admin, lalu buka menu **Pengguna** untuk melihat data MongoDB dan menambah, mengedit, atau menghapus akun. Pengelolaan ini membutuhkan token admin. Password disimpan sebagai hash; saat mengedit akun, kosongkan kolom password jika tidak ingin menggantinya.

Akun yang ditambahkan melalui menu tersebut langsung dapat digunakan untuk login dengan username dan password yang disimpan. Role admin diarahkan ke dashboard admin, petugas ke halaman peminjaman, dan peminjam ke halaman konfirmasi login.

## Mengelola alat

Login sebagai admin, lalu buka menu **Alat** untuk melihat dan melakukan CRUD data alat di MongoDB. Kode alat menggunakan awalan `KA` dan nomor urut dibuat otomatis, seperti `KA-001`, `KA-002`. Foto diunggah sebagai PNG atau JPG dengan ukuran maksimal 5 MB.
