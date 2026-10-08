# SPEC LombokSOCKS5 v0.1.0

This document is the normative cross-language contract. Every language port MUST produce byte-identical output for all specified inputs. Deviations from this specification are bugs.

Kata MUST, SHOULD, dan MAY dibaca sesuai RFC 2119. Tinjauan terakhir: 2026-10-07.

## 0. Standar acuan

Library ini mendefinisikan kontraknya sendiri; tidak ada standar eksternal normatif kecuali yang disebut pada bagian terkait.

## 1. Vector

| Berkas | Kasus | SHA-256 |
|---|---|---|
| `vectors/lomboksocks5-vectors-v1.json` | 1030 | `66ce50809247749107d97667c596dcdba3aa018ca32bc25e5121ba0656088465` |

## 2. Kontrak

1. Versi SOCKS adalah 5; versi sub-negosiasi otentikasi adalah 1. Semua bilangan multi-byte big-endian.
2. Greeting: VER, NMETHODS (0..255), METHODS. Pemilihan metode: VER, METHOD. Auth request: VER=1, ULEN (1..255), UNAME, PLEN (1..255), PASSWD; auth status: VER=1, STATUS. Request: VER, CMD, RSV=0, ATYP, ADDR, PORT. Reply: VER, REP, RSV=0, ATYP, ADDR, PORT. UDP: RSV(2 byte)=0, FRAG, ATYP, ADDR, PORT, DATA.
3. ATYP 1: 4 byte IPv4 (teks a.b.c.d tanpa nol di depan); ATYP 4: 16 byte IPv6 (keluaran decode 8 grup heksa huruf kecil tanpa nol di depan dan tanpa kompresi; masukan encode boleh memakai '::' dan huruf besar, tanpa bentuk IPv4 tertanam); ATYP 3: panjang 1..255 lalu byte nama domain, dipetakan 1:1 ke karakter U+0000-U+00FF (Latin-1). Nilai CMD, REP, METHOD, STATUS, FRAG adalah byte apa saja; library tidak menilai maknanya.
4. Decode memeriksa berurutan dan melaporkan kesalahan segera setelah byte penentunya ada: bad_version, bad_reserved, bad_atyp, bad_length (ULEN, PLEN, atau panjang domain nol); bila byte belum cukup hasilnya incomplete. Bila sukses, consumed adalah jumlah byte yang dipakai (byte sisa tidak dikonsumsi); untuk UDP, consumed adalah seluruh panjang masukan dan DATA adalah sisa setelah PORT.
5. Encode melempar RangeError/ValueError untuk byte di luar 0..255, port di luar 0..65535, alamat tidak sah, domain kosong atau lebih dari 255 karakter atau berisi karakter di atas U+00FF, user/password kosong atau lebih dari 255 karakter.

## 3. Representasi lintas bahasa

Indeks dan panjang string dihitung per code point; angka floating point memakai IEEE 754 double dengan urutan operasi seperti tertulis; bilangan bulat besar tidak boleh kehilangan presisi.

## 4. Non-goals

Soket, mesin keadaan negosiasi, pemilihan metode, penerusan data, fragmentasi UDP, dan GSSAPI (metode 1) bukan bagian library ini.

## 5. Riwayat perubahan kontrak

- 0.1.0: kontrak awal.
