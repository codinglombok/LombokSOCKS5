import json
import pathlib
import sys

import pytest

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1] / "src"))
import lomboksocks5 as S  # noqa: E402

V = json.loads((pathlib.Path(__file__).resolve().parents[2] / "vectors" / "lomboksocks5-vectors-v1.json").read_text("utf-8"))

ENC = {
    "Greeting": lambda a: S.encode_greeting(a["methods"]),
    "MethodSelection": lambda a: S.encode_method_selection(a["method"]),
    "AuthRequest": lambda a: S.encode_auth_request(a["user"], a["pass"]),
    "AuthStatus": lambda a: S.encode_auth_status(a["status"]),
    "Request": S.encode_request,
    "Reply": S.encode_reply,
    "Udp": lambda a: S.encode_udp({**a, "data": bytes.fromhex(a["data"])}),
}
DEC = {
    "Greeting": S.decode_greeting, "MethodSelection": S.decode_method_selection, "AuthRequest": S.decode_auth_request,
    "AuthStatus": S.decode_auth_status, "Request": S.decode_request, "Reply": S.decode_reply, "Udp": S.decode_udp,
}


def norm(d):
    if d.get("status") == "ok" and "data" in d["value"]:
        d = {**d, "value": {**d["value"], "data": d["value"]["data"].hex()}}
    return d


def test_count():
    assert V["caseCount"] >= 100


def test_encode():
    for c in V["encode"]:
        if c["error"]:
            with pytest.raises(ValueError):
                ENC[c["fn"]](c["arg"])
        else:
            assert ENC[c["fn"]](c["arg"]).hex() == c["hex"], c["arg"]


def test_decode():
    for c in V["decode"]:
        assert norm(DEC[c["fn"]](bytes.fromhex(c["hex"]))) == c["result"], c
