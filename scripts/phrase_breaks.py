#!/usr/bin/env python3
"""Insert phrase-boundary breaks into visible Japanese text.

BudouX proposes chunks. A few of its boundaries fall inside a word
（という、なんでも屋、当てはまる）. Those are glued back together.
Breaks are <wbr> plus span.phr. Flex parents that cannot take extra
inline boxes get <wbr> only, or a single .ttl wrapper.
"""

import html
import sys
from html.parser import HTMLParser
from pathlib import Path

import budoux

ROOT = Path(__file__).resolve().parents[1]
PARSER = budoux.load_default_japanese_parser()

# Strings that must stay on one line. Longer entries win by covering more boundaries.
PROTECT = [
    "ITなんでも屋",
    "なんでも屋",
    "なんでも",
    "という",
    "といった",
    "ということ",
    "というのは",
    "というか",
    "といえば",
    "当てはまる",
    "当てはまった",
    "当てはまり",
    "当てはめ",
    "か所",
    "気になる",
    "気になって",
    "気になっ",
    "わかりません",
    "わかります",
    "わからない",
    "わかって",
    "少しずつ",
    "してください",
    "しています",
    "できません",
    "できます",
    "ありません",
    "なりません",
    "かまいません",
    "ままで",
    "見せてもらい",
    "そのとき",
    "寄り添",
    "お気軽に",
    "ご安心ください",
    "どんな小さなことでも",
]

# Characters that should not start a line.
BAD_START = set("。、，．！？）」』】〕〉》・：；っゃゅょぁぃぅぇぉッャュョァィゥェォー")

SKIP_TAGS = {"script", "style", "noscript", "textarea", "code", "pre"}
VOID_TAGS = {
    "area", "base", "br", "col", "embed", "hr", "img", "input",
    "link", "meta", "source", "track", "wbr",
}


def segment(text: str) -> list[str]:
    if text.strip() == "":
        return [text]
    compact = text.strip()
    if compact == "熊本のITなんでも屋です。":
        lead = text[: len(text) - len(text.lstrip())]
        trail = text[len(text.rstrip()) :]
        return [lead + "熊本の", "ITなんでも屋です。" + trail]

    parts = PARSER.parse(text)
    if "".join(parts) != text:
        parts = [text]
    breaks = set()
    index = 0
    for part in parts[:-1]:
        index += len(part)
        breaks.add(index)
    for pat in PROTECT:
        start = 0
        while True:
            found = text.find(pat, start)
            if found < 0:
                break
            end = found + len(pat)
            breaks = {pos for pos in breaks if not (found < pos < end)}
            start = found + 1
    positions = [0, *sorted(breaks), len(text)]
    chunks = [text[positions[i] : positions[i + 1]] for i in range(len(positions) - 1)]
    chunks = [chunk for chunk in chunks if chunk]
    merged: list[str] = []
    for chunk in chunks:
        if merged and chunk[0] in BAD_START:
            merged[-1] += chunk
        else:
            merged.append(chunk)
    split: list[str] = []
    for chunk in merged:
        if "・" in chunk and len(chunk) >= 12:
            bits = chunk.split("・")
            for i, bit in enumerate(bits):
                split.append(bit + ("・" if i < len(bits) - 1 else ""))
        else:
            split.append(chunk)
    return [chunk for chunk in split if chunk]


def render_chunks(chunks: list[str], mode: str) -> str:
    content = []
    emitted = False
    for chunk in chunks:
        if chunk.strip() == "":
            content.append(html.escape(chunk))
            continue
        if emitted:
            content.append("<wbr>")
        emitted = True
        escaped = html.escape(chunk)
        if mode == "wbr":
            content.append(escaped)
        else:
            content.append(f'<span class="phr">{escaped}</span>')
    body = "".join(content)
    if mode == "ttl":
        return f'<span class="ttl">{body}</span>'
    return body


