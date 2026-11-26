#!/usr/bin/env python3
"""Local files referenced by the site exist, and confidential names are absent."""
import re
import sys
from pathlib import Path

root = Path(__file__).resolve().parents[1]
text_files = [
    root / "index.html",
    root / "privacy.html",
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
    "イノテック", "ミツミ", "ソニー", "ラティス", "レグルス", "Binetest", "Toyako", "toyako",
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

html = (root / "index.html").read_text(encoding="utf-8")
visible = re.sub(r"<[^>]+>", "", html)
if "診断・ご相談は無料" not in visible:
    named.append("missing 診断・ご相談は無料")
if "AIとデジタルのmowa" not in visible or "パソコン・スマホの困りごとから、アプリ開発まで" not in visible:
    named.append("brand name or tagline missing")
if "受託開発" not in visible:
    named.append("受託開発 missing")
if "パソコン修理・業務アプリ・AI導入と、半導体テスト装置" in visible:
    named.append("old tagline still visible")
if "スマホの修理" in visible or "パソコン・スマホの修理" in visible:
    named.append("smartphone repair still offered")
if "見積り" in visible:
    named.append("見積り should be 見積もり")
if re.search(r"(?<![A-Za-z])DX(?![A-Za-z])", visible):
    named.append("DX is used")
if "ITなんでも屋" in visible or "なんでも屋" in visible:
    named.append("old shop name still visible")
if "privacy.html" not in html:
    named.append("privacy link missing")
if not (root / "favicon.ico").is_file():
    named.append("favicon.ico missing")

desc = "熊本県菊池郡大津町のAIとデジタルのmowa（mowaソリューションズ株式会社）です。受託開発・アプリ開発・AI導入を中心に、パソコンの修理・設定やスマホの設定のご相談まで対応します。診断・ご相談は無料です。"
meta_descs = re.findall(r'<meta (?:name="description"|property="og:description"|name="twitter:description") content="([^"]*)"', html)
ld = re.search(r'"description": "([^"]*)"', html)
js = (root / "site.js").read_text(encoding="utf-8")
js_desc = re.search(r'description:\s*"([^"]*)"', js)
if meta_descs != [desc, desc, desc] or not ld or ld.group(1) != desc or not js_desc or js_desc.group(1) != desc:
    named.append("descriptions are not unified")
if "パソコン・スマホの困りごとから、アプリ開発まで" not in js:
    named.append("site.js tagline missing")
if "パソコン修理・業務アプリ・AI導入と、半導体テスト装置" in js:
    named.append("site.js old tagline")

if missing or named:
    print("\n".join(missing + named))
    sys.exit(1)
print("ok")
