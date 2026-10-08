import pathlib, sys
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1] / "python" / "src"))
from lomboksocks5 import decode_request, encode_greeting, encode_request

print("greeting", encode_greeting([0, 2]).hex())
req = encode_request({"cmd": 1, "addr": {"type": "domain", "value": "example.com"}, "port": 443})
print("request", req.hex())
print("partial", decode_request(req[:6])["status"])
d = decode_request(req)
if d["status"] == "ok":
    print("decoded", d["value"]["addr"]["value"], d["value"]["port"], "consumed", d["consumed"])
