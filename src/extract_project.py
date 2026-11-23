"""캐시된 팀 HTML(Next.js 스트림)에서 '?tab=project' 탭의 Summary 와 Project Details 를 뽑는다."""
import json, re
from html import escape
from html.parser import HTMLParser

ALLOWED = {"h2", "h3", "h4", "p", "ul", "ol", "li", "br", "strong", "em", "a", "img"}
IMG_HOST = "https://assets.spaceappschallenge.org/"
CHUNK = re.compile(r"\n?([0-9a-f]+):T([0-9a-f]+),")
MD_LINK = re.compile(r"\[([^\]]+)\]\((https?://[^)\s]+)\)")


class _Sanitizer(HTMLParser):
    """허용 태그만 남기고 속성은 a[href]·img[src,alt] 만 허용한다. iframe·script 등은 내용째 버린다."""

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.out, self.skip = [], 0

    def handle_starttag(self, tag, attrs):
        if tag in ("iframe", "script", "style"):
            self.skip += 1
        if self.skip or tag not in ALLOWED:
            return
        a = dict(attrs)
        if tag == "a":
            href = a.get("href") or ""
            if not href.startswith(("http://", "https://")):
                return
            self.out.append(f'<a href="{escape(href)}" target="_blank" rel="noopener">')
        elif tag == "img":
            src = a.get("src") or ""
            if src.startswith(IMG_HOST):
                self.out.append(f'<img src="{escape(src)}" alt="{escape(a.get("alt") or "")}" loading="lazy">')
        else:
            self.out.append(f"<{tag}>")

    def handle_endtag(self, tag):
        if tag in ("iframe", "script", "style"):
            self.skip -= 1
        elif not self.skip and tag in ALLOWED - {"br", "img"}:
            self.out.append(f"</{tag}>")

    def handle_data(self, data):
        if not self.skip:
            self.out.append(escape(data))


def sanitize(html):
    p = _Sanitizer()
    p.feed(html)
    return "".join(p.out)


def stream(page):
    """Next.js self.__next_f.push 문자열 조각을 이어 붙인 전체 스트림(UTF-8 바이트)."""
    pushed = re.findall(r'self\.__next_f\.push\(\[1,"((?:[^"\\]|\\.)*)"\]\)', page)
    return "".join(json.loads(f'"{s}"') for s in pushed).encode()


def chunks(raw):
    """'ID:T<길이>,' 로 선언된 텍스트 덩어리를 {ID: 텍스트} 로 바이트 길이대로 잘라 낸다."""
    text = raw.decode()
    out = {}
    for m in CHUNK.finditer(text):
        start = len(text[:m.end()].encode())
        out[m[1]] = raw[start:start + int(m[2], 16)].decode()
    return out


def references(raw, cs, field):
    """projectDetails 의 문자열 필드(예: dataReferences)를 읽는다. 값이 "$ID" 면 덩어리를 찾아 마크다운 링크 [(제목, 주소)] 로 바꾼다."""
    m = re.search(rf'"{field}":"(.*?)"[,}}]', raw.decode())
    if not m:
        return []
    text = cs.get(m[1][1:], "") if m[1].startswith("$") else m[1]
    return MD_LINK.findall(text)


def extract(page):
    """{summary, details, dataRefs, projectRefs} 를 돌려준다. Project Details 는 '<' 로 시작하는 가장 긴 덩어리, Summary 는 그 앞의 일반 텍스트 덩어리다."""
    raw = stream(page)
    cs = chunks(raw)
    html = [c for c in cs.values() if c.startswith("<")]
    if not html:
        return None
    details = max(html, key=len)
    before = list(cs.values())[:list(cs.values()).index(details)]
    summary = next((c for c in before[::-1] if len(c) > 100 and c[0] not in "<[{"), "")
    return {"summary": summary.strip(), "details": sanitize(details),
            "dataRefs": references(raw, cs, "dataReferences"), "projectRefs": references(raw, cs, "projectReferences")}
