from __future__ import annotations

import re
from typing import Any, Optional

CMD_CONNECT, CMD_BIND, CMD_UDP_ASSOCIATE = 1, 2, 3
METHOD_NO_AUTH, METHOD_USER_PASS, METHOD_NONE_ACCEPTABLE = 0, 2, 0xFF
_INC = {"status": "incomplete"}


def _err(code: str) -> dict:
    return {"status": "error", "code": code}


def _bad(m: str):
    raise ValueError(m)


def _byte(n: int, w: str) -> int:
    if not isinstance(n, int) or isinstance(n, bool) or not 0 <= n <= 255:
        _bad(f"invalid {w}")
    return n


def _port(n: int) -> int:
    if not isinstance(n, int) or isinstance(n, bool) or not 0 <= n <= 65535:
        _bad("invalid port")
    return n


def _latin1(s: str, mn: int, w: str) -> list[int]:
    out = [ord(c) for c in s]
    if any(c > 255 for c in out):
        _bad(f"{w} must be Latin-1")
    if not mn <= len(out) <= 255:
        _bad(f"invalid {w} length")
    return out


def _from_latin1(b: bytes) -> str:
    return "".join(chr(x) for x in b)


_V4 = re.compile(r"(0|[1-9][0-9]{0,2})\.(0|[1-9][0-9]{0,2})\.(0|[1-9][0-9]{0,2})\.(0|[1-9][0-9]{0,2})")
_HEX = re.compile(r"[0-9a-fA-F]{1,4}")


def _ipv4(s: str) -> Optional[list[int]]:
    m = _V4.fullmatch(s)
    if not m:
        return None
    o = [int(x) for x in m.groups()]
    return o if all(x <= 255 for x in o) else None


def _ipv6(s: str) -> Optional[list[int]]:
    halves = s.split("::")
    if len(halves) > 2:
        return None

    def parse(t: str) -> Optional[list[int]]:
        if t == "":
            return []
        p = t.split(":")
        return [int(x, 16) for x in p] if all(_HEX.fullmatch(x) for x in p) else None

    l = parse(halves[0])
    r = parse(halves[1]) if len(halves) == 2 else []
    if l is None or r is None:
        return None
    if len(halves) == 2:
        return None if len(l) + len(r) > 7 else l + [0] * (8 - len(l) - len(r)) + r
    return l if len(l) == 8 else None


def _encode_addr(a: dict) -> list[int]:
    t, v = a.get("type"), a.get("value")
    if t == "ipv4":
        o = _ipv4(v)
        if o is None:
            _bad("invalid ipv4")
        return [1] + o
    if t == "ipv6":
        g = _ipv6(v)
        if g is None:
            _bad("invalid ipv6")
        return [4] + [y for x in g for y in (x >> 8, x & 255)]
    if t == "domain":
        b = _latin1(v, 1, "domain")
        return [3, len(b)] + b
    _bad("invalid address type")


def _decode_addr(b: bytes, off: int):
    t = b[off]
    if t == 1:
        if len(b) < off + 5:
            return "incomplete"
        return {"type": "ipv4", "value": ".".join(str(x) for x in b[off + 1 : off + 5])}, off + 5
    if t == 4:
        if len(b) < off + 17:
            return "incomplete"
        g = [format((b[off + 1 + 2 * i] << 8) | b[off + 2 + 2 * i], "x") for i in range(8)]
        return {"type": "ipv6", "value": ":".join(g)}, off + 17
    if t == 3:
        if len(b) < off + 2:
            return "incomplete"
        n = b[off + 1]
        if n == 0:
            return "bad_length"
        if len(b) < off + 2 + n:
            return "incomplete"
        return {"type": "domain", "value": _from_latin1(b[off + 2 : off + 2 + n])}, off + 2 + n
    return "bad_atyp"


def encode_greeting(methods: list[int]) -> bytes:
    if len(methods) > 255:
        _bad("too many methods")
    return bytes([5, len(methods)] + [_byte(m, "method") for m in methods])


def decode_greeting(b: bytes) -> dict:
    if len(b) < 1:
        return _INC
    if b[0] != 5:
        return _err("bad_version")
    if len(b) < 2:
        return _INC
    n = b[1]
    if len(b) < 2 + n:
        return _INC
    return {"status": "ok", "value": {"methods": list(b[2 : 2 + n])}, "consumed": 2 + n}


