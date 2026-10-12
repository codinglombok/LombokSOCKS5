# Project Summary LombokSOCKS5

## What it is

Zero-dependency SOCKS5 message codec (RFC 1928 and RFC 1929): greeting, method selection, username/password auth, request, reply, and UDP datagram header, with incremental decoding. Part of the Lombok Ecosystem.

## Why it exists

Proxy clients and servers, network test tools, and firmware need correct reading and writing of SOCKS5 messages without pulling in a socket library. This library only converts bytes to values and back, with identical results in every language and incremental parsing for TCP streams.

## Main features

- Encode and decode: greeting, method selection, RFC 1929 authentication, request, reply, UDP header
- Incremental decode: ok, incomplete, or error with a code
- IPv4, IPv6, and domain-name addresses
- No sockets and no I/O

## Current status

Version 0.1.0, not yet released. TypeScript and Python pass 1030 vector cases. No other ports exist.

## Example use cases

- A proxy server or client in any language
- Test and fuzz tools for proxy implementations
- An embedded gateway that translates SOCKS5 to another path
- Traffic analysis: reading SOCKS5 packet captures

## Known Limitations

- Codec only; no state machine or I/O.
- Domain names are not UTF-8: they are mapped as Latin-1; callers convert IDN to punycode.
- UDP fragments are not reassembled.
- Rust, Go and PHP ports: NOT YET.

## Further information

SPEC: `SPEC_LombokSOCKS5_v0.1.0.md`; API: `API_LombokSOCKS5_v0.1.0.md`; guide: `guide_how_to_use_LombokSOCKS5_v0.1.0.md`.

## Gap versus comparable libraries

Comparable: SOCKS packages in the Node ecosystem, golang.org/x/net/internal/socks, PySocks, fast-socks5. Honest gap: not a complete client/server; strengths: a byte-identical cross-language contract and incremental decoding without sockets.
