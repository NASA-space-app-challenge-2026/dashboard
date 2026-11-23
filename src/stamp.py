"""index.html 의 로컬 css/js 주소에 ?v=<파일 내용 해시> 를 붙인다. 파일이 바뀌면 주소가 바뀌어 브라우저 캐시를 쓰지 않는다.
style.css / app.js 등을 고친 뒤에는 이 스크립트를 실행한다 (build.py 도 마지막에 실행한다)."""
import hashlib, re
from crawl import ROOT

INDEX = ROOT / "index.html"
ASSET_RE = re.compile(r'((?:src|href)=")(/[^"?]+\.(?:css|js))(?:\?v=[0-9a-f]+)?(")')


def stamp():
    def repl(m):
        f = ROOT / m[2].lstrip("/")
        return f"{m[1]}{m[2]}?v={hashlib.sha1(f.read_bytes()).hexdigest()[:8]}{m[3]}" if f.exists() else m[0]
    html = INDEX.read_text()
    new = ASSET_RE.sub(repl, html)
    if new != html:
        INDEX.write_text(new)
    return len(ASSET_RE.findall(new))


if __name__ == "__main__":
    print(f"index.html: {stamp()}개 주소에 해시 적용")
