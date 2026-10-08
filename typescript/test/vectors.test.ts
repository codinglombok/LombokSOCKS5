import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import * as S from "../src/index.ts";

/* eslint-disable @typescript-eslint/no-explicit-any */
const v = JSON.parse(readFileSync(new URL("../../vectors/lomboksocks5-vectors-v1.json", import.meta.url), "utf8"));
const hex = (b: Uint8Array): string => Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
const unhex = (h: string): Uint8Array => Uint8Array.from(h.match(/../g) ?? [], (x) => parseInt(x, 16));
const norm = (d: any): any => JSON.parse(JSON.stringify(d, (_k, x) => (x instanceof Uint8Array ? hex(x) : x)));
const enc: Record<string, (a: any) => Uint8Array> = {
  Greeting: (a) => S.encodeGreeting(a.methods), MethodSelection: (a) => S.encodeMethodSelection(a.method),
  AuthRequest: (a) => S.encodeAuthRequest(a.user, a.pass), AuthStatus: (a) => S.encodeAuthStatus(a.status),
  Request: (a) => S.encodeRequest(a), Reply: (a) => S.encodeReply(a), Udp: (a) => S.encodeUdp({ ...a, data: unhex(a.data) }),
};
const dec: Record<string, (b: Uint8Array) => any> = {
  Greeting: S.decodeGreeting, MethodSelection: S.decodeMethodSelection, AuthRequest: S.decodeAuthRequest,
  AuthStatus: S.decodeAuthStatus, Request: S.decodeRequest, Reply: S.decodeReply, Udp: S.decodeUdp,
};

test("vector count >= 100", () => assert.ok(v.caseCount >= 100));
test("encode", () => {
  for (const c of v.encode) {
    if (c.error) assert.throws(() => enc[c.fn](c.arg), RangeError, JSON.stringify(c.arg));
    else assert.equal(hex(enc[c.fn](c.arg)), c.hex, JSON.stringify(c.arg));
  }
});
test("decode", () => {
  for (const c of v.decode) assert.deepEqual(norm(dec[c.fn](unhex(c.hex))), c.result, `${c.fn} ${c.hex}`);
});
test("roundtrip request", () => {
  const r = { cmd: 1, addr: { type: "domain" as const, value: "example.com" }, port: 443 };
  const d = S.decodeRequest(S.encodeRequest(r));
  assert.deepEqual(d.status === "ok" ? d.value : null, r);
});
