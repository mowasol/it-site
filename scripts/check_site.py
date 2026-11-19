#!/usr/bin/env python3
"""Local files referenced by the site exist, and confidential names are absent."""
import re
import sys
from pathlib import Path

root = Path(__file__).resolve().parents[1]
text_files = [
    root / "index.html",
    root / "404.html",
    root / "styles.css",
    root / "site.js",
    root / "motion.js",
    root / "README.md",
    root / "sitemap.xml",
    root / "robots.txt",
]
banned = [
    "Innotech", "Mitsumi", "JASM", "TSMC", "Sony", "Lattice", "Regulus",
    "イノテック", "ミツミ", "ソニー", "ラティス", "レグルス", "Binetest",
]
attr = re.compile(r"""(?:src|href)=["']([^"']+)["']|srcset=["']([^"']+)["']""")
missing = []
named = []

for path in text_files:
    text = path.read_text(encoding="utf-8")
    for word in banned:
        if word in text:
            named.append(f"{path.name}: {word}")
    if path.suffix not in {".html", ".css"}:
        continue
    for match in attr.finditer(text):
        raw = match.group(1) or match.group(2)
        for part in raw.split(","):
            url = part.strip().split()[0]
            if not url or url.startswith(("#", "mailto:", "tel:", "http:", "https:", "data:")):
                continue
            url = url.split("?")[0].split("#")[0]
            if not (root / url).is_file():
                missing.append(f"{path.name}: {url}")

cname = (root / "CNAME").read_text(encoding="utf-8").strip()
if cname != "it.mowasol.com":
    named.append(f"CNAME is {cname!r}")

visible = re.sub(r"<[^>]+>", "", (root / "index.html").read_text(encoding="utf-8"))
if "診断・ご相談は無料" not in visible:
    named.append("missing 診断・ご相談は無料")
if "熊本の" not in visible or "ITなんでも屋です。" not in visible:
    named.append("hero title phrases missing")

if missing or named:
    print("\n".join(missing + named))
    sys.exit(1)
print("ok")