def encode_method_selection(method: int) -> bytes:
    return bytes([5, _byte(method, "method")])


def decode_method_selection(b: bytes) -> dict:
    if len(b) < 1:
        return _INC
    if b[0] != 5:
        return _err("bad_version")
    if len(b) < 2:
        return _INC
    return {"status": "ok", "value": {"method": b[1]}, "consumed": 2}


def encode_auth_request(user: str, password: str) -> bytes:
    u, p = _latin1(user, 1, "user"), _latin1(password, 1, "password")
    return bytes([1, len(u)] + u + [len(p)] + p)


def decode_auth_request(b: bytes) -> dict:
    if len(b) < 1:
        return _INC
    if b[0] != 1:
        return _err("bad_version")
    if len(b) < 2:
        return _INC
    ul = b[1]
    if ul == 0:
        return _err("bad_length")
    if len(b) < 3 + ul:
        return _INC
    pl = b[2 + ul]
    if pl == 0:
        return _err("bad_length")
    if len(b) < 3 + ul + pl:
        return _INC
    return {"status": "ok", "value": {"user": _from_latin1(b[2 : 2 + ul]), "pass": _from_latin1(b[3 + ul : 3 + ul + pl])}, "consumed": 3 + ul + pl}


def encode_auth_status(status: int) -> bytes:
    return bytes([1, _byte(status, "status")])


def decode_auth_status(b: bytes) -> dict:
    if len(b) < 1:
        return _INC
    if b[0] != 1:
        return _err("bad_version")
    if len(b) < 2:
        return _INC
    return {"status": "ok", "value": {"status": b[1]}, "consumed": 2}


def _encode_msg(second: int, a: dict, port: int) -> bytes:
    addr = _encode_addr(a)
    p = _port(port)
    return bytes([5, _byte(second, "code"), 0] + addr + [p >> 8, p & 255])


def _decode_msg(b: bytes):
    if len(b) < 1:
        return _INC
    if b[0] != 5:
        return _err("bad_version")
    if len(b) < 3:
        return _INC
    if b[2] != 0:
        return _err("bad_reserved")
    if len(b) < 4:
        return _INC
    r = _decode_addr(b, 3)
    if r == "incomplete":
        return _INC
    if isinstance(r, str):
        return _err(r)
    addr, end = r
    if len(b) < end + 2:
        return _INC
    return {"status": "ok", "code": b[1], "addr": addr, "port": (b[end] << 8) | b[end + 1], "consumed": end + 2}


def encode_request(r: dict) -> bytes:
    return _encode_msg(r["cmd"], r["addr"], r["port"])


def decode_request(b: bytes) -> dict:
    d = _decode_msg(b)
    if d["status"] != "ok":
        return d
    return {"status": "ok", "value": {"cmd": d["code"], "addr": d["addr"], "port": d["port"]}, "consumed": d["consumed"]}


def encode_reply(r: dict) -> bytes:
    return _encode_msg(r["rep"], r["addr"], r["port"])


def decode_reply(b: bytes) -> dict:
    d = _decode_msg(b)
    if d["status"] != "ok":
        return d
    return {"status": "ok", "value": {"rep": d["code"], "addr": d["addr"], "port": d["port"]}, "consumed": d["consumed"]}


def encode_udp(u: dict) -> bytes:
    addr = _encode_addr(u["addr"])
    p = _port(u["port"])
    return bytes([0, 0, _byte(u["frag"], "frag")] + addr + [p >> 8, p & 255]) + bytes(u["data"])


def decode_udp(b: bytes) -> dict:
    if len(b) >= 1 and b[0] != 0:
        return _err("bad_reserved")
    if len(b) >= 2 and b[1] != 0:
        return _err("bad_reserved")
    if len(b) < 4:
        return _INC
    r = _decode_addr(b, 3)
    if r == "incomplete":
        return _INC
    if isinstance(r, str):
        return _err(r)
    addr, end = r
    if len(b) < end + 2:
        return _INC
    return {"status": "ok", "value": {"frag": b[2], "addr": addr, "port": (b[end] << 8) | b[end + 1], "data": bytes(b[end + 2 :])}, "consumed": len(b)}
