import { writeFileSync } from "node:fs";
import * as S from "../typescript/src/index.ts";

const hex = (b: Uint8Array): string => Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
const unhex = (h: string): Uint8Array => Uint8Array.from(h.match(/../g) ?? [], (x) => parseInt(x, 16));
const norm = (d: any): any => JSON.parse(JSON.stringify(d, (_k, v) => (v instanceof Uint8Array ? hex(v) : v)));

type Fn = { enc: (a: any) => Uint8Array; dec: (b: Uint8Array) => any; prep?: (a: any) => any };
const fns: Record<string, Fn> = {
  Greeting: { enc: (a) => S.encodeGreeting(a.methods), dec: S.decodeGreeting },
  MethodSelection: { enc: (a) => S.encodeMethodSelection(a.method), dec: S.decodeMethodSelection },
  AuthRequest: { enc: (a) => S.encodeAuthRequest(a.user, a.pass), dec: S.decodeAuthRequest },
  AuthStatus: { enc: (a) => S.encodeAuthStatus(a.status), dec: S.decodeAuthStatus },
  Request: { enc: (a) => S.encodeRequest(a), dec: S.decodeRequest },
  Reply: { enc: (a) => S.encodeReply(a), dec: S.decodeReply },
  Udp: { enc: (a) => S.encodeUdp({ ...a, data: unhex(a.data) }), dec: S.decodeUdp },
};
const v4 = { type: "ipv4", value: "192.0.2.10" }, v6 = { type: "ipv6", value: "2001:db8::1" }, dom = { type: "domain", value: "example.com" };
const encArgs: Record<string, any[]> = {
  Greeting: [{ methods: [] }, { methods: [0] }, { methods: [0, 2] }, { methods: [0, 1, 2, 255] }, { methods: Array.from({ length: 255 }, (_, i) => i) }, { methods: Array.from({ length: 256 }, () => 0) }, { methods: [256] }, { methods: [-1] }, { methods: [1.5] }],
  MethodSelection: [{ method: 0 }, { method: 2 }, { method: 255 }, { method: 256 }, { method: -1 }],
  AuthRequest: [{ user: "u", pass: "p" }, { user: "alice", pass: "s3cret" }, { user: "\u00e9", pass: "\u00ff" }, { user: "", pass: "p" }, { user: "u", pass: "" }, { user: "a".repeat(255), pass: "b".repeat(255) }, { user: "a".repeat(256), pass: "p" }, { user: "\u4e2d", pass: "p" }, { user: "u", pass: "\ud83d\ude00" }],
  AuthStatus: [{ status: 0 }, { status: 1 }, { status: 255 }, { status: 256 }],
  Request: [
    { cmd: 1, addr: v4, port: 80 }, { cmd: 1, addr: v6, port: 443 }, { cmd: 1, addr: dom, port: 8080 }, { cmd: 3, addr: { type: "ipv4", value: "0.0.0.0" }, port: 0 },
    { cmd: 2, addr: { type: "ipv6", value: "::" }, port: 65535 }, { cmd: 1, addr: { type: "ipv6", value: "1:2:3:4:5:6:7:8" }, port: 1 }, { cmd: 1, addr: { type: "ipv6", value: "ABCD::EF" }, port: 1 },
    { cmd: 1, addr: { type: "domain", value: "a".repeat(255) }, port: 1 }, { cmd: 1, addr: { type: "domain", value: "a".repeat(256) }, port: 1 }, { cmd: 1, addr: { type: "domain", value: "" }, port: 1 },
    { cmd: 1, addr: { type: "domain", value: "caf\u00e9" }, port: 1 }, { cmd: 1, addr: { type: "domain", value: "\u4e2d" }, port: 1 },
    { cmd: 1, addr: { type: "ipv4", value: "1.2.3" }, port: 1 }, { cmd: 1, addr: { type: "ipv4", value: "256.1.1.1" }, port: 1 }, { cmd: 1, addr: { type: "ipv4", value: "01.2.3.4" }, port: 1 },
    { cmd: 1, addr: { type: "ipv6", value: "1::2::3" }, port: 1 }, { cmd: 1, addr: { type: "ipv6", value: "::1.2.3.4" }, port: 1 }, { cmd: 1, addr: { type: "ipv6", value: "1:2:3:4:5:6:7" }, port: 1 },
    { cmd: 1, addr: { type: "ipv6", value: "1:2:3:4:5:6:7::8" }, port: 1 }, { cmd: 1, addr: { type: "ipx", value: "x" }, port: 1 },
    { cmd: 1, addr: v4, port: 65536 }, { cmd: 1, addr: v4, port: -1 }, { cmd: 256, addr: v4, port: 1 }, { cmd: 255, addr: v4, port: 258 }, { cmd: 1, addr: { type: "ipv4", value: "255.255.255.255" }, port: 1 }, { cmd: 1, addr: { type: "ipv4", value: "1.255.2.3" }, port: 1 },
  ],
  Reply: [{ rep: 0, addr: v4, port: 1080 }, { rep: 0, addr: v6, port: 1 }, { rep: 5, addr: dom, port: 0 }, { rep: 8, addr: { type: "ipv4", value: "0.0.0.0" }, port: 0 }, { rep: 256, addr: v4, port: 1 }],
  Udp: [
    { frag: 0, addr: v4, port: 53, data: "" }, { frag: 0, addr: dom, port: 53, data: "deadbeef" }, { frag: 3, addr: v6, port: 5353, data: "00" }, { frag: 0, addr: v4, port: 1, data: "ff".repeat(100) },
    { frag: 256, addr: v4, port: 1, data: "" }, { frag: 0, addr: { type: "domain", value: "" }, port: 1, data: "" },
  ],
};
const errs = (f: () => unknown): boolean => { try { f(); return false; } catch (e) { return e instanceof RangeError; } };
const encode: any[] = [];
const goodHex: Record<string, string[]> = {};
for (const [k, list] of Object.entries(encArgs)) {
  goodHex[k] = [];
  for (const a of list) {
    let h: string | null = null;
    try { h = hex(fns[k].enc(a)); } catch (e) { if (!(e instanceof RangeError)) throw e; }
    encode.push({ fn: k, arg: a, hex: h, error: h === null });
    if (h !== null) goodHex[k].push(h);
  }
}
const decode: any[] = [];
const add = (k: string, h: string): void => { decode.push({ fn: k, hex: h, result: norm(fns[k].dec(unhex(h))) }); };
for (const [k, hs] of Object.entries(goodHex)) {
  hs.forEach((h, idx) => {
    add(k, h);
    add(k, h + "ff");
    if (idx < 4 || k === "Udp") for (let n = 0; n < h.length / 2; n++) add(k, h.slice(0, n * 2));
  });
}
const extra: [string, string][] = [
  ["Greeting", "0400"], ["MethodSelection", "04"], ["AuthRequest", "02"], ["AuthStatus", "02"], ["Request", "04"], ["Reply", "04"], ["Reply", "05"], ["Request", "05"], ["Udp", "00"], ["Greeting", "05"], ["Request", "0501"], ["Greeting", "04"], ["Greeting", "050200"], ["MethodSelection", "0400"], ["MethodSelection", "05"],
  ["AuthRequest", "0201"], ["AuthRequest", "0100"], ["AuthRequest", "010161" + "00"], ["AuthRequest", "0101610170"], ["AuthRequest", "01016101"], ["AuthStatus", "0200"], ["AuthStatus", "01"],
  ["Request", "04010001"], ["Request", "050100"], ["Request", "050101"], ["Request", "05010001"], ["Request", "050100" + "02" + "0000"], ["Request", "05010005" + "00"], ["Request", "050100030000" + "0050"], ["Request", "0501000300"],
  ["Request", "05010003" + "01" + "61"], ["Request", "05010003" + "01" + "61" + "0050"], ["Request", "0501000100"], ["Request", "050100010a000001"], ["Request", "05010001" + "0a000001" + "0050" + "99"], ["Request", "050100ff"],
  ["Reply", "05000004" + "00".repeat(16) + "0050"], ["Reply", "0500000100000000"], ["Reply", "05ff000100000000" + "0000"],
  ["Udp", "01"], ["Udp", "0001"], ["Udp", "0000"], ["Udp", "000000"], ["Udp", "0000000500"], ["Udp", "000000" + "01" + "7f000001" + "0035"], ["Udp", "0000000300"], ["Udp", "000000" + "03" + "0161" + "0035" + "00ff"],
];
for (const [k, h] of extra) add(k, h);
const caseCount = encode.length + decode.length;
writeFileSync(new URL("../vectors/lomboksocks5-vectors-v1.json", import.meta.url), JSON.stringify({ version: 1, caseCount, encode, decode }, null, 1) + "\n");
const st: Record<string, number> = {};
for (const d of decode) st[d.result.status] = (st[d.result.status] ?? 0) + 1;
console.log("cases", caseCount, "enc errors", encode.filter((e) => e.error).length, st);
