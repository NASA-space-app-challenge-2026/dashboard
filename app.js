// History API 라우팅 SPA: /stats (기본), /mission/<slug>/<page>, /teams/<slug>, /regions, /regions/<소문자-하이픈 이름>, /about
const BASE = "https://www.spaceappschallenge.org";
const PAGE_SIZE = 20;
const REPO_URL = "https://github.com/NASA-space-app-challenge-2026/dashboard";
const GITHUB_ICON = `<svg viewBox="0 0 16 16" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z"/></svg>`;
const Nav = Object.freeze({ STATS: "stats", REGIONS: "regions", ABOUT: "about" });
const Lang = Object.freeze({ KO: "ko", EN: "en" });
const LANG_KEY = "lang";
const STRINGS = {
  [Lang.KO]: {
    langToggle: "EN", footer: "NASA 또는 NASA Space Apps Challenge 주최 측과 무관한 비공식 통계 페이지입니다.", navStats: "통계", navRegions: "지역", navAbout: "소개",
    aboutTitle: "NASA Space Apps Challenge 소개",
    aboutBody: [
      "NASA Space Apps Challenge는 NASA가 매년 개최하는 세계 최대 규모의 국제 해커톤입니다. 누구나 팀을 이뤄 참가할 수 있으며, NASA가 공개한 우주·지구 관측 데이터를 활용해 실제 문제를 해결하는 프로젝트를 만듭니다.",
      "참가 팀은 주최 측이 제시한 여러 미션(챌린지) 중 하나를 골라 정해진 기간 동안 아이디어를 구현하고, 결과물을 제출합니다. 전 세계 각 지역에서 오프라인 행사와 온라인 행사가 함께 열립니다."
    ],
    aboutOfficial: "공식 사이트 바로가기 ↗",
    aboutNoticeTitle: "안내",
    aboutNotice: "이 페이지는 NASA 또는 NASA Space Apps Challenge 주최 측이 운영하는 공식 페이지가 아닙니다. 공식 사이트에 공개된 정보를 바탕으로 만든 비공식 통계 페이지이며, 정확한 최신 정보는 반드시 공식 사이트에서 확인하세요. 최종적으로 제출되지 않은 팀 정보는 통계에서 제외했습니다.",
    aboutReportTitle: "정보 수정 제안",
    aboutReport: "잘못되었거나 누락된 정보를 발견하셨다면 아래 GitHub 저장소에 이슈 또는 PR로 알려주세요. 확인 후 반영하겠습니다.", repoLink: "GitHub 저장소 ↗",
    missionsTitle: "미션별 제출 팀", missionListTitle: "미션 목록", mission: "미션",
    badge: (teams, members) => `${teams}팀 · ${members}명`,
    back: "← 통계", notFound: "존재하지 않는 미션입니다.",
    detailLead: (teams, members) => `제출 팀 ${teams}팀 · 총 ${members}명`,
    official: "공식 미션 페이지 ↗", noTeams: "제출한 팀이 없습니다.", teamSearchPh: "팀 또는 지역 검색", clearRegion: "지역 필터 해제", clickRegionHint: "눌러서 이 지역만 보기", noTeamMatch: "조건에 맞는 팀이 없습니다.",
    teamPage: "팀 소개", teamNotFound: "존재하지 않는 팀입니다.", officialTeam: "공식 팀 페이지 ↗", linksTitle: "링크", introTitle: "팀 소개 글", noIntro: "등록된 소개 글이 없습니다.", demo: "데모", project: "프로젝트", source: "소스",
    team: "팀명", region: "지역", members: "팀원 수", country: "국가", teamsReg: "등록 팀", teamsSub: "제출 팀", rate: "제출률", no: "번호",
    prev: "이전", next: "다음",
    stats: "통계", statsLead: date => `기준일 ${date}`,
    cardTotal: "전체 등록 팀", cardSubmitted: "최종 제출 팀", cardRate: pct => `제출률 ${pct}%`,
    cardPeople: "제출 팀 인원", cardAvg: avg => `팀당 평균 ${avg}명`,
    cardRegions: "지역 수", cardCountries: "참가 국가 수", cardMissions: "미션 수",
    cardGithub: "GitHub 있는 팀",
    distTitle: "팀원 수 분포", distSub: "제출 팀 기준", byMissionSub: "팀 수 많은 순",
    teamsTitle: "팀 목록", teamListSub: (count, size) => `${count}개 팀 · ${size}개씩`,
    regionsTitle: "지역별 현황", searchPh: "지역 또는 국가 검색 (예: Seoul)",
    regionsSub: (count, size) => `${count}개 지역 · 열 제목을 누르면 정렬 · ${size}개씩`,
    unitPeople: k => `${k}명`, unitTeams: v => `${v}팀`,
    regionBack: "← 지역 목록", regionNotFound: "존재하지 않는 지역입니다.", regionsLead: date => `기준일 ${date} · 지역을 누르면 미션별 제출 팀을 볼 수 있습니다`,
    regionMissionsTitle: "미션별 제출 팀", expandAll: "모두 펼치기", collapseAll: "모두 접기", noRegionTeams: "이 지역에서 제출한 팀이 없습니다.",
    loadErr: "data/teams.js 를 불러오지 못했습니다. src/build.py 를 실행하세요."
  },
  [Lang.EN]: {
    langToggle: "한국어", footer: "Unofficial statistics page. Not affiliated with NASA or the NASA Space Apps Challenge organizers.", navStats: "Stats", navRegions: "Regions", navAbout: "About",
    aboutTitle: "About NASA Space Apps Challenge",
    aboutBody: [
      "The NASA Space Apps Challenge is the largest annual international hackathon, hosted by NASA. Anyone can join a team and build projects that tackle real-world problems using the space and Earth observation data NASA makes openly available.",
      "Teams pick one of the missions (challenges) set by the organizers, build their idea within the event period, and submit the result. Events are held both in person and online in regions around the world."
    ],
    aboutOfficial: "Go to the official website ↗",
    aboutNoticeTitle: "Notice",
    aboutNotice: "This is not an official page of NASA or the NASA Space Apps Challenge organizers. It is an unofficial statistics page built from information published on the official website. Please check the official website for accurate, up-to-date information. Teams that did not make a final submission are excluded from these statistics.",
    aboutReportTitle: "Report a correction",
    aboutReport: "If you spot incorrect or missing information, please let us know by opening an issue or a PR on the GitHub repository below. We will review and update it.", repoLink: "GitHub repository ↗",
    missionsTitle: "Submitted Teams by Mission", missionListTitle: "Missions", mission: "Mission",
    badge: (teams, members) => `${teams} teams · ${members} members`,
    back: "← Stats", notFound: "Mission not found.",
    detailLead: (teams, members) => `${teams} submitted teams · ${members} members total`,
    official: "Official mission page ↗", noTeams: "No teams have submitted.", teamSearchPh: "Search team or region", clearRegion: "Clear region filter", clickRegionHint: "Click to show this region only", noTeamMatch: "No teams match.",
    teamPage: "Team page", teamNotFound: "Team not found.", officialTeam: "Official team page ↗", linksTitle: "Links", introTitle: "About the team", noIntro: "No introduction has been written.", demo: "Demo", project: "Project", source: "Source",
    team: "Team", region: "Region", members: "Members", country: "Country", teamsReg: "Registered", teamsSub: "Submitted", rate: "Rate", no: "No.",
    prev: "Prev", next: "Next",
    stats: "Stats", statsLead: date => `As of ${date}`,
    cardTotal: "Registered teams", cardSubmitted: "Final submitted teams", cardRate: pct => `${pct}% submitted`,
    cardPeople: "Members on submitted teams", cardAvg: avg => `${avg} per team on average`,
    cardRegions: "Regions", cardCountries: "Participating countries", cardMissions: "Missions",
    cardGithub: "Teams with GitHub",
    distTitle: "Team size distribution", distSub: "Submitted teams", byMissionSub: "Most teams first",
    teamsTitle: "Teams", teamListSub: (count, size) => `${count} teams · ${size} per page`,
    regionsTitle: "Regions", searchPh: "Search region or country (e.g. Seoul)",
    regionsSub: (count, size) => `${count} regions · click a column header to sort · ${size} per page`,
    unitPeople: k => `${k} members`, unitTeams: v => `${v} teams`,
    regionBack: "← Regions", regionNotFound: "Region not found.", regionsLead: date => `As of ${date} · pick a region to see its submitted teams by mission`,
    regionMissionsTitle: "Submitted Teams by Mission", expandAll: "Expand all", collapseAll: "Collapse all", noRegionTeams: "No teams from this region have submitted.",
    loadErr: "Failed to load data/teams.js. Run src/build.py."
  }
};
const storedLang = () => { try { return localStorage.getItem(LANG_KEY); } catch { return null; } };
const browserLang = () => (navigator.language || "").toLowerCase().startsWith(Lang.KO) ? Lang.KO : Lang.EN;  // 저장된 선택이 없으면 브라우저 언어 (한국어 외에는 영어)
let lang = Object.values(Lang).includes(storedLang()) ? storedLang() : browserLang();
let L = STRINGS[lang];
const $ =id => document.getElementById(id);
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const n = x => x.toLocaleString();
const D = window.DATA, T = D.teams;
const teamSlug = t => t.path.split("/").filter(Boolean).pop();  // "/2026/find-a-team/<slug>/" -> "<slug>" (경로가 유일하므로 슬러그도 유일)
const teamHref = t => `/teams/${encodeURIComponent(teamSlug(t))}`;
// 팀 프로필 원형 이미지. 이미지가 없거나 불러오는 중이면 사람 모양 더미를 보여 준다
const avatar = t => `<span class="avatar"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="9" r="4"/><path d="M0 24c0-6 5-10 12-10s12 4 12 10z"/></svg>${t.image ? `<img src="${esc(t.image)}" alt="" width="28" height="28" loading="lazy" decoding="async">` : ""}</span>`;
// 이미지는 더미 위에 겹쳐 두고, 다 불러온 뒤에 서서히 나타나게 한다 (load 이벤트는 버블링되지 않아 캡처 단계에서 받는다)
document.addEventListener("load", e => { if (e.target.tagName === "IMG" && e.target.closest(".avatar")) e.target.classList.add("on"); }, true);
const TEAM_BY_SLUG = new Map(T.map(t => [teamSlug(t), t]));
const MISSION_TEXT = { [Lang.KO]: window.MISSIONS_KO || {}, [Lang.EN]: window.MISSIONS_EN || {} };
const CH_BY_TITLE = new Map(D.challenges.map(c => [c.title, c]));
// 미션 표시용 텍스트 (key: "title" | "excerpt" | "summary"). 언어별 값이 없으면 원문. 필터/매칭은 항상 원문 title 로 한다.
const mText = (c, key) => MISSION_TEXT[lang][c.slug]?.[key] || c[key];
const app = $("app");
const cell = (l, u) => u ? `<a class="lk" href="${esc(u)}" target="_blank" rel="noopener">${l}</a>` : `<span class="no">-</span>`;
const count = (arr, f) => arr.reduce((m, x) => (m.set(f(x), (m.get(f(x)) || 0) + 1), m), new Map());
const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);
const setView = (nav, title) => {
  document.title = `${title} · NASA Space Apps Challenge 2026`;
  document.documentElement.lang = lang;
  $("lang-label").textContent = L.langToggle;
  $("footer").innerHTML = `${L.footer}<br><a class="gh" href="${REPO_URL}" target="_blank" rel="noopener" aria-label="GitHub">${GITHUB_ICON}</a>`;
  document.querySelectorAll("nav a").forEach(a => { a.textContent = L[a.dataset.label]; });
  document.querySelectorAll("nav a").forEach(a => a.classList.toggle("active", a.dataset.nav === nav));
};
const PAGER_SLOTS = 7;  // 페이지 번호 칸 수 (생략 표시 포함) — 항상 이 개수로 고정
const pageNums = (page, pages) => {
  if (pages <= PAGER_SLOTS) return Array.from({ length: pages }, (_, i) => i + 1);
  const edge = PAGER_SLOTS - 2;  // 앞/뒤쪽에서 생략 없이 이어 보여 줄 번호 수
  if (page <= edge - 1) return [...Array.from({ length: edge }, (_, i) => i + 1), null, pages];
  if (page >= pages - edge + 2) return [1, null, ...Array.from({ length: edge }, (_, i) => pages - edge + 1 + i)];
  return [1, null, page - 1, page, page + 1, null, pages];
};
// 마지막 페이지에서도 표 높이가 같도록 PAGE_SIZE 행까지 빈 행으로 채운다
const blankRows = (shown, cols) => `<tr class="blank">${`<td></td>`.repeat(cols)}</tr>`.repeat(PAGE_SIZE - shown);
const pagerHtml = (page, pages, total, size) => {
  const start = (page - 1) * size;
  return `<div class="pager">
    <button data-p="${page - 1}" ${page === 1 ? "disabled" : ""}>${L.prev}</button>
    ${pageNums(page, pages).map(k => k === null ? `<span class="gap">…</span>` : `<button data-p="${k}" ${k === page ? "aria-current=page" : ""}>${k}</button>`).join("")}
    <button data-p="${page + 1}" ${page === pages ? "disabled" : ""}>${L.next}</button>
    <span class="info">${total ? start + 1 : 0}–${Math.min(start + size, total)} / ${n(total)}</span></div>`;
};

