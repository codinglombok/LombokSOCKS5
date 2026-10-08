# Panduan Pemakaian LombokSOCKS5

## 1. Instalasi

Setelah rilis: `npm install lomboksocks5` atau `pip install lomboksocks5`. Sebelum rilis, salin folder `typescript/src` atau `python/src/lomboksocks5` (tanpa dependensi).

## 2. Konsep dasar

Setiap pesan punya pasangan encode dan decode. Encode menerima nilai dan mengembalikan byte. Decode menerima byte yang sudah diterima dan mengembalikan ok (nilai dan jumlah byte yang dipakai), incomplete (tunggu byte lagi), atau error (kode). Dengan begitu pembaca aliran TCP cukup menumpuk byte dan memanggil decode ulang.

## 3. Contoh

Berkas `examples/example.ts` dan `examples/example.py` menghasilkan keluaran berikut (TypeScript; Python sama kecuali format cetak):

```
greeting 05020002
request 050100030b6578616d706c652e636f6d01bb
partial incomplete
decoded example.com 443 consumed 18
```

Kode TypeScript:

```ts
import { decodeRequest, encodeGreeting, encodeRequest } from "lomboksocks5";

const hex = (b: Uint8Array): string => Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
console.log("greeting", hex(encodeGreeting([0, 2])));
const req = encodeRequest({ cmd: 1, addr: { type: "domain", value: "example.com" }, port: 443 });
console.log("request", hex(req));
console.log("partial", decodeRequest(req.subarray(0, 6)).status);
const d = decodeRequest(req);
if (d.status === "ok") console.log("decoded", d.value.addr.value, d.value.port, "consumed", d.consumed);
```

## 4. Recipes

- Server: decodeGreeting, pilih metode, kirim encodeMethodSelection; lalu decodeRequest dan kirim encodeReply.
- Klien: kirim encodeGreeting dan encodeRequest, baca balasan dengan decodeMethodSelection dan decodeReply.
- Relay UDP: bungkus tiap datagram dengan encodeUdp dan baca dengan decodeUdp.

## 5. Common pitfalls

- Hanya codec; tidak ada mesin keadaan atau I/O.
- Domain bukan UTF-8: dipetakan Latin-1; pemanggil mengonversi IDN ke punycode.
- Fragmentasi UDP tidak dirakit.
- Port Rust, Go, PHP BELUM.

## 6. Lihat juga

`SPEC_LombokSOCKS5_v0.1.0.md`, `API_LombokSOCKS5_v0.1.0.md`, `full_summary_project_LombokSOCKS5_v0.1.0.md`.
