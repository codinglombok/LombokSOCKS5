# Distribusi LombokSOCKS5

Semua perintah PowerShell. Kebijakan: rilis hanya lewat tag dan workflow bersama (ADR-011, ADR-020); jangan publish manual dari folder lokal.

## 1. Upload pertama (bootstrap)

```powershell
$Org='codinglombok'; $Repo='LombokSOCKS5'
$Desc="Zero-dependency SOCKS5 message codec (RFC 1928 and RFC 1929): greeting, method selection, username/password auth, request, reply, and UDP datagram header, with incremental decoding. Part of the Lombok Ecosystem."
gh repo create "$Org/$Repo" --public --description $Desc --source . --remote origin
gh repo edit "$Org/$Repo" --add-topic lombok-ecosystem --add-topic level-l0
git add -A ; git commit -m "feat: $Repo v0.1.0" ; git push -u origin main
```

Repo online adalah sumber rilis. Pastikan `git ls-files` tidak memuat `docs/*architecture*` dan `docs/*masterplan*`.

## 2. Alur rilis reguler

feat/fix commit ke main, PR release-please, merge, tag `v<semver>`, workflow rilis membaca versi dari tag. Prasyarat: TD-P0-08 (repo `codinglombok/.github` dengan workflow reusable) selesai.

## 3. Publish per registry

| Registry | Nama | Manifest | Pemeriksaan sebelum rilis |
|---|---|---|---|
| npm | `lomboksocks5` | `typescript/package.json` | `npm pack --dry-run` |
| PyPI | `lomboksocks5` | `python/pyproject.toml` | `python -m build` lalu `twine check dist/*` |

Rust, Go, PHP: belum ada port.

## 4. Server/VPS, Docker, shared hosting

Tidak berlaku: library tanpa proses layanan.

## 5. Lokal

```powershell
node --test typescript/test/vectors.test.ts
python -m pytest python/tests
```

## 6. Verifikasi

`lombok doctor docs` (belum tersedia, TD-P0-08). Sementara: jalankan kedua runner vector dan periksa hash vector di SPEC bagian 1.