class PhraseWriter(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.out: list[str] = []
        self.stack: list[dict] = []

    def handle_decl(self, decl: str) -> None:
        self.out.append(f"<!{decl}>")

    def handle_comment(self, data: str) -> None:
        self.out.append(f"<!--{data}-->")

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        self._start(tag, attrs, self.get_starttag_text(), void=tag in VOID_TAGS)

    def handle_startendtag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        self._start(tag, attrs, self.get_starttag_text(), void=True)

    def _start(self, tag: str, attrs: list[tuple[str, str | None]], raw: str, void: bool = False) -> None:
        classes = set()
        data_site = False
        attr_map = {}
        for key, value in attrs:
            attr_map[key] = value or ""
            if key == "class" and value:
                classes = set(value.split())
            if key == "data-site":
                data_site = True
        parent_skip = self.stack[-1]["skip"] if self.stack else False
        skip = parent_skip or tag in SKIP_TAGS or tag == "head"
        if data_site and tag != "img":
            if 'class="' in raw and "phr" not in classes:
                raw = raw.replace('class="', 'class="phr ', 1)
            elif "class=" not in raw and raw.endswith("/>"):
                raw = raw[:-2] + ' class="phr" />'
            elif "class=" not in raw and raw.endswith(">"):
                raw = raw[:-1] + ' class="phr">'
        if "data-cap" in attr_map and not skip:
            raw = self._phrase_attr(raw, "data-cap")
        self.out.append(raw)
        if not void:
            self.stack.append({"tag": tag, "class": classes, "skip": skip, "data_site": data_site})

    def _phrase_attr(self, raw: str, name: str) -> str:
        token = f'{name}="'
        start = raw.find(token)
        if start < 0:
            return raw
        value_start = start + len(token)
        value_end = raw.find('"', value_start)
        if value_end < 0:
            return raw
        text = html.unescape(raw[value_start:value_end])
        if "\u200b" in text:
            return raw
        chunks = segment(text)
        pieces = []
        emitted = False
        for chunk in chunks:
            if chunk.strip() == "":
                pieces.append(html.escape(chunk, quote=True))
                continue
            if emitted:
                pieces.append("&#8203;")
            emitted = True
            pieces.append(html.escape(chunk, quote=True))
        return raw[:value_start] + "".join(pieces) + raw[value_end:]

    def handle_endtag(self, tag: str) -> None:
        self.out.append(f"</{tag}>")
        for i in range(len(self.stack) - 1, -1, -1):
            if self.stack[i]["tag"] == tag:
                del self.stack[i:]
                break

    def handle_data(self, data: str) -> None:
        if (
            not self.stack
            or self.stack[-1]["skip"]
            or self.stack[-1]["data_site"]
            or any("phr" in frame["class"] for frame in self.stack)
        ):
            self.out.append(data)
            return
        if data.strip() == "":
            self.out.append(data)
            return
        self.out.append(render_chunks(segment(data), self._mode()))

    def handle_entityref(self, name: str) -> None:
        self.out.append(f"&{name};")

    def handle_charref(self, name: str) -> None:
        self.out.append(f"&#{name};")

    def _mode(self) -> str:
        parent = self.stack[-1]
        if parent["tag"] in {"a", "button", "summary"}:
            return "wbr"
        in_footer = any("site-footer" in frame["class"] for frame in self.stack)
        if parent["tag"] == "h2" and not in_footer:
            return "ttl"
        parent_classes = self.stack[-2]["class"] if len(self.stack) > 1 else set()
        if parent["tag"] == "h3" and ("price-block" in parent["class"] or "price-block" in parent_classes):
            return "ttl"
        if "g-card__cap" in parent["class"]:
            return "ttl"
        return "spans"


def transform(text: str) -> str:
    writer = PhraseWriter()
    writer.feed(text)
    writer.close()
    return "".join(writer.out)


def main() -> None:
    paths = [ROOT / "index.html", ROOT / "404.html"]
    if len(sys.argv) > 1:
        paths = [Path(arg) for arg in sys.argv[1:]]
    for path in paths:
        original = path.read_text(encoding="utf-8")
        updated = transform(original)
        path.write_text(updated, encoding="utf-8")
        print(f"{path.name}: {original.count('<wbr>')} -> {updated.count('<wbr>')} wbr")


if __name__ == "__main__":
    main()
