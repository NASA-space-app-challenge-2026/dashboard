"""프로젝트 링크가 iframe 으로 열리는지 실제로 요청해서 확인하고, 열리는 주소만 src/embeddable.json 으로 저장한다.

열린다고 보는 조건: 최종 응답이 200 + text/html, X-Frame-Options 없음, CSP frame-ancestors 가 없거나 모든 출처를 허용.
(JS 로 프레임을 깨는 사이트는 알 수 없다.) 확인 결과는 data/cache/embeddable.json 에 쌓아 두어 중단 후 이어서 실행할 수 있다.
"""
import json, re, ssl, sys, time, urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from crawl import CACHE, ROOT

OUT = Path(__file__).parent / "embeddable.json"
PROGRESS = CACHE / "embeddable.json"
THREADS = 64
TIMEOUT = 10
UA = "Mozilla/5.0 (compatible; nasa2026-embed-check)"
CTX = ssl.create_default_context()


def allows_framing(headers):
    if headers.get("X-Frame-Options"):
        return False
    csp = headers.get_all("Content-Security-Policy") or []
    for policy in csp:
        m = re.search(r"frame-ancestors\s+([^;]*)", policy, re.I)
        if m and not re.search(r"(^|\s)(\*|https?:|https:)(\s|$)", m[1].strip()):
            return False
    return True


def check(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "text/html"})
    try:
        with urllib.request.urlopen(req, timeout=TIMEOUT, context=CTX) as r:
            ctype = r.headers.get("Content-Type", "")
            return r.status == 200 and ctype.lower().startswith("text/html") and allows_framing(r.headers)
    except Exception:
        return False


def main():
    text = (ROOT / "data" / "teams.js").read_text()
    teams = json.loads(text.split("=", 1)[1].rstrip().rstrip(";"))["teams"]
    urls = sorted({t["projectLink"] for t in teams if (t["projectLink"] or "").startswith("https://")})
    done = json.loads(PROGRESS.read_text()) if PROGRESS.exists() else {}
    todo = [u for u in urls if u not in done]
    t0, n = time.time(), 0
    with ThreadPoolExecutor(THREADS) as ex:
        futs = {ex.submit(check, u): u for u in todo}
        for f in as_completed(futs):
            done[futs[f]] = f.result()
            n += 1
            if n % 200 == 0 or n == len(todo):
                PROGRESS.write_text(json.dumps(done))
                print(f"\r[embeddable] {n}/{len(todo)} {time.time() - t0:5.0f}s", end="", file=sys.stderr, flush=True)
    print(file=sys.stderr)
    ok = sorted(u for u in urls if done.get(u))
    OUT.write_text(json.dumps(ok, ensure_ascii=False, indent=0) + "\n")
    print(f"embeddable {len(ok)} / {len(urls)}", file=sys.stderr)


if __name__ == "__main__":
    main()
