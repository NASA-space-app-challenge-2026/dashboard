"""demo/project 링크가 GitHub 저장소인 팀에서 실제 웹 주소를 찾아 src/github_web.json 으로 저장한다.

탐색 순서: 저장소 homepage → README 안의 배포 호스트 링크 → <owner>.github.io/<repo>/.
후보는 HTTP 로 살아있는지 확인한 것만 채택한다. 진행 상황은 stderr 와 data/cache/github_web/ 에 남는다.
"""
import json, re, subprocess, sys, time, urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from crawl import CACHE, ROOT

OUT = Path(__file__).parent / "github_web.json"
WORK = CACHE / "github_web"
GRAPHQL_BATCH = 25
GRAPHQL_THREADS = 4
CHECK_THREADS = 32
README_NAMES = ("README.md", "readme.md", "Readme.md", "README.MD")
DEPLOY_HOSTS = (
    "vercel.app", "netlify.app", "github.io", "pages.dev", "onrender.com", "streamlit.app",
    "railway.app", "herokuapp.com", "fly.dev", "web.app", "firebaseapp.com", "run.app",
    "workers.dev", "hf.space", "surge.sh", "glitch.me", "replit.app", "deno.dev", "netlify.com",
)
NOT_WEB_HOSTS = (  # homepage 에 적힌 영상/문서/SNS 링크는 웹 데모가 아니다
    "youtube.com", "youtu.be", "drive.google.com", "docs.google.com", "figma.com", "linkedin.com", "canva.com",
    "notion.so", "notion.site", "spaceappschallenge.org", "nasa.gov", "twitter.com", "x.com", "instagram.com",
    "facebook.com", "medium.com", "devpost.com", "onedrive.live.com", "1drv.ms", "dropbox.com", "loom.com",
)
URL_RE = re.compile(r'https?://[^\s<>"\')\]]+')


def repo_key(url):
    m = re.match(r'https?://(?:www\.)?github\.com/([^/\s#?]+)/([^/\s#?]+)', url or "")
    return f"{m[1]}/{re.sub(r'\.git$', '', m[2])}" if m else None


def load_repos():
    text = (ROOT / "data" / "teams.js").read_text()
    teams = json.loads(text.split("=", 1)[1].rstrip().rstrip(";"))["teams"]
    return sorted({k for t in teams for f in ("demoLink", "projectLink") if (k := repo_key(t[f]))})


class Progress:
    def __init__(self, label, total):
        self.label, self.total, self.done, self.t0 = label, total, 0, time.time()

    def step(self, n=1):
        self.done += n
        pct = self.done / self.total * 100
        print(f"\r[{self.label}] {self.done}/{self.total} ({pct:5.1f}%) {time.time() - self.t0:5.0f}s", end="", file=sys.stderr, flush=True)

    def finish(self):
        print(file=sys.stderr)


def graphql(token, repos):
    parts = []
    for i, key in enumerate(repos):
        owner, name = key.split("/", 1)
        files = " ".join(
            f'f{j}: object(expression: {json.dumps("HEAD:" + n)}) {{ ... on Blob {{ text }} }}'
            for j, n in enumerate(README_NAMES))
        parts.append(f'r{i}: repository(owner: {json.dumps(owner)}, name: {json.dumps(name)}) '
                     f'{{ homepageUrl {files} }}')
    body = json.dumps({"query": "{ " + " ".join(parts) + " }"}).encode()
    req = urllib.request.Request("https://api.github.com/graphql", body,
                                 {"Authorization": f"bearer {token}", "Content-Type": "application/json"})
    for attempt in range(4):
        try:
            res = json.load(urllib.request.urlopen(req, timeout=60))
            break
        except Exception:
            time.sleep(2 ** attempt * 3)
    else:
        return {k: {"error": True} for k in repos}
    out = {}
    for i, key in enumerate(repos):
        node = (res.get("data") or {}).get(f"r{i}")
        if not node:
            out[key] = {"missing": True}
            continue
        readme = next((node[f"f{j}"]["text"] for j in range(len(README_NAMES)) if node.get(f"f{j}")), "")
        out[key] = {"homepage": node["homepageUrl"] or "", "urls": candidate_urls(readme)}
    return out


