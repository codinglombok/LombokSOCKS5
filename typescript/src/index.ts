export type Addr = { type: "ipv4" | "ipv6" | "domain"; value: string };
export type Decoded<T> = { status: "ok"; value: T; consumed: number } | { status: "incomplete" } | { status: "error"; code: ErrorCode };
export type ErrorCode = "bad_version" | "bad_reserved" | "bad_atyp" | "bad_length";
export interface Request { cmd: number; addr: Addr; port: number }
export interface Reply { rep: number; addr: Addr; port: number }
export interface UdpDatagram { frag: number; addr: Addr; port: number; data: Uint8Array }

export const CMD_CONNECT = 1;
export const CMD_BIND = 2;
export const CMD_UDP_ASSOCIATE = 3;
export const METHOD_NO_AUTH = 0;
export const METHOD_USER_PASS = 2;
export const METHOD_NONE_ACCEPTABLE = 0xff;

const INC = { status: "incomplete" } as const;
const err = (code: ErrorCode): Decoded<never> => ({ status: "error", code });
function bad(m: string): never {
  throw new RangeError(m);
}
const byte = (n: number, w: string): number => (Number.isInteger(n) && n >= 0 && n <= 255 ? n : bad(`invalid ${w}`));
const port16 = (n: number): number => (Number.isInteger(n) && n >= 0 && n <= 65535 ? n : bad("invalid port"));
function latin1(s: string, min: number, w: string): number[] {
  const out: number[] = [];
  for (const c of s) {
    const cp = c.codePointAt(0) as number;
    if (cp > 255) bad(`${w} must be Latin-1`);
    out.push(cp);
  }
  if (out.length < min || out.length > 255) bad(`invalid ${w} length`);
  return out;
}
const fromLatin1 = (b: Uint8Array): string => Array.from(b, (x) => String.fromCharCode(x)).join("");

function parseIpv4(s: string): number[] | null {
  const m = /^(0|[1-9][0-9]{0,2})\.(0|[1-9][0-9]{0,2})\.(0|[1-9][0-9]{0,2})\.(0|[1-9][0-9]{0,2})$/.exec(s);
  if (!m) return null;
  const o = m.slice(1).map(Number);
  return o.every((x) => x <= 255) ? o : null;
}
function parseIpv6(s: string): number[] | null {
  const halves = s.split("::");
  if (halves.length > 2) return null;
  const parse = (t: string): number[] | null => {
    if (t === "") return [];
    const p = t.split(":");
    return p.every((x) => /^[0-9a-fA-F]{1,4}$/.test(x)) ? p.map((x) => parseInt(x, 16)) : null;
  };
  const l = parse(halves[0]);
  const r = halves.length === 2 ? parse(halves[1]) : [];
  if (l === null || r === null) return null;
  if (halves.length === 2) return l.length + r.length > 7 ? null : [...l, ...new Array<number>(8 - l.length - r.length).fill(0), ...r];
  return l.length === 8 ? l : null;
}

function encodeAddr(a: Addr): number[] {
  if (a.type === "ipv4") {
    const o = parseIpv4(a.value);
    if (!o) bad("invalid ipv4");
    return [1, ...o];
  }
  if (a.type === "ipv6") {
    const g = parseIpv6(a.value);
    if (!g) bad("invalid ipv6");
    return [4, ...g.flatMap((x) => [x >> 8, x & 255])];
  }
  if (a.type === "domain") return [3, ...(() => { const b = latin1(a.value, 1, "domain"); return [b.length, ...b]; })()];
  return bad("invalid address type");
}
/** returns [addr, nextOffset] | "incomplete" | error code */
function decodeAddr(b: Uint8Array, off: number): [Addr, number] | "incomplete" | ErrorCode {
  const t = b[off];
  if (t === 1) {
    if (b.length < off + 5) return "incomplete";
    return [{ type: "ipv4", value: Array.from(b.subarray(off + 1, off + 5)).join(".") }, off + 5];
  }
  if (t === 4) {
    if (b.length < off + 17) return "incomplete";
    const g: string[] = [];
    for (let i = 0; i < 8; i++) g.push(((b[off + 1 + 2 * i] << 8) | b[off + 2 + 2 * i]).toString(16));
    return [{ type: "ipv6", value: g.join(":") }, off + 17];
  }
  if (t === 3) {
    if (b.length < off + 2) return "incomplete";
    const n = b[off + 1];
    if (n === 0) return "bad_length";
    if (b.length < off + 2 + n) return "incomplete";
    return [{ type: "domain", value: fromLatin1(b.subarray(off + 2, off + 2 + n)) }, off + 2 + n];
  }
  return "bad_atyp";
}

