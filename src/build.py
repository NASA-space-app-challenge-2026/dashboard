"""캐시(list, pages)에서 단일 데이터 파일 data/teams.js 를 생성한다."""
import hashlib, json, re, shutil
from collections import Counter
from datetime import date
from pathlib import Path
from crawl import BASE, CACHE, ROOT, is_submitted, stage_challenges
from stamp import stamp

OVERRIDES = json.loads((Path(__file__).parent / "source_overrides.json").read_text())
GITHUB_WEB = json.loads((Path(__file__).parent / "github_web.json").read_text())  # resolve_github_web.py 결과
VIRTUAL = "Virtual"
EXTRACTED = CACHE / "extracted.json"  # extract_html.py 결과 (팀 소개 글·이미지, 챌린지 이미지)
TEAM_DIR = ROOT / "data" / "teams"  # 팀 페이지를 열 때 하나씩 불러오는 팀별 소개 JSON


def slug_of(path):
    return path.strip("/").split("/")[-1]


def write_team_details(rows, teams):
    """data/teams/<슬러그>.json = {description, image}. 소개도 이미지도 없는 팀은 파일을 만들지 않는다."""
    shutil.rmtree(TEAM_DIR, ignore_errors=True)
    TEAM_DIR.mkdir(parents=True)
    count = 0
    for r in rows:
        e = teams.get(slug_of(r["path"]))
        d = {"description": e["description"], "image": e["image"]["url"] if e["image"] else None} if e else None
        if d and (d["description"] or d["image"]):
            (TEAM_DIR / f"{slug_of(r['path'])}.json").write_text(json.dumps(d, ensure_ascii=False, separators=(",", ":")))
            count += 1
    return count


def repo_of(url):
    m = re.match(r'https?://(?:www\.)?github\.com/([^/\s#?)\]]+)/([^/\s#?)\]]+)', url or "")
    return (m.group(1), re.sub(r"\.git$", "", m.group(2))) if m else None


def ghio_owner(url):
    m = re.match(r'https?://([^./]+)\.github\.io', url or "")
    return m.group(1).lower() if m else None


def ghio_repo(url):
    """owner.github.io/repo/ → owner/repo, owner.github.io (루트) → owner/owner.github.io."""
    m = re.match(r'https?://([^./]+)\.github\.io(?:/([^/?#]+))?', url or "")
    if not m:
        return None
    return f"{m[1]}/{m[2] or m[1] + '.github.io'}"


def swap_github_for_web(url):
    """GitHub 저장소 링크이고 배포된 웹 주소를 찾았다면 (웹 주소, 저장소) 를, 아니면 (원본, None) 을 돌려준다."""
    r = repo_of(url)
    web = GITHUB_WEB.get(f"{r[0]}/{r[1]}") if r else None
    return (web, f"{r[0]}/{r[1]}") if web else (url, None)


def pick_source(web, intro, repos):
    """소스 저장소: 링크 필드의 GitHub → github.io 주소에서 추론 → 같은 소유자의 상세 페이지 저장소 → 없음."""
    for u in (web, intro):
        r = repo_of(u)
        if r:
            return f"{r[0]}/{r[1]}"
    for u in (web, intro):
        r = ghio_repo(u)
        if r:
            return r
    owners = {ghio_owner(web), ghio_owner(intro)} - {None}
    return next((r for r in repos if r.split("/")[0].lower() in owners), None)


def main():
    teams = {}
    for f in (CACHE / "list").glob("*.json"):
        for e in json.loads(f.read_text())["edges"]:
            teams[e["node"]["id"]] = e["node"]

    challenges = stage_challenges(list(teams.values()))
    region_all, region_sub, rows = Counter(), Counter(), []
    for n in teams.values():
        loc = n["locationDetails"] or {}
        region = loc.get("title") or loc.get("displayName") or VIRTUAL
        country = loc.get("country") or ""
        region_all[(region, country)] += 1
        if not is_submitted(n):
            continue
        region_sub[(region, country)] += 1
        rel = n["meta"]["relativeUrl"]
        key = hashlib.sha1((BASE + rel).encode()).hexdigest()[:16]
        pf = CACHE / "pages" / f"{key}.json"
        page = json.loads(pf.read_text()) if pf.exists() else {"members": None, "repos": []}
        pd = n["projectDetails"] or {}
        demo, project = pd.get("demoLink") or None, pd.get("projectLink") or None
        src = OVERRIDES.get(rel) or pick_source(project, demo, page["repos"])
        demo, demo_repo = swap_github_for_web(demo)
        project, project_repo = swap_github_for_web(project)
        src = src or demo_repo or project_repo
        rows.append({
            "name": n["title"], "members": page["members"],
            "challenge": (n["challengeDetails"] or {}).get("title") or "(미지정)",
            "region": region, "country": country, "path": rel,
            "demoLink": demo, "projectLink": project,
            "sourceLink": f"https://github.com/{src}" if src else None,
        })

    extracted = json.loads(EXTRACTED.read_text()) if EXTRACTED.exists() else {"teams": {}, "challenges": {}}
    for r in rows:
        img = extracted["teams"].get(slug_of(r["path"]), {}).get("image")
        r["image"] = img["url"] if img else None
    for c in challenges.values():
        img = extracted["challenges"].get(c["slug"], {}).get("image")
        c["image"] = img["url"] if img else None

    data = {
        "generatedAt": date.today().isoformat(),
        "totalTeams": len(teams),
        "regions": [{"name": r, "country": c, "teams": region_all[(r, c)], "submitted": region_sub[(r, c)]}
                    for (r, c) in sorted(region_all)],
        "challenges": [{"title": t, **c} for t, c in sorted(challenges.items())],
        "teams": rows,
    }
    out = ROOT / "data" / "teams.js"
    out.write_text("window.DATA = " + json.dumps(data, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/") + ";\n")
    detailed = write_team_details(rows, extracted["teams"])
    missing = sum(r["members"] is None for r in rows)
    stamp()  # teams.js 가 바뀌었으니 index.html 의 해시도 갱신
    print(f"전체 {len(teams)}팀, 제출 {len(rows)}팀, 지역 {len(data['regions'])}개, 상세 누락 {missing}, 팀별 소개 {detailed}개 → {out}")


if __name__ == "__main__":
    main()