def host_in(url, hosts):
    host = re.match(r'https?://([^/:]+)', url)
    host = host.group(1).lower() if host else ""
    return any(host == h or host.endswith("." + h) for h in hosts)


def host_ok(url):
    return host_in(url, DEPLOY_HOSTS)


def candidate_urls(readme):
    seen = []
    for u in URL_RE.findall(readme):
        u = u.rstrip(".,;:*`")
        if host_ok(u) and u not in seen and "shields.io" not in u:
            seen.append(u)
    return seen[:5]


def alive(url):
    for method in ("HEAD", "GET"):
        try:
            req = urllib.request.Request(url, method=method, headers={"User-Agent": "Mozilla/5.0"})
            return urllib.request.urlopen(req, timeout=15).status < 400
        except urllib.error.HTTPError as e:
            if method == "GET" or e.code not in (403, 405, 501):
                return False
        except Exception:
            return False
    return False


def pick_web(key, info):
    owner, name = key.split("/", 1)
    cands = []
    if info.get("homepage") and not repo_key(info["homepage"]) \
            and not host_in(info["homepage"], NOT_WEB_HOSTS):
        cands.append(info["homepage"])
    cands += info.get("urls", [])
    cands.append(f"https://{owner.lower()}.github.io/{name}/")
    return next((u for u in cands if alive(u)), None)


def main():
    WORK.mkdir(parents=True, exist_ok=True)
    token = subprocess.check_output(["gh", "auth", "token"], text=True).strip()
    repos = sorted(set(load_repos()) | set(json.loads((WORK / "info.json").read_text()) if (WORK / "info.json").exists() else []))
    print(f"대상 저장소 {len(repos)}개", file=sys.stderr)

    info_file = WORK / "info.json"
    info = json.loads(info_file.read_text()) if info_file.exists() else {}
    todo = [r for r in repos if r not in info or info[r].get("error")]
    batches = [todo[i:i + GRAPHQL_BATCH] for i in range(0, len(todo), GRAPHQL_BATCH)]
    prog = Progress("1/2 GitHub 조회", len(todo))
    with ThreadPoolExecutor(GRAPHQL_THREADS) as ex:
        for fut in as_completed([ex.submit(graphql, token, b) for b in batches]):
            res = fut.result()
            info.update(res)
            prog.step(len(res))
            info_file.write_text(json.dumps(info))
    prog.finish()

    result_file = WORK / "result.json"
    result = json.loads(result_file.read_text()) if result_file.exists() else {}
    todo = [r for r in repos if r not in result]
    prog = Progress("2/2 웹 주소 확인", len(todo))
    with ThreadPoolExecutor(CHECK_THREADS) as ex:
        futs = {ex.submit(pick_web, r, info.get(r, {})): r for r in todo}
        for fut in as_completed(futs):
            result[futs[fut]] = fut.result()
            prog.step()
            if prog.done % 200 == 0:
                result_file.write_text(json.dumps(result))
    prog.finish()
    result_file.write_text(json.dumps(result))

    # teams.js 는 build.py 가 이미 웹 주소로 치환한 상태일 수 있으므로 이전 결과를 보존하며 합친다.
    previous = json.loads(OUT.read_text()) if OUT.exists() else {}
    found = {k: v for k, v in sorted({**previous, **result}.items()) if v}
    OUT.write_text(json.dumps(found, indent=2, ensure_ascii=False) + "\n")
    print(f"완료: {len(found)}/{len(repos)} 저장소에서 웹 주소 발견 → {OUT.name}", file=sys.stderr)


if __name__ == "__main__":
    main()