/* ---------- 미션 목록 (통계 탭에 포함) ---------- */
function missionRows() {
  const stat = new Map();
  T.forEach(t => {
    const s = stat.get(t.challenge) || stat.set(t.challenge, { teams: 0, members: 0 }).get(t.challenge);
    s.teams++; s.members += t.members || 0;
  });
  return [...D.challenges].sort((a, b) => (stat.get(b.title)?.teams || 0) - (stat.get(a.title)?.teams || 0))
    .map(c => {
      const s = stat.get(c.title) || { teams: 0, members: 0 };
      const short = mText(c, "summary") || mText(c, "excerpt");
      return `<a class="mission-row" href="/mission/${encodeURIComponent(c.slug)}">${c.image ? `<img class="mission-thumb" src="${esc(c.image)}" alt="" loading="lazy">` : ""}<span class="sum-t"><span>${esc(mText(c, "title"))}</span>${short ? `<small>${esc(short)}</small>` : ""}</span>
        <span class="badge">${L.badge(n(s.teams), n(s.members))}</span></a>`;
    }).join("");
}

/* ---------- 미션 상세 ---------- */
let mounted = null;  // { slug, teams, pages }
function renderMission(slug, pageParam) {
  const mission = D.challenges.find(c => c.slug === slug);
  if (!mission) { mounted = null; setView(Nav.STATS, L.mission); app.innerHTML = `<a class="back" href="/stats">${L.back}</a><div class="empty">${L.notFound}</div>`; return; }
  setView(Nav.STATS, mText(mission, "title"));
  if (mounted?.slug !== slug) {  // 같은 미션 안에서 페이지만 바뀔 때는 머리글을 다시 그리지 않는다
    const teams = T.filter(t => t.challenge === mission.title).sort((a, b) => a.name.localeCompare(b.name));
    mounted = { slug, all: teams, teams, pages: Math.max(1, Math.ceil(teams.length / PAGE_SIZE)), region: "", q: "" };
    app.innerHTML = `<a class="back" href="/stats">${L.back}</a><h1>${esc(mText(mission, "title"))}</h1>
      <p class="lead">${L.detailLead(n(teams.length), n(teams.reduce((a, t) => a + (t.members || 0), 0)))}</p>
      <div class="mission-intro">${mission.image ? `<img class="mission-img" src="${esc(mission.image)}" alt="">` : ""}
        <div><p class="desc">${esc(mText(mission, "excerpt"))}</p>
        <a class="ext" href="${BASE + esc(mission.path)}" target="_blank" rel="noopener">${L.official}</a></div></div>
      <div class="card"><div class="card-h" style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:flex-start;gap:12px"><div><h2>${L.teamsTitle}</h2><p id="tsub"></p></div>
        <div class="tsearch"><span id="chip"></span><input id="tq" type="search" placeholder="${L.teamSearchPh}"></div></div>
        <div class="card-c" style="padding-top:12px"><div id="list"></div></div></div>`;
    $("tq").addEventListener("input", e => { mounted.q = e.target.value.trim().toLowerCase(); applyTeamFilter(); });
    $("chip").addEventListener("click", () => { mounted.region = ""; applyTeamFilter(); });
    $("list").addEventListener("click", e => {
      const r = e.target.closest("[data-region]");
      if (r) { mounted.region = r.dataset.region; applyTeamFilter(); }
    });
  }
  const { teams, pages } = mounted, page = clamp(pageParam, 1, pages);
  const pageTeams = teams.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const rows = pageTeams.map((t, i) => `<tr class="go" data-href="${teamHref(t)}">
    <td class="num">${(page - 1) * PAGE_SIZE + i + 1}</td><td><div class="tname">${avatar(t)}<a class="name" href="${teamHref(t)}">${esc(t.name)}</a></div></td>
    <td title="${esc(L.clickRegionHint)}"><span class="rgn" data-region="${esc(t.region)}">${esc(t.region)}</span></td><td class="num">${t.members ?? "-"}</td>
    <td class="num">${cell(L.teamPage, BASE + t.path)}</td><td class="num">${cell(L.demo, t.demoLink)}</td><td class="num">${cell(L.project, t.projectLink)}</td><td class="num">${cell("GitHub", t.sourceLink)}</td></tr>`).join("") + (teams.length ? "" : `<tr><td class="empty-row" colspan="8">${mounted.all.length ? L.noTeamMatch : L.noTeams}</td></tr>`) + blankRows(Math.max(pageTeams.length, 1), 8);
  const pager = pagerHtml(page, pages, teams.length, PAGE_SIZE);
  $("tsub").textContent = L.teamListSub(n(teams.length), PAGE_SIZE);
  $("list").innerHTML = `${pager}<div class="tscroll"><table>
    <colgroup><col style="width:64px"><col><col style="width:18%"><col style="width:110px"><col style="width:128px"><col style="width:128px"><col style="width:128px"><col style="width:128px"></colgroup>
    <thead><tr><th class="num">${L.no}</th><th>${L.team}</th><th>${L.region}</th><th class="num">${L.members}</th><th class="num">${L.teamPage}</th><th class="num">${L.demo}</th><th class="num">${L.project}</th><th class="num">${L.source}</th></tr></thead>
    <tbody>${rows}</tbody></table></div>`;
}
// 지역/검색어 필터를 적용하고 1페이지부터 다시 그린다 (입력할 때마다 기록이 쌓이지 않도록 replaceState)
function applyTeamFilter() {
  const m = mounted;
  m.teams = m.all.filter(t => (!m.region || t.region === m.region) && (!m.q || `${t.name} ${t.region}`.toLowerCase().includes(m.q)));
  m.pages = Math.max(1, Math.ceil(m.teams.length / PAGE_SIZE));
  $("chip").innerHTML = m.region ? `<button class="chip" type="button" title="${L.clearRegion}">${L.region}: ${esc(m.region)} ✕</button>` : "";
  $("tq").style.paddingLeft = m.region ? `${$("chip").offsetWidth + 14}px` : "";
  history.replaceState(null, "", `/mission/${encodeURIComponent(m.slug)}/1`);
  renderMission(m.slug, 1);
}

