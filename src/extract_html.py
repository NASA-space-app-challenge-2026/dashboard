"""data/cache/html 의 원본 HTML 에서 소개 글과 이미지를 뽑아 data/cache/extracted.json 에 저장한다.

팀 페이지:      description(팀 소개, 평문) + image(히어로 이미지)
챌린지 페이지: image(히어로 이미지)
소개 글은 Next.js 스트림(self.__next_f.push)에 들어 있어, 조각을 이어 붙인 뒤 "$NN" 참조까지 풀어서 읽는다.
"""
import html as htmllib, json, re
from multiprocessing import Pool

from crawl import CACHE

HTML_DIR = CACHE / "html"
OUT = CACHE / "extracted.json"

PUSH_RE = re.compile(r'self\.__next_f\.push\(\[1,"((?:[^"\\]|\\.)*)"\]\)')
DESC_RE = re.compile(r'"featuredImage":(?:"[^"]*"|null),"description":("(?:[^"\\]|\\.)*")')
HERO_RE = re.compile(r'<img[^>]*class="page-hero[^"]*"[^>]*\ssrc="([^"]+)"')
REF_RE = re.compile(r"^\$([0-9a-f]+)$")


def stream(page):
    return "".join(json.loads(f'"{m}"') for m in PUSH_RE.findall(page))


def text_chunk(rsc, ref):  # "24:T4e5,<본문>" 형식의 텍스트 조각 (길이는 16진수 바이트 수)
    m = re.search(rf"(?<![0-9a-zA-Z]){ref}:T([0-9a-f]+),", rsc)  # 앞 조각 끝에 이어 붙어 줄 머리가 아닐 수도 있다
    return rsc[m.end():].encode()[:int(m.group(1), 16)].decode() if m else None


def to_text(h):
    h = re.sub(r"<br\s*/?>", "\n", h)
    h = re.sub(r"</(p|div|li|h\d)>", "\n\n", h)
    return re.sub(r"\n{3,}", "\n\n", htmllib.unescape(re.sub(r"<[^>]+>", "", h))).strip()


def image(page, rsc):
    m = HERO_RE.search(page)
    if not m:
        return None
    src = m.group(1)
    at = rsc.find(src)  # 렌디션 URL 바로 앞에 나오는 downloadUrl 이 그 이미지의 원본이다
    original = re.findall(r'"downloadUrl":"([^"]+)"', rsc[:at])[-1:] if at >= 0 else []
    return {"url": src, "original": original[0] if original else None}


def parse(job):
    kind, path = job
    page = path.read_text()
    rsc = stream(page)
    row = {"image": image(page, rsc)}
    if kind == "teams":
        m = DESC_RE.search(rsc)
        d = json.loads(m.group(1)) if m else ""
        ref = REF_RE.match(d)
        row["description"] = to_text(text_chunk(rsc, ref.group(1)) or "" if ref else d) or None
    return kind, path.stem, row


if __name__ == "__main__":
    jobs = [(k, p) for k in ("teams", "challenges") for p in sorted((HTML_DIR / k).glob("*.html"))]
    out = {"teams": {}, "challenges": {}}
    with Pool() as pool:
        for kind, slug, row in pool.imap_unordered(parse, jobs, chunksize=200):
            out[kind][slug] = row
    OUT.write_text(json.dumps(out, ensure_ascii=False))
    t = out["teams"]
    print(f"teams {len(t)}: 소개 {sum(bool(r['description']) for r in t.values())}, 이미지 {sum(bool(r['image']) for r in t.values())}, "
          f"원본 이미지 {sum(bool(r['image'] and r['image']['original']) for r in t.values())}")
    c = out["challenges"]
    print(f"challenges {len(c)}: 이미지 {sum(bool(r['image']) for r in c.values())}")
