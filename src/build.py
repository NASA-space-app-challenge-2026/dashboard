"""캐시(list, pages)에서 단일 데이터 파일 data/teams.js 를 생성한다."""
import hashlib, json, re
from collections import Counter
from datetime import date
from pathlib import Path
from crawl import BASE, CACHE, ROOT, is_submitted, stage_challenges

OVERRIDES = json.loads((Path(__file__).parent / "source_overrides.json").read_text())
VIRTUAL = "Virtual"


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
        rows.append({
            "name": n["title"], "members": page["members"],
            "challenge": (n["challengeDetails"] or {}).get("title") or "(미지정)",
            "region": region, "country": country, "path": rel,
            "demoLink": demo, "projectLink": project,
            "sourceLink": f"https://github.com/{src}" if src else None,
        })

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
    missing = sum(r["members"] is None for r in rows)
    print(f"전체 {len(teams)}팀, 제출 {len(rows)}팀, 지역 {len(data['regions'])}개, 상세 누락 {missing} → {out}")


if __name__ == "__main__":
    main()
