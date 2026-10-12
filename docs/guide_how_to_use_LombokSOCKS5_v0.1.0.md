# Usage Guide LombokSOCKS5

## 1. Installation

After release: `npm install lomboksocks5` or `pip install lomboksocks5`. Before release, copy the `typescript/src` folder or `python/src/lomboksocks5` (no dependencies).

## 2. Basic concepts

Every message has an encode and a decode function. Encode takes a value and returns bytes. Decode takes the bytes received so far and returns ok (the value and the number of bytes used), incomplete (wait for more bytes), or error (a code). A TCP stream reader can therefore accumulate bytes and call decode again.

## 3. Examples

`examples/example.ts` and `examples/example.py` produce the following output (TypeScript; Python is identical except for print formatting):

```
greeting 05020002
request 050100030b6578616d706c652e636f6d01bb
partial incomplete
decoded example.com 443 consumed 18
```

TypeScript code:

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

- Server: decodeGreeting, choose a method, send encodeMethodSelection; then decodeRequest and send encodeReply.
- Client: send encodeGreeting and encodeRequest, read replies with decodeMethodSelection and decodeReply.
- UDP relay: wrap each datagram with encodeUdp and read it with decodeUdp.

## 5. Common pitfalls

- Codec only; no state machine or I/O.
- Domain names are not UTF-8: they are mapped as Latin-1; callers convert IDN to punycode.
- UDP fragments are not reassembled.
- Rust, Go and PHP ports: NOT YET.

## 6. See also

`SPEC_LombokSOCKS5_v0.1.0.md`, `API_LombokSOCKS5_v0.1.0.md`, `full_summary_project_LombokSOCKS5_v0.1.0.md`.
