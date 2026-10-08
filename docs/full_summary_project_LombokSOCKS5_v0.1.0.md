# Ringkasan Proyek LombokSOCKS5

## Apa ini

Zero-dependency SOCKS5 message codec (RFC 1928 and RFC 1929): greeting, method selection, username/password auth, request, reply, and UDP datagram header, with incremental decoding. Part of the Lombok Ecosystem.

## Mengapa dibuat

Klien dan server proxy, alat pengujian jaringan, dan firmware membutuhkan pembacaan dan penulisan pesan SOCKS5 yang benar tanpa menyeret pustaka soket. Library ini hanya mengubah byte menjadi nilai dan sebaliknya, dengan hasil identik di setiap bahasa dan penguraian bertahap untuk aliran TCP.

## Fitur utama

- Encode dan decode: greeting, pemilihan metode, otentikasi RFC 1929, request, reply, header UDP
- Decode bertahap: ok, incomplete, atau error dengan kode
- Alamat IPv4, IPv6, dan nama domain
- Tanpa soket dan tanpa I/O

## Status saat ini

Versi 0.1.0, belum dirilis. TypeScript dan Python lulus 1030 kasus vector. Port lain belum ada.

## Contoh pemakai

- Server atau klien proxy dalam bahasa apa pun
- Alat uji dan fuzz untuk implementasi proxy
- Gateway tertanam yang menerjemahkan SOCKS5 ke jalur lain
- Analisis lalu lintas: membaca tangkapan paket SOCKS5

## Batasan yang Diketahui

- Hanya codec; tidak ada mesin keadaan atau I/O.
- Domain bukan UTF-8: dipetakan Latin-1; pemanggil mengonversi IDN ke punycode.
- Fragmentasi UDP tidak dirakit.
- Port Rust, Go, PHP BELUM.

## Info lanjut

SPEC: `SPEC_LombokSOCKS5_v0.1.0.md`; API: `API_LombokSOCKS5_v0.1.0.md`; panduan: `guide_how_to_use_LombokSOCKS5_v0.1.0.md`.

## Gap vs pembanding

Pembanding: socks-proxy ekosistem Node, golang.org/x/net/internal/socks, PySocks, fast-socks5. Gap jujur: bukan klien/server lengkap; keunggulan: kontrak byte-identik lintas bahasa dan decode bertahap tanpa soket.
