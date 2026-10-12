# API LombokSOCKS5 v0.1.0

Reference language: TypeScript. The Python port uses snake_case names and returns tuples, dicts, or dataclasses with the same content. Stability: 0.x; changes may occur and are noted in the CHANGELOG. Since version: 0.1.0.

- `encodeGreeting(methods) / decodeGreeting(bytes)`
- `encodeMethodSelection(method) / decodeMethodSelection(bytes)`
- `encodeAuthRequest(user, pass) / decodeAuthRequest(bytes); encodeAuthStatus(status) / decodeAuthStatus(bytes)`
- `encodeRequest({cmd, addr, port}) / decodeRequest(bytes); encodeReply({rep, addr, port}) / decodeReply(bytes)`
- `encodeUdp({frag, addr, port, data}) / decodeUdp(bytes)`
- `Decode result: {status:'ok', value, consumed} | {status:'incomplete'} | {status:'error', code}`

Input outside the ranges in the SPEC raises `RangeError` (TypeScript) or `ValueError` (Python); functions defined as total return a special value (null, invalid) as the SPEC states.

Cross-language compatibility: see SPEC section 3 and the vectors.
