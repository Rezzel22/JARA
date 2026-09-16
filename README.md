# JARA — Advanced To-Do List

JARA (Advanced To-Do List) adalah aplikasi manajemen tugas berbasis web yang dirancang untuk membantu pengguna mengelola task pribadi maupun task dalam project secara terstruktur.

Aplikasi ini dikembangkan sebagai project praktikum menggunakan Laravel sebagai backend dan React sebagai frontend.

---

## 📋 Software Requirements Specification (SRS)

### 1. Project Overview

| Item | Description |
|---|---|
| Project Name | JARA — Advanced To-Do List |
| Platform | Web Application |
| Architecture | Single Page Application (SPA) |
| Backend | Laravel |
| Frontend | React |
| Database | MySQL |
| Authentication | Tidak menggunakan authentication |
| Development Team | 3 Programmer + 1 Project Manager |
| Target Development Time | 60 menit |

---

## 2. Functional Requirements

### SRS-001 — Task Management

Sistem harus dapat:

- Membuat task baru.
- Mengubah task.
- Menghapus task.
- Menyimpan task ke database.
- Setiap task minimal memiliki:
  - Title
  - Priority
  - Deadline
- Priority terdiri dari:
  - Low
  - Medium
  - High

---

### SRS-002 — Task List, Grouping & Sorting

Sistem harus dapat:

- Menampilkan daftar task.
- Mengelompokkan task berdasarkan project/list.
- Melakukan sorting task berdasarkan:
  - Priority
  - Deadline
- Proses sorting tidak mengubah data asli yang tersimpan di database.

---

### SRS-003 — Task Status

Sistem harus dapat:

- Menampilkan status task.
- Mengubah task menjadi selesai (Done).
- Mengubah task kembali menjadi belum selesai (Not Done).
- Menyimpan perubahan status ke database.

---

### SRS-004 — Project Collaboration

Sistem harus dapat:

- Membuat project.
- Menambahkan user ke dalam project.
- Memiliki beberapa user dalam satu project.
- Menentukan user sebagai assignee task.
- Menyimpan hubungan antara:
  - User dan Project
  - User dan Task

---

### SRS-005 — Project Progress

Sistem harus dapat menghitung progress project berdasarkan:

```text
Progress = (Completed Tasks / Total Tasks) × 100%
```

---

### SRS-006 — Multi-Assignee Task

Sistem harus dapat:

- Menugaskan satu task kepada satu atau lebih assignee.
- Memastikan assignee merupakan anggota project tempat task berada.
- Menambahkan dan menghapus assignee dari task.
- Mencegah assignment assignee yang sama secara duplikat.
- Menyimpan assignment ke database.

---

### SRS-007 — Pembuatan Project dengan Kepemilikan Otomatis

Sistem harus dapat:

- Membuat daftar atau project baru dari input yang valid.
- Menyimpan daftar atau project ke database.
- Mencatat pembuat daftar atau project sebagai owner secara otomatis.
- Menjalankan pembuatan daftar atau project dan penetapan owner dalam satu transaksi atomik.
- Membatalkan seluruh perubahan jika salah satu proses gagal.

---

### SRS-008 — Penghapusan Project Milik Owner

Sistem harus dapat:

- Mengizinkan hanya owner untuk menghapus daftar atau project miliknya.
- Menghapus task yang berada pada daftar atau project tersebut.
- Menghapus relasi anggota dan assignment terkait.
- Menjalankan penghapusan dalam satu transaksi atomik.
- Membatalkan seluruh penghapusan jika salah satu proses gagal.

---

### SRS-009 — Authorization Resource

Sistem harus dapat:

- Memeriksa kewenangan pengguna sebelum menjalankan operasi yang dilindungi.
- Memberikan akses operasi khusus owner kepada owner.
- Membatasi member pada operasi yang diizinkan.
- Menolak pengguna yang tidak berwenang tanpa mengubah data.
- Menangani resource yang tidak ditemukan atau tidak dapat diakses tanpa mengubah data.

---

### SRS-010 — Monitoring Progress Project

Sistem harus dapat:

- Menghitung jumlah seluruh task dalam daftar atau project.
- Menentukan jumlah task yang telah selesai.
- Memperbarui progress berdasarkan status task saat ini.
- Menghitung progress hanya dari task yang berada pada daftar atau project terkait.

---

### SRS-011 — Penghapusan Akun oleh Admin

Sistem harus dapat:

- Mengizinkan hanya admin untuk menghapus akun pengguna.
- Menghapus akun pengguna yang valid.
- Menangani relasi membership dan assignment terkait tanpa meninggalkan referensi invalid.
- Menjalankan perubahan database terkait dalam satu transaksi atomik.
- Membatalkan seluruh perubahan jika proses penghapusan gagal.

---

### SRS-012 — Validasi Input

Sistem harus dapat:

- Memvalidasi seluruh input pengguna sebelum operasi database dijalankan.
- Menolak input yang tidak memenuhi format atau constraint.
- Memastikan input tidak valid tidak mengubah database.
- Mengembalikan pesan kesalahan validasi kepada pengguna.
- Menerapkan validasi pada seluruh endpoint yang dikerjakan.

---

### SRS-013 — Pencegahan SQL Injection

Sistem harus dapat:

- Menggunakan query yang aman untuk seluruh operasi database yang menerima input pengguna.
- Menggunakan parameter binding, Query Builder, Eloquent, atau mekanisme parameterisasi setara.
- Tidak menggabungkan input pengguna langsung ke raw SQL string.
- Memastikan input dengan karakter SQL tidak dapat mengubah struktur query.
