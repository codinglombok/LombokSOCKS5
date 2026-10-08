# Struktur Repo LombokSOCKS5

## 1. Struktur folder

```
LombokSOCKS5/
  README.md  CHANGELOG.md  LICENSE-APACHE  LICENSE-MIT  version.txt  .gitignore
  docs/        dokumen standar (masterplan_ dan architecture_ internal, tidak di-commit)
  vectors/     lomboksocks5-vectors-v1.json  kontrak lintas bahasa
  typescript/  package.json  tsconfig*.json  src/index.ts  test/vectors.test.ts
  python/      pyproject.toml  src/lomboksocks5/__init__.py  tests/test_vectors.py
  scripts/     gen_vectors.ts  membangkitkan vector dari referensi TypeScript
  examples/    example.ts  example.py  OUTPUT.txt
```

## 2. Konvensi penamaan

Repo `LombokSOCKS5`; paket npm/PyPI `lomboksocks5`; dokumen `<jenis>_LombokSOCKS5_v<semver>.md`.

## 3. Berkas wajib di root

README.md, CHANGELOG.md, LICENSE-APACHE, LICENSE-MIT, version.txt, .gitignore (ADR-024).

## 4. Struktur per port

TypeScript: satu modul `src/index.ts`, tanpa dependensi runtime. Python: satu paket `src/lomboksocks5`, tanpa dependensi.

## 5. Catatan

Port Rust, Go, PHP belum ada; foldernya baru dibuat saat port memiliki runner vector (GP-11).
