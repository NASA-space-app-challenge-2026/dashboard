"""팀 상세 페이지와 챌린지 페이지의 원본 HTML 을 로컬에 저장한다 (멀티스레드).

저장 위치 (data/cache/ 는 .gitignore 대상이라 깃에 올라가지 않는다):
  data/cache/html/teams/<팀 슬러그>.html
  data/cache/html/challenges/<챌린지 슬러그>.html
이미 저장된 파일은 건너뛰므로 중단 후 다시 실행해도 이어서 받는다. 다시 받으려면 --refresh.
이후 크롤러는 네트워크 대신 이 HTML 에서 값을 뽑는다.
"""
import json, sys, time
from concurrent.futures import ThreadPoolExecutor

import crawl
from crawl import BASE, CACHE, curl, is_submitted

HTML_DIR = CACHE / "html"
WORKERS = 8
REFRESH = "--refresh" in sys.argv


def save(job):
    url_path, dest = job
    if dest.exists() and not REFRESH:
        return
    html = curl([BASE + url_path])
    tmp = dest.with_suffix(".tmp")  # 중단 시 깨진 파일이 남지 않도록 임시 파일 후 교체
    tmp.write_text(html)
    tmp.replace(dest)


def run(label, jobs):
    for _, dest in jobs:
        dest.parent.mkdir(parents=True, exist_ok=True)
    print(f"[{label}] {len(jobs)}개 저장", flush=True)
    done, start = 0, time.time()
    with ThreadPoolExecutor(WORKERS) as ex:
        for _ in ex.map(save, jobs):
            done += 1
            if done % 100 == 0 or done == len(jobs):
                rate = done / max(time.time() - start, 1e-9)
                print(f"[{label}] {done / len(jobs) * 100:5.1f}% ({done}/{len(jobs)}) {rate:.1f}/s 남은 시간 약 {(len(jobs) - done) / rate / 60:.0f}분", flush=True)


def slug(url_path):
    return url_path.strip("/").split("/")[-1]


if __name__ == "__main__":
    challenges = json.loads((CACHE / "challenges.json").read_text())
    run("challenges", [(c["path"], HTML_DIR / "challenges" / f"{c['slug']}.html") for c in challenges.values()])
    teams = [t for t in crawl.stage_list() if is_submitted(t)]
    run("teams", [(t["meta"]["relativeUrl"], HTML_DIR / "teams" / f"{slug(t['meta']['relativeUrl'])}.html") for t in teams])
    print("완료", flush=True)