/* ---------- 팀 상세 ---------- */
const svg = d => `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const LinkIcon = Object.freeze({
  OFFICIAL: svg('<circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>'),
  DEMO: svg('<circle cx="12" cy="12" r="10"/><path d="m10 8 6 4-6 4z"/>'),
  PROJECT: svg('<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>'),
  GITHUB: svg('<path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.4 5.4 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65S8.93 17.38 9 18v4"/><path d="M9 18c-4.51 2-5-2-7-2"/>'),
});
const hostOf = u => { try { return new URL(u).hostname.replace(/^www\./, ""); } catch { return u; } };
function renderTeam(slug) {
  mounted = null;
  const t = TEAM_BY_SLUG.get(slug);
  if (!t) { setView(Nav.STATS, L.team); app.innerHTML = `<a class="back" href="/stats">${L.back}</a><div class="empty">${L.teamNotFound}</div>`; return; }
  const mission = CH_BY_TITLE.get(t.challenge);
  setView(Nav.STATS, t.name);
  const missionText = mission ? mText(mission, "title") : t.challenge;
  const regionLk = REG.some(r => r.name === t.region) ? `<a href="/regions/${encodeURIComponent(regionSlug(t.region))}">${esc(t.region)}</a>` : esc(t.region);
  const cards = [
    [L.members, t.members ?? "-"], [L.region, regionLk], [L.country, esc(t.country)],
    [L.mission, mission ? `<a href="/mission/${encodeURIComponent(mission.slug)}">${esc(missionText)}</a>` : esc(missionText)]
  ].map(([l, v]) => `<div class="card stat"><span>${l}</span><b style="font-size:20px">${v}</b></div>`).join("");
  const links = [[LinkIcon.OFFICIAL, L.officialTeam.replace(" ↗", ""), BASE + t.path], [LinkIcon.DEMO, L.demo, t.demoLink], [LinkIcon.PROJECT, L.project, t.projectLink], [LinkIcon.GITHUB, "GitHub", t.sourceLink]]
    .filter(([, , u]) => u).map(([icon, l, u]) => `<a class="link-tile" href="${esc(u)}" target="_blank" rel="noopener"><span class="ico">${icon}</span>
      <span class="txt"><b>${l}</b><small>${esc(hostOf(u))}</small></span><span class="go">↗</span></a>`).join("");
  app.innerHTML = `<a class="back" href="${mission ? `/mission/${encodeURIComponent(mission.slug)}` : "/stats"}">← ${esc(missionText)}</a><h1>${esc(t.name)}</h1>
    <div class="grid">${cards}</div>
    <div class="card team-sec"><div class="card-h"><h2>${L.introTitle}</h2></div><div class="card-c" id="intro" data-slug="${esc(slug)}"></div></div>
    <div class="card team-sec"><div class="card-h"><h2>${L.linksTitle}</h2></div><div class="card-c link-grid">${links}</div></div>`;
  loadTeamIntro(slug);
}
// 소개 글·이미지는 팀별 JSON(data/teams/<슬러그>.json)을 이 페이지를 열 때 하나만 불러온다. 파일이 없으면 소개가 없는 팀이다.
async function loadTeamIntro(slug) {
  let d = null;
  try { const r = await fetch(`/data/teams/${encodeURIComponent(slug)}.json`); if (r.ok) d = await r.json(); } catch {}
  const box = $("intro");
  if (!box || box.dataset.slug !== slug) return;  // 그 사이 다른 화면으로 이동했다
  box.innerHTML = `<div class="team-intro">${d?.image ? `<img class="team-img" src="${esc(d.image)}" alt="${esc(TEAM_BY_SLUG.get(slug).name)}">` : ""}
    ${d?.description ? `<p class="desc intro">${esc(d.description)}</p>` : `<p class="no">${L.noIntro}</p>`}</div>`;
}

/* ---------- 통계 ---------- */
const reg = { sortKey: "submitted", sortDir: -1, page: 1, q: "" };
const COLS = [["name", "region", ""], ["country", "country", ""], ["teams", "teamsReg", "r"], ["submitted", "teamsSub", "r"], ["rate", "rate", "r"]];
const regionSlug = name => name.toLowerCase().trim().replace(/\s+/g, "-");  // URL용 소문자 키 (예: "Abu Dhabi" -> "abu-dhabi")
const REG = D.regions.map(r => ({ ...r, slug: regionSlug(r.name), rate: r.submitted / r.teams }));

function renderStats() {
  mounted = null;
  setView(Nav.STATS, L.stats);
  const people = T.reduce((a, t) => a + (t.members || 0), 0);
  const byChallenge = count(T, t => t.challenge), byRegion = count(T, t => t.region);
  const cards = [
    [n(D.totalTeams), L.cardTotal], [n(T.length), L.cardSubmitted, L.cardRate(Math.round(T.length / D.totalTeams * 100))],
    [n(people), L.cardPeople, L.cardAvg((people / T.length).toFixed(1))],
    [n(byRegion.size), L.cardRegions], [n(new Set(T.map(t => t.country).filter(c => c && c !== "Anywhere in the World")).size), L.cardCountries], [n(byChallenge.size), L.cardMissions],
    [n(T.filter(t => t.sourceLink).length), L.cardGithub]
  ].map(([v, l, s]) => `<div class="card stat"><span>${l}</span><b>${v}</b>${s ? `<small>${s}</small>` : ""}</div>`).join("");
  const bars = (rows, fmt) => { const max = Math.max(...rows.map(r => r[1]));
    return rows.map(([l, v]) => `<div class="bar"><span class="l" title="${esc(l)}">${esc(l)}</span><span class="t"><i style="width:${v / max * 100}%"></i></span><span class="v">${fmt(v)}</span></div>`).join(""); };
  const dist = count(T, t => t.members ?? 0);
  app.innerHTML = `<h1>${L.stats}</h1><p class="lead">${L.statsLead(D.generatedAt)}</p>
    <div class="grid">${cards}</div>
    <div class="two">
      <div class="card"><div class="card-h"><h2>${L.distTitle}</h2><p>${L.distSub}</p></div><div class="card-c">${bars([...dist].sort((a, b) => a[0] - b[0]).map(([k, v]) => [L.unitPeople(k), v]), v => L.unitTeams(n(v)))}</div></div>
      <div class="card"><div class="card-h"><h2>${L.missionsTitle}</h2><p>${L.byMissionSub}</p></div><div class="card-c">${bars([...byChallenge].sort((a, b) => b[1] - a[1]).map(([t, v]) => [CH_BY_TITLE.has(t) ? mText(CH_BY_TITLE.get(t), "title") : t, v]), v => L.unitTeams(n(v)))}</div></div>
    </div>
    <h2 class="sec">${L.missionListTitle}</h2>${missionRows()}`;
}

// 지역 표 카드: 통계 탭과 지역 탭이 함께 쓴다
const regionsCard = () => `<div class="card"><div class="card-h" style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:flex-start;gap:12px"><div><h2>${L.regionsTitle}</h2><p id="rsub"></p></div>
        <input id="rq" type="search" placeholder="${L.searchPh}" style="flex:none;width:100%;max-width:360px" value="${esc(reg.q)}"></div>
      <div class="card-c" style="padding-top:12px">
      <div id="regtable"></div></div></div>`;
function bindRegions() {
  $("rq").addEventListener("input", e => { reg.q = e.target.value.trim().toLowerCase(); reg.page = 1; renderRegions(); });
  $("regtable").addEventListener("click", e => {
    const b = e.target.closest("button[data-p]"), th = e.target.closest("th[data-k]");
    if (b && !b.disabled) { reg.page = +b.dataset.p; renderRegions(); }
    else if (th) {
      const k = th.dataset.k;
      reg.sortDir = reg.sortKey === k ? -reg.sortDir : (k === "name" || k === "country" ? 1 : -1);
      reg.sortKey = k; reg.page = 1; renderRegions();
    }
  });
  renderRegions();
}

function renderRegions() {
  const { sortKey, sortDir, q } = reg;
  const rows = REG.filter(r => !q || r.name.toLowerCase().includes(q) || r.country.toLowerCase().includes(q))
    .sort((a, b) => (typeof a[sortKey] === "string" ? a[sortKey].localeCompare(b[sortKey]) : a[sortKey] - b[sortKey]) * sortDir || b.submitted - a.submitted);
  const pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const page = reg.page = clamp(reg.page, 1, pages);
  const pageRows = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  $("rsub").textContent = L.regionsSub(n(rows.length), PAGE_SIZE);
  $("regtable").innerHTML = `${pagerHtml(page, pages, rows.length, PAGE_SIZE)}<div class="tscroll"><table style="min-width:640px;table-layout:fixed">
    <colgroup><col style="width:7%"><col style="width:27%"><col style="width:23%"><col style="width:14%"><col style="width:14%"><col style="width:15%"></colgroup>
    <thead><tr><th class="num">${L.no}</th>${COLS.map(([k, l, c]) => `<th class="${c}" data-k="${k}" style="cursor:pointer">${L[l]}${sortKey === k ? (sortDir < 0 ? " ↓" : " ↑") : ""}</th>`).join("")}</tr></thead>
    <tbody>${pageRows.map((r, i) => `<tr class="go" data-href="/regions/${encodeURIComponent(r.slug)}"><td class="num">${(page - 1) * PAGE_SIZE + i + 1}</td><td><a class="name" href="/regions/${encodeURIComponent(r.slug)}">${esc(r.name)}</a></td><td>${esc(r.country)}</td><td class="r">${n(r.teams)}</td><td class="r">${n(r.submitted)}</td><td class="r">${Math.round(r.rate * 100)}%</td></tr>`).join("")}${blankRows(pageRows.length, 6)}</tbody></table></div>`;
}

/* ---------- 지역 ---------- */
function renderRegionList() {
  setView(Nav.REGIONS, L.navRegions);
  app.innerHTML = `<h1>${L.navRegions}</h1><p class="lead">${L.regionsLead(D.generatedAt)}</p>${regionsCard()}`;
  bindRegions();
}

const REGION_OPEN_MAX = 100;  // 제출 팀이 이 수 이하인 지역은 미션 목록을 처음부터 펼친다
const teamRow = (t, i) => `<tr class="go" data-href="${teamHref(t)}"><td class="num">${i + 1}</td><td><div class="tname">${avatar(t)}<a class="name" href="${teamHref(t)}">${esc(t.name)}</a></div></td>
  <td class="num">${t.members ?? "-"}</td><td class="num">${cell(L.teamPage, BASE + t.path)}</td><td class="num">${cell(L.demo, t.demoLink)}</td><td class="num">${cell(L.project, t.projectLink)}</td><td class="num">${cell("GitHub", t.sourceLink)}</td></tr>`;
const fillMission = d => {  // 표는 처음 펼칠 때 한 번만 그린다 (팀이 수천 개인 지역 대비)
  if (d.dataset.filled) return;
  d.dataset.filled = "1";
  d.querySelector(".tw").innerHTML = `<table><colgroup><col style="width:64px"><col><col style="width:110px"><col style="width:128px"><col style="width:128px"><col style="width:128px"><col style="width:128px"></colgroup>
    <thead><tr><th class="num">${L.no}</th><th>${L.team}</th><th class="num">${L.members}</th><th class="num">${L.teamPage}</th><th class="num">${L.demo}</th><th class="num">${L.project}</th><th class="num">${L.source}</th></tr></thead>
    <tbody>${regionTeams.get(d.dataset.title).map(teamRow).join("")}</tbody></table>`;
};
const ACCORDION_MS = 250;
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
const setOpen = (d, open) => {  // 높이/투명도 애니메이션으로 펼치고 접는다
  const tw = d.querySelector(".tw");
  if (open === (d.open && !d.classList.contains("shut"))) return;
  d._anim?.cancel();
  d.classList.toggle("shut", !open);
  if (open) { d.open = true; fillMission(d); }
  if (reduceMotion.matches) { d.open = open; return; }
  const full = tw.scrollHeight + 1;
  tw.classList.add("anim");
  const keys = open ? { height: ["0px", full + "px"], opacity: [0, 1] } : { height: [tw.offsetHeight + "px", "0px"], opacity: [1, 0] };
  const a = d._anim = tw.animate(keys, { duration: ACCORDION_MS, easing: "ease" });
  a.onfinish = () => { tw.classList.remove("anim"); d._anim = null; if (!open) d.open = false; };
  a.oncancel = () => tw.classList.remove("anim");
};
let regionTeams = new Map();  // 현재 지역의 미션 title -> 팀 목록 (이름순)
function renderRegion(name) {
  mounted = null;
  const region = REG.find(r => r.slug === regionSlug(name));
  if (!region) { setView(Nav.REGIONS, L.navRegions); app.innerHTML = `<a class="back" href="/regions">${L.regionBack}</a><div class="empty">${L.regionNotFound}</div>`; return; }
  setView(Nav.REGIONS, region.name);
  const teams = T.filter(t => t.region === region.name);
  const people = teams.reduce((a, t) => a + (t.members || 0), 0);
  const byMission = new Map();
  teams.forEach(t => (byMission.get(t.challenge) || byMission.set(t.challenge, []).get(t.challenge)).push(t));
  byMission.forEach(ts => ts.sort((a, b) => a.name.localeCompare(b.name)));
  regionTeams = byMission;
  const cards = [
    [n(region.teams), L.cardTotal], [n(teams.length), L.cardSubmitted, L.cardRate(Math.round(region.rate * 100))],
    [n(people), L.cardPeople, teams.length ? L.cardAvg((people / teams.length).toFixed(1)) : ""],
    [n(byMission.size), L.cardMissions], [n(teams.filter(t => t.sourceLink).length), L.cardGithub]
  ].map(([v, l, s]) => `<div class="card stat"><span>${l}</span><b>${v}</b>${s ? `<small>${s}</small>` : ""}</div>`).join("");
  const open = teams.length <= REGION_OPEN_MAX ? "open" : "";
  const missions = [...byMission].sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0])).map(([title, ts]) => {
    const c = CH_BY_TITLE.get(title);
    return `<details ${open} data-title="${esc(title)}"><summary>${c?.image ? `<img class="mission-thumb" src="${esc(c.image)}" alt="" loading="lazy">` : ""}<span class="sum-t"><span>${esc(c ? mText(c, "title") : title)}</span>${c ? `<small>${esc(mText(c, "summary") || mText(c, "excerpt"))}</small>` : ""}</span>
      ${c ? `<a class="badge badge-lk" href="${BASE + esc(c.path)}" target="_blank" rel="noopener">${L.official}</a>` : ""}<span class="badge">${L.badge(n(ts.length), n(ts.reduce((a, t) => a + (t.members || 0), 0)))}</span></summary><div class="tw"></div></details>`;
  }).join("");
  app.innerHTML = `<a class="back" href="/regions">${L.regionBack}</a><h1>${esc(region.name)}</h1><p class="lead">${esc(region.country)}</p>
    <div class="grid grid3">${cards}</div><div class="sec-h"><h2 class="sec">${L.regionMissionsTitle}</h2>${teams.length ? `<span><button class="more" data-all="1">${L.expandAll}</button><button class="more" data-all="0">${L.collapseAll}</button></span>` : ""}</div>
    ${teams.length ? missions : `<div class="empty">${L.noRegionTeams}</div>`}`;
  app.querySelectorAll("button[data-all]").forEach(b => b.addEventListener("click", () => app.querySelectorAll("details").forEach(d => setOpen(d, b.dataset.all === "1"))));
  app.querySelectorAll("details").forEach(d => {
    if (d.open) fillMission(d);
    d.querySelector("summary").addEventListener("click", e => { e.preventDefault(); setOpen(d, d.classList.contains("shut") || !d.open); });
  });
}

/* ---------- 소개 ---------- */
function renderAbout() {
  mounted = null;
  setView(Nav.ABOUT, L.navAbout);
  app.innerHTML = `<h1>${L.aboutTitle}</h1>
    <div class="card"><div class="card-c">${L.aboutBody.map(p => `<p class="desc">${p}</p>`).join("")}
      <a class="ext" href="${BASE}" target="_blank" rel="noopener">${L.aboutOfficial}</a></div></div>
    <div class="card notice"><div class="card-h"><h2>${L.aboutNoticeTitle}</h2></div><div class="card-c"><p class="desc">${L.aboutNotice}</p></div></div>
    <div class="card notice"><div class="card-h"><h2>${L.aboutReportTitle}</h2></div><div class="card-c"><p class="desc">${L.aboutReport}</p><a class="ext" href="${REPO_URL}" target="_blank" rel="noopener">${L.repoLink}</a></div></div>`;
}

/* ---------- 라우터 ---------- */
let lastView = "";
function route() {
  const [, kind, slug, p] = location.pathname.split("/").map(decodeURIComponent);
  const view = `${kind}/${slug}`;
  if (view !== lastView) scrollTo(0, 0);  // 다른 화면으로 갈 때만 맨 위로
  lastView = view;
  if (kind === "mission" && slug) renderMission(slug, parseInt(p, 10) || 1);
  else if (kind === "teams" && slug) renderTeam(slug);
  else if (kind === "about") renderAbout();
  else if (kind === "regions" && slug) renderRegion(slug);
  else if (kind === "regions") { mounted = null; renderRegionList(); }
  else renderStats();
}
const go = path => { history.pushState(null, "", path); route(); };
// 내부 링크(<a href="/...">)와 미션 페이지네이션 버튼: 페이지를 새로 불러오지 않고 라우팅만 한다
document.addEventListener("click", e => {
  const a = e.target.closest("a[href^='/']");
  if (a && !a.target && !e.metaKey && !e.ctrlKey && !e.shiftKey && e.button === 0) { e.preventDefault(); go(a.getAttribute("href")); return; }
  const row = e.target.closest("[data-href]");
  if (row && !e.target.closest("a, button, [data-region]") && !e.metaKey && !e.ctrlKey && !e.shiftKey && e.button === 0) { go(row.dataset.href); return; }
  const b = e.target.closest("#list button[data-p]");
  if (b && !b.disabled) go(`/mission/${encodeURIComponent(mounted.slug)}/${b.dataset.p}`);
});
addEventListener("popstate", route);
$("lang").addEventListener("click", () => {
  lang = lang === Lang.KO ? Lang.EN : Lang.KO;
  L = STRINGS[lang];
  try { localStorage.setItem(LANG_KEY, lang); } catch {}
  mounted = null;  // 머리글이 캐시되어 있으므로 다시 그린다
  route();
});
// 404.html 이 보낸 ?p=/경로 를 주소창의 실제 경로로 복원하고, 옛 #/경로 링크도 새 경로로 바꾼다
const redirected = new URLSearchParams(location.search).get("p") || (location.hash.startsWith("#/") && location.hash.slice(1));
if (redirected) history.replaceState(null, "", redirected);
route();
