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
