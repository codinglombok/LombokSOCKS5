# LombokSOCKS5

Zero-dependency SOCKS5 message codec (RFC 1928 and RFC 1929): greeting, method selection, username/password auth, request, reply, and UDP datagram header, with incremental decoding. Part of the Lombok Ecosystem.

## Mengapa library ini?

Klien dan server proxy, alat pengujian jaringan, dan firmware membutuhkan pembacaan dan penulisan pesan SOCKS5 yang benar tanpa menyeret pustaka soket. Library ini hanya mengubah byte menjadi nilai dan sebaliknya, dengan hasil identik di setiap bahasa dan penguraian bertahap untuk aliran TCP.

## Fitur

- Encode dan decode: greeting, pemilihan metode, otentikasi RFC 1929, request, reply, header UDP
- Decode bertahap: ok, incomplete, atau error dengan kode
- Alamat IPv4, IPv6, dan nama domain
- Tanpa soket dan tanpa I/O

## Skenario pemakaian

- Server atau klien proxy dalam bahasa apa pun
- Alat uji dan fuzz untuk implementasi proxy
- Gateway tertanam yang menerjemahkan SOCKS5 ke jalur lain
- Analisis lalu lintas: membaca tangkapan paket SOCKS5

## Instalasi

Belum terbit di registry (0.1.0 belum dirilis). Setelah rilis:

```
npm install lomboksocks5
pip install lomboksocks5
```

## API ringkas

- `encodeGreeting(methods) / decodeGreeting(bytes)`
- `encodeMethodSelection(method) / decodeMethodSelection(bytes)`
- `encodeAuthRequest(user, pass) / decodeAuthRequest(bytes); encodeAuthStatus(status) / decodeAuthStatus(bytes)`
- `encodeRequest({cmd, addr, port}) / decodeRequest(bytes); encodeReply({rep, addr, port}) / decodeReply(bytes)`
- `encodeUdp({frag, addr, port, data}) / decodeUdp(bytes)`
- `Hasil decode: {status:'ok', value, consumed} | {status:'incomplete'} | {status:'error', code}`

Rincian: `docs/API_LombokSOCKS5_v0.1.0.md`.

## Status port

| Port | Status |
|---|---|
| TypeScript (referensi) | YA, lulus seluruh 1030 kasus vector |
| Python | YA, lulus seluruh 1030 kasus vector |
| Rust, Go, PHP | BELUM |

## Standar yang diimplementasikan

Kontrak normatif ada di `docs/SPEC_LombokSOCKS5_v0.1.0.md`; vector di `vectors/lomboksocks5-vectors-v1.json`.

## Batasan yang diketahui

- Hanya codec; tidak ada mesin keadaan atau I/O.
- Domain bukan UTF-8: dipetakan Latin-1; pemanggil mengonversi IDN ke punycode.
- Fragmentasi UDP tidak dirakit.
- Port Rust, Go, PHP BELUM.

## Pengembangan

```
node --test typescript/test/          # TypeScript (Node 22+)
python -m pytest python/tests         # Python 3.10+
node scripts/gen_vectors.ts           # membangkitkan ulang vector dari referensi TypeScript
```

## Ekosistem Lombok

Part of the [Lombok Ecosystem](https://github.com/codinglombok).

## Lisensi

Apache-2.0 OR MIT (lihat `LICENSE-APACHE` dan `LICENSE-MIT`).
