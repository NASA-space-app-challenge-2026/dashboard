"""NASA Space Apps 팀 크롤러.

1단계: GraphQL 팀 목록을 100개씩 분할해 병렬 수집 (data/cache/list)
2단계: 제출 팀 상세 페이지를 병렬 수집해 팀원 수·GitHub 후보 추출 (data/cache/pages)
캐시가 있으면 재사용한다. 다시 받으려면 --refresh.
"""
import base64, hashlib, json, re, subprocess, sys, time
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CACHE = ROOT / "data" / "cache"
API = "https://api.spaceappschallenge.org/graphql"
BASE = "https://www.spaceappschallenge.org"
EVENT_ID = "aWQ6NA=="  # 2026 event
PAGE_SIZE = 100
LIST_WORKERS = 8
PAGE_WORKERS = 6
RETRIES = 4

QUERY = """query T($first:Int!,$after:String,$filtering:[Filter!]){teams(first:$first,after:$after,filtering:$filtering){
totalCount edges{node{id title meta{relativeUrl} projectSubmitted
projectDetails{isSubmitted demoLink projectLink}
challengeDetails{title} locationDetails{id title displayName country}}}}}"""

CHALLENGE_QUERY = """query C($first:Int!,$after:String,$filtering:[Filter!]){teams(first:$first,after:$after,filtering:$filtering){
edges{node{challengeDetails{title excerpt meta{slug relativeUrl}}}}}}"""

REFRESH = "--refresh" in sys.argv


def curl(args):
    for i in range(RETRIES):
        r = subprocess.run(["curl", "-sf", "--compressed", "-m", "40", "-A", "Mozilla/5.0", *args],
                           capture_output=True, text=True)
        if r.returncode == 0 and r.stdout:
            return r.stdout
        time.sleep(1.5 * (i + 1))
    raise RuntimeError(f"요청 실패: {args[-1][:80]}")


def fetch_list(offset):
    """offset번째부터 PAGE_SIZE개. 커서는 'offset:N' (N번째 다음부터)."""
    path = CACHE / "list" / f"{offset}.json"
    if path.exists() and not REFRESH:
        return json.loads(path.read_text())
    after = base64.b64encode(f"offset:{offset - 1}".encode()).decode() if offset else ""
    body = json.dumps([{"operationName": "T", "query": QUERY, "variables": {
        "first": PAGE_SIZE, "after": after,
        "filtering": [{"field": "event", "value": EVENT_ID, "compare": "id"}]}}])
    out = curl([API, "-H", "content-type: application/json", "-H", f"origin: {BASE}",
                "-H", "apollo-require-preflight: true", "-d", body])
    res = json.loads(out)[0]
    if "errors" in res:
        raise RuntimeError(res["errors"])
    data = res["data"]["teams"]
    path.write_text(json.dumps(data, ensure_ascii=False))
    return data


def stage_list():
    first = fetch_list(0)
    total = first["totalCount"]
    offsets = list(range(PAGE_SIZE, total, PAGE_SIZE))
    print(f"[list] 전체 {total}팀, {len(offsets) + 1}페이지")
    with ThreadPoolExecutor(LIST_WORKERS) as ex:
        rest = list(ex.map(fetch_list, offsets))
    teams = {}
    for page in [first, *rest]:
        for e in page["edges"]:
            teams[e["node"]["id"]] = e["node"]  # id 기준 중복 제거
    print(f"[list] 수집 {len(teams)}팀 (중복 제거 후)")
    return list(teams.values())


def stage_challenges(teams):
    """미션 제목 → {slug, path, excerpt}. 팀 목록 페이지를 넘기며 모든 미션을 찾을 때까지 수집한다."""
    path = CACHE / "challenges.json"
    if path.exists() and not REFRESH:
        return json.loads(path.read_text())
    wanted = {t["challengeDetails"]["title"] for t in teams if t["challengeDetails"]}
    found = {}
    for offset in range(0, len(teams), PAGE_SIZE):
        after = base64.b64encode(f"offset:{offset - 1}".encode()).decode() if offset else ""
        body = json.dumps([{"operationName": "C", "query": CHALLENGE_QUERY, "variables": {
            "first": PAGE_SIZE, "after": after,
            "filtering": [{"field": "event", "value": EVENT_ID, "compare": "id"}]}}])
        res = json.loads(curl([API, "-H", "content-type: application/json", "-H", f"origin: {BASE}",
                               "-H", "apollo-require-preflight: true", "-d", body]))[0]
        if "errors" in res:
            raise RuntimeError(res["errors"])
        for e in res["data"]["teams"]["edges"]:
            c = e["node"]["challengeDetails"]
            if c and c["title"] not in found:
                found[c["title"]] = {"slug": c["meta"]["slug"], "path": c["meta"]["relativeUrl"],
                                     "excerpt": c["excerpt"]}
        if wanted <= found.keys():
            break
    path.write_text(json.dumps(found, ensure_ascii=False))
    print(f"[challenges] {len(found)}/{len(wanted)}개 수집")
    return found


def is_submitted(n):
    return bool(n["projectSubmitted"] or (n["projectDetails"] or {}).get("isSubmitted"))


REPO_RE = re.compile(r'github\.com/([^/\s"\\<>)\]]+)/([^/\s"\\<>)\]#?]+)')
MEMBER_RE = re.compile(r'TeamPageMembership\\",\\"user\\":\\"([^\\]+)')


def fetch_page(node):
    url = BASE + node["meta"]["relativeUrl"]
    key = hashlib.sha1(url.encode()).hexdigest()[:16]
    path = CACHE / "pages" / f"{key}.json"
    if path.exists() and not REFRESH:
        try:
            json.loads(path.read_text())
            return
        except ValueError:
            pass  # 중단 시 깨진 캐시는 다시 받는다
    html = curl([url])
    repos = []
    for o, r in REPO_RE.findall(html):
        r = re.sub(r"\.git$", "", r)
        if f"{o}/{r}" not in repos:
            repos.append(f"{o}/{r}")
    path.write_text(json.dumps({"url": url, "members": len(set(MEMBER_RE.findall(html))),
                                "repos": repos}, ensure_ascii=False))


def stage_pages(teams):
    todo = [t for t in teams if is_submitted(t)]
    print(f"[pages] 제출 팀 {len(todo)}팀 상세 페이지 수집", flush=True)
    done, start = 0, time.time()
    with ThreadPoolExecutor(PAGE_WORKERS) as ex:
        for _ in ex.map(fetch_page, todo):
            done += 1
            if done % 100 == 0 or done == len(todo):
                pct = done / len(todo) * 100
                rate = done / max(time.time() - start, 1e-9)
                eta = (len(todo) - done) / rate if rate else 0
                print(f"[pages] {pct:5.1f}% ({done}/{len(todo)}) {rate:.1f}/s 남은 시간 약 {eta / 60:.0f}분", flush=True)
    print("[pages] 완료", flush=True)


if __name__ == "__main__":
    all_teams = stage_list()
    stage_challenges(all_teams)
    stage_pages(all_teams)
