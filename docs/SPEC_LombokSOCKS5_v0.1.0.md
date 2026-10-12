# SPEC LombokSOCKS5 v0.1.0

This document is the normative cross-language contract. Every language port MUST produce byte-identical output for all specified inputs. Deviations from this specification are bugs.

The keywords MUST, SHOULD and MAY are to be read as in RFC 2119. Last reviewed: 2026-10-07.

## 0. Reference standards

This library defines its own contract; there is no normative external standard except those named in the relevant sections.

## 1. Vectors

| File | Cases | SHA-256 |
|---|---|---|
| `vectors/lomboksocks5-vectors-v1.json` | 1030 | `66ce50809247749107d97667c596dcdba3aa018ca32bc25e5121ba0656088465` |

## 2. Contract

1. The SOCKS version is 5; the authentication sub-negotiation version is 1. All multi-byte numbers are big-endian.
2. Greeting: VER, NMETHODS (0..255), METHODS. Method selection: VER, METHOD. Auth request: VER=1, ULEN (1..255), UNAME, PLEN (1..255), PASSWD; auth status: VER=1, STATUS. Request: VER, CMD, RSV=0, ATYP, ADDR, PORT. Reply: VER, REP, RSV=0, ATYP, ADDR, PORT. UDP: RSV (2 bytes)=0, FRAG, ATYP, ADDR, PORT, DATA.
3. ATYP 1: 4-byte IPv4 (text a.b.c.d without leading zeros); ATYP 4: 16-byte IPv6 (decode output is 8 lowercase hex groups without leading zeros and without compression; encode input may use '::' and uppercase, without embedded IPv4 forms); ATYP 3: a length 1..255 followed by the domain name bytes, mapped 1:1 to characters U+0000-U+00FF (Latin-1). CMD, REP, METHOD, STATUS and FRAG are arbitrary bytes; the library does not judge their meaning.
4. Decode checks fields in order and reports an error as soon as the deciding byte is present: bad_version, bad_reserved, bad_atyp, bad_length (zero ULEN, PLEN, or domain length); when there are not enough bytes the result is incomplete. On success, consumed is the number of bytes used (trailing bytes are not consumed); for UDP, consumed is the whole input length and DATA is whatever follows PORT.
5. Encode raises RangeError/ValueError for bytes outside 0..255, ports outside 0..65535, invalid addresses, a domain that is empty or longer than 255 characters or contains characters above U+00FF, and a user/password that is empty or longer than 255 characters.

## 3. Cross-language representation

String indexes and lengths are counted in code points; floating-point numbers use IEEE 754 doubles with the order of operations as written; large integers MUST NOT lose precision.

## 4. Non-goals

Sockets, a negotiation state machine, method selection, data forwarding, UDP fragmentation reassembly, and GSSAPI (method 1) are not part of this library.

## 5. Contract change history

- 0.1.0: initial contract.
