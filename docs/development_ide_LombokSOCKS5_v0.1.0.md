# Pengembangan LombokSOCKS5

## 1. Roadmap

- 0.1.1: CI, coverage, fuzz, publish
- 0.2.0: port Rust (no_std+alloc), Go, PHP
- 0.3.0: pembantu mesin keadaan negosiasi opsional; SOCKS4/4a codec

## 2. Deferred scope

Soket, mesin keadaan negosiasi, pemilihan metode, penerusan data, fragmentasi UDP, dan GSSAPI (metode 1) bukan bagian library ini.

## 3. Prinsip desain untuk kontributor

- Kontrak dulu: ubah SPEC dan vector sebelum kode; perbedaan antar-port adalah bug.
- Tanpa dependensi runtime; tanpa jam, tanpa jaringan, tanpa acak tersembunyi.
- Setiap fitur README memiliki kasus vector atau test.
- Tidak ada nama klien atau aplikasi pemilik di berkas publik.
- Tanpa emoji di `*.md`.

## 4. Cara berkontribusi

Fork, cabang `feat/...`, jalankan kedua runner vector, perbarui `API_` dan `SPEC_` bila perilaku berubah, buka PR. Bangkitkan ulang vector dengan `node scripts/gen_vectors.ts` hanya bila kontrak berubah, dan tinjau diff vector.

## 5. Pertanyaan terbuka

- Apakah SOCKS4/4a perlu di library yang sama atau terpisah?
- Pemetaan domain: tetap Latin-1 atau menyediakan opsi UTF-8?
