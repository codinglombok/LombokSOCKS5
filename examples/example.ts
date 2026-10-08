import { decodeRequest, encodeGreeting, encodeRequest } from "../typescript/src/index.ts";

const hex = (b: Uint8Array): string => Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
console.log("greeting", hex(encodeGreeting([0, 2])));
const req = encodeRequest({ cmd: 1, addr: { type: "domain", value: "example.com" }, port: 443 });
console.log("request", hex(req));
console.log("partial", decodeRequest(req.subarray(0, 6)).status);
const d = decodeRequest(req);
if (d.status === "ok") console.log("decoded", d.value.addr.value, d.value.port, "consumed", d.consumed);