export function encodeGreeting(methods: number[]): Uint8Array {
  if (methods.length > 255) bad("too many methods");
  return Uint8Array.from([5, methods.length, ...methods.map((m) => byte(m, "method"))]);
}
export function decodeGreeting(b: Uint8Array): Decoded<{ methods: number[] }> {
  if (b.length < 1) return INC;
  if (b[0] !== 5) return err("bad_version");
  if (b.length < 2) return INC;
  const n = b[1];
  if (b.length < 2 + n) return INC;
  return { status: "ok", value: { methods: Array.from(b.subarray(2, 2 + n)) }, consumed: 2 + n };
}
export function encodeMethodSelection(method: number): Uint8Array {
  return Uint8Array.from([5, byte(method, "method")]);
}
export function decodeMethodSelection(b: Uint8Array): Decoded<{ method: number }> {
  if (b.length < 1) return INC;
  if (b[0] !== 5) return err("bad_version");
  if (b.length < 2) return INC;
  return { status: "ok", value: { method: b[1] }, consumed: 2 };
}
export function encodeAuthRequest(user: string, pass: string): Uint8Array {
  const u = latin1(user, 1, "user");
  const p = latin1(pass, 1, "password");
  return Uint8Array.from([1, u.length, ...u, p.length, ...p]);
}
export function decodeAuthRequest(b: Uint8Array): Decoded<{ user: string; pass: string }> {
  if (b.length < 1) return INC;
  if (b[0] !== 1) return err("bad_version");
  if (b.length < 2) return INC;
  const ul = b[1];
  if (ul === 0) return err("bad_length");
  if (b.length < 3 + ul) return INC;
  const pl = b[2 + ul];
  if (pl === 0) return err("bad_length");
  if (b.length < 3 + ul + pl) return INC;
  return { status: "ok", value: { user: fromLatin1(b.subarray(2, 2 + ul)), pass: fromLatin1(b.subarray(3 + ul, 3 + ul + pl)) }, consumed: 3 + ul + pl };
}
export function encodeAuthStatus(status: number): Uint8Array {
  return Uint8Array.from([1, byte(status, "status")]);
}
export function decodeAuthStatus(b: Uint8Array): Decoded<{ status: number }> {
  if (b.length < 1) return INC;
  if (b[0] !== 1) return err("bad_version");
  if (b.length < 2) return INC;
  return { status: "ok", value: { status: b[1] }, consumed: 2 };
}

function encodeMsg(second: number, a: Addr, port: number): Uint8Array {
  const addr = encodeAddr(a);
  const p = port16(port);
  return Uint8Array.from([5, byte(second, "code"), 0, ...addr, p >> 8, p & 255]);
}
function decodeMsg(b: Uint8Array): Decoded<{ code: number; addr: Addr; port: number }> {
  if (b.length < 1) return INC;
  if (b[0] !== 5) return err("bad_version");
  if (b.length < 3) return INC;
  if (b[2] !== 0) return err("bad_reserved");
  if (b.length < 4) return INC;
  const r = decodeAddr(b, 3);
  if (r === "incomplete") return INC;
  if (typeof r === "string") return err(r);
  const [addr, end] = r;
  if (b.length < end + 2) return INC;
  return { status: "ok", value: { code: b[1], addr, port: (b[end] << 8) | b[end + 1] }, consumed: end + 2 };
}
export function encodeRequest(r: Request): Uint8Array {
  return encodeMsg(r.cmd, r.addr, r.port);
}
export function decodeRequest(b: Uint8Array): Decoded<Request> {
  const d = decodeMsg(b);
  return d.status === "ok" ? { status: "ok", value: { cmd: d.value.code, addr: d.value.addr, port: d.value.port }, consumed: d.consumed } : d;
}
export function encodeReply(r: Reply): Uint8Array {
  return encodeMsg(r.rep, r.addr, r.port);
}
export function decodeReply(b: Uint8Array): Decoded<Reply> {
  const d = decodeMsg(b);
  return d.status === "ok" ? { status: "ok", value: { rep: d.value.code, addr: d.value.addr, port: d.value.port }, consumed: d.consumed } : d;
}
export function encodeUdp(u: UdpDatagram): Uint8Array {
  const addr = encodeAddr(u.addr);
  const p = port16(u.port);
  return Uint8Array.from([0, 0, byte(u.frag, "frag"), ...addr, p >> 8, p & 255, ...u.data]);
}
export function decodeUdp(b: Uint8Array): Decoded<UdpDatagram> {
  if (b.length >= 1 && b[0] !== 0) return err("bad_reserved");
  if (b.length >= 2 && b[1] !== 0) return err("bad_reserved");
  if (b.length < 4) return INC;
  const r = decodeAddr(b, 3);
  if (r === "incomplete") return INC;
  if (typeof r === "string") return err(r);
  const [addr, end] = r;
  if (b.length < end + 2) return INC;
  return { status: "ok", value: { frag: b[2], addr, port: (b[end] << 8) | b[end + 1], data: b.slice(end + 2) }, consumed: b.length };
}
