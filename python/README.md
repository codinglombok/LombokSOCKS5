# LombokSOCKS5

Zero-dependency SOCKS5 message codec (RFC 1928 and RFC 1929): greeting, method selection, username/password auth, request, reply, and UDP datagram header, with incremental decoding. Part of the Lombok Ecosystem.

## Why this library?

Proxy clients and servers, network test tools, and firmware need correct reading and writing of SOCKS5 messages without pulling in a socket library. This library only converts bytes to values and back, with identical results in every language and incremental parsing for TCP streams.

## Features

- Encode and decode: greeting, method selection, RFC 1929 authentication, request, reply, UDP header
- Incremental decode: ok, incomplete, or error with a code
- IPv4, IPv6, and domain-name addresses
- No sockets and no I/O

## Use cases

- A proxy server or client in any language
- Test and fuzz tools for proxy implementations
- An embedded gateway that translates SOCKS5 to another path
- Traffic analysis: reading SOCKS5 packet captures

## Installation

Not yet published to any registry (0.1.0 has not been released). After release:

```
npm install lomboksocks5
pip install lomboksocks5
```

## API overview

- `encodeGreeting(methods) / decodeGreeting(bytes)`
- `encodeMethodSelection(method) / decodeMethodSelection(bytes)`
- `encodeAuthRequest(user, pass) / decodeAuthRequest(bytes); encodeAuthStatus(status) / decodeAuthStatus(bytes)`
- `encodeRequest({cmd, addr, port}) / decodeRequest(bytes); encodeReply({rep, addr, port}) / decodeReply(bytes)`
- `encodeUdp({frag, addr, port, data}) / decodeUdp(bytes)`
- `Decode result: {status:'ok', value, consumed} | {status:'incomplete'} | {status:'error', code}`

Details: `docs/API_LombokSOCKS5_v0.1.0.md`.

## Port status

| Port | Status |
|---|---|
| TypeScript (reference) | YES, passes all 1030 vector cases |
| Python | YES, passes all 1030 vector cases |
| Rust, Go, PHP | NOT YET |

## Standards implemented

The normative contract is in `docs/SPEC_LombokSOCKS5_v0.1.0.md`; the vectors are in `vectors/lomboksocks5-vectors-v1.json`.

## Known limitations

- Codec only; no state machine or I/O.
- Domain names are not UTF-8: they are mapped as Latin-1; callers convert IDN to punycode.
- UDP fragments are not reassembled.
- Rust, Go and PHP ports: NOT YET.

## Development

```
node --test typescript/test/vectors.test.ts   # TypeScript (Node 22+)
python -m pytest python/tests                 # Python 3.10+
node scripts/gen_vectors.ts                   # regenerate vectors from the TypeScript reference
```

## Lombok Ecosystem

Part of the [Lombok Ecosystem](https://github.com/codinglombok).

## License

Apache-2.0 OR MIT (see `LICENSE-APACHE` and `LICENSE-MIT`).
