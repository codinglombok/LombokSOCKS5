# API LombokSOCKS5 v0.1.0

Bahasa referensi: TypeScript. Port Python memakai penamaan snake_case dan mengembalikan tuple atau dataclass dengan isi yang sama. Stabilitas: 0.x, perubahan dapat terjadi dengan catatan di CHANGELOG. Sejak versi: 0.1.0.

- `encodeGreeting(methods) / decodeGreeting(bytes)`
- `encodeMethodSelection(method) / decodeMethodSelection(bytes)`
- `encodeAuthRequest(user, pass) / decodeAuthRequest(bytes); encodeAuthStatus(status) / decodeAuthStatus(bytes)`
- `encodeRequest({cmd, addr, port}) / decodeRequest(bytes); encodeReply({rep, addr, port}) / decodeReply(bytes)`
- `encodeUdp({frag, addr, port, data}) / decodeUdp(bytes)`
- `Hasil decode: {status:'ok', value, consumed} | {status:'incomplete'} | {status:'error', code}`

Kesalahan masukan di luar rentang SPEC memicu `RangeError` (TypeScript) atau `ValueError` (Python); fungsi yang didefinisikan total mengembalikan nilai khusus (null, invalid) sesuai SPEC.

Kompatibilitas lintas bahasa: lihat SPEC bagian 3 dan vector.
