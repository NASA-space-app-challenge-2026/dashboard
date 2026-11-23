// History API 라우팅 SPA: /stats (기본), /mission/<slug>/<page>, /regions, /regions/<소문자-하이픈 이름>, /about
const BASE = "https://www.spaceappschallenge.org";
const PAGE_SIZE = 20;
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
    missionsTitle: "미션별 제출 팀", missionListTitle: "미션 목록", mission: "미션",
    badge: (teams, members) => `${teams}팀 · ${members}명`,
    back: "← 통계", notFound: "존재하지 않는 미션입니다.",
    detailLead: (teams, members) => `제출 팀 ${teams}팀 · 총 ${members}명`,
    official: "공식 미션 페이지 ↗", noTeams: "제출한 팀이 없습니다.",
    teamPage: "팀 페이지", intro: "소개", demo: "데모", source: "소스",
    team: "팀명", region: "지역", members: "팀원 수", country: "국가", teamsReg: "등록 팀", teamsSub: "제출 팀", rate: "제출률", no: "번호",
    prev: "이전", next: "다음",
    stats: "통계", statsLead: date => `기준일 ${date}`,
    cardTotal: "전체 등록 팀", cardSubmitted: "최종 제출 팀", cardRate: pct => `제출률 ${pct}%`,
    cardPeople: "제출 팀 인원", cardAvg: avg => `팀당 평균 ${avg}명`,
    cardRegions: "지역 수", cardCountries: "참가 국가 수", cardMissions: "미션 수",
    cardDemo: "웹 데모 있는 팀", cardGithub: "GitHub 있는 팀",
    distTitle: "팀원 수 분포", distSub: "제출 팀 기준", byMissionSub: "팀 수 많은 순",
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
    missionsTitle: "Submitted Teams by Mission", missionListTitle: "Missions", mission: "Mission",
    badge: (teams, members) => `${teams} teams · ${members} members`,
    back: "← Stats", notFound: "Mission not found.",
    detailLead: (teams, members) => `${teams} submitted teams · ${members} members total`,
    official: "Official mission page ↗", noTeams: "No teams have submitted.",
    teamPage: "Team page", intro: "Intro", demo: "Demo", source: "Source",
    team: "Team", region: "Region", members: "Members", country: "Country", teamsReg: "Registered", teamsSub: "Submitted", rate: "Rate", no: "No.",
    prev: "Prev", next: "Next",
    stats: "Stats", statsLead: date => `As of ${date}`,
    cardTotal: "Registered teams", cardSubmitted: "Final submitted teams", cardRate: pct => `${pct}% submitted`,
    cardPeople: "Members on submitted teams", cardAvg: avg => `${avg} per team on average`,
    cardRegions: "Regions", cardCountries: "Participating countries", cardMissions: "Missions",
    cardDemo: "Teams with web demo", cardGithub: "Teams with GitHub",
    distTitle: "Team size distribution", distSub: "Submitted teams", byMissionSub: "Most teams first",
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
  $("footer").textContent = L.footer;
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
      return `<a class="mission-row" href="/mission/${encodeURIComponent(c.slug)}">${esc(mText(c, "title"))}
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
    mounted = { slug, teams, pages: Math.max(1, Math.ceil(teams.length / PAGE_SIZE)) };
    app.innerHTML = `<a class="back" href="/stats">${L.back}</a><h1>${esc(mText(mission, "title"))}</h1>
      <p class="lead">${L.detailLead(n(teams.length), n(teams.reduce((a, t) => a + (t.members || 0), 0)))}</p>
      <p class="desc">${esc(mText(mission, "excerpt"))}</p>
      <a class="ext" href="${BASE + esc(mission.path)}" target="_blank" rel="noopener">${L.official}</a>
      <div id="list"></div>`;
  }
  const { teams, pages } = mounted, page = clamp(pageParam, 1, pages);
  const pageTeams = teams.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const rows = pageTeams.map((t, i) => `<tr>
    <td class="num">${(page - 1) * PAGE_SIZE + i + 1}</td><td><a class="name" href="${BASE + esc(t.path)}" target="_blank" rel="noopener">${esc(t.name)}</a></td>
    <td title="${esc(t.region)}">${esc(t.region)}</td><td class="num">${t.members ?? "-"}</td>
    <td class="num">${cell(L.teamPage, BASE + t.path)}</td><td class="num">${cell(L.intro, t.introLink)}</td><td class="num">${cell(L.demo, t.demoLink)}</td><td class="num">${cell("GitHub", t.sourceLink)}</td></tr>`).join("") + blankRows(pageTeams.length, 8);
  const pager = pagerHtml(page, pages, teams.length, PAGE_SIZE);
  $("list").innerHTML = teams.length ? `${pager}<div class="mission-t"><div class="tw" style="border:0"><table>
    <colgroup><col style="width:64px"><col><col style="width:18%"><col style="width:110px"><col style="width:128px"><col style="width:128px"><col style="width:128px"><col style="width:128px"></colgroup>
    <thead><tr><th class="num">${L.no}</th><th>${L.team}</th><th>${L.region}</th><th class="num">${L.members}</th><th class="num">${L.teamPage}</th><th class="num">${L.intro}</th><th class="num">${L.demo}</th><th class="num">${L.source}</th></tr></thead>
    <tbody>${rows}</tbody></table></div></div>` : `<div class="empty">${L.noTeams}</div>`;
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
    [n(T.filter(t => t.demoLink).length), L.cardDemo], [n(T.filter(t => t.sourceLink).length), L.cardGithub]
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
  $("regtable").innerHTML = `${pagerHtml(page, pages, rows.length, PAGE_SIZE)}<div style="overflow-x:auto"><table style="min-width:640px;table-layout:fixed">
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
const teamRow = (t, i) => `<tr><td class="num">${i + 1}</td><td><a class="name" href="${BASE + esc(t.path)}" target="_blank" rel="noopener">${esc(t.name)}</a></td>
  <td class="num">${t.members ?? "-"}</td><td class="num">${cell(L.teamPage, BASE + t.path)}</td><td class="num">${cell(L.intro, t.introLink)}</td><td class="num">${cell(L.demo, t.demoLink)}</td><td class="num">${cell("GitHub", t.sourceLink)}</td></tr>`;
const fillMission = d => {  // 표는 처음 펼칠 때 한 번만 그린다 (팀이 수천 개인 지역 대비)
  if (d.dataset.filled) return;
  d.dataset.filled = "1";
  d.querySelector(".tw").innerHTML = `<table><colgroup><col style="width:64px"><col><col style="width:110px"><col style="width:128px"><col style="width:128px"><col style="width:128px"><col style="width:128px"></colgroup>
    <thead><tr><th class="num">${L.no}</th><th>${L.team}</th><th class="num">${L.members}</th><th class="num">${L.teamPage}</th><th class="num">${L.intro}</th><th class="num">${L.demo}</th><th class="num">${L.source}</th></tr></thead>
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
    [n(byMission.size), L.cardMissions], [n(teams.filter(t => t.demoLink).length), L.cardDemo], [n(teams.filter(t => t.sourceLink).length), L.cardGithub]
  ].map(([v, l, s]) => `<div class="card stat"><span>${l}</span><b>${v}</b>${s ? `<small>${s}</small>` : ""}</div>`).join("");
  const open = teams.length <= REGION_OPEN_MAX ? "open" : "";
  const missions = [...byMission].sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0])).map(([title, ts]) => {
    const c = CH_BY_TITLE.get(title);
    return `<details ${open} data-title="${esc(title)}"><summary><span class="sum-t"><span>${esc(c ? mText(c, "title") : title)}</span>${c ? `<small>${esc(mText(c, "summary") || mText(c, "excerpt"))}</small>` : ""}</span>
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
    <div class="card notice"><div class="card-h"><h2>${L.aboutNoticeTitle}</h2></div><div class="card-c"><p class="desc">${L.aboutNotice}</p></div></div>`;
}

/* ---------- 라우터 ---------- */
let lastView = "";
function route() {
  const [, kind, slug, p] = location.pathname.split("/").map(decodeURIComponent);
  const view = `${kind}/${slug}`;
  if (view !== lastView) scrollTo(0, 0);  // 다른 화면으로 갈 때만 맨 위로
  lastView = view;
  if (kind === "mission" && slug) renderMission(slug, parseInt(p, 10) || 1);
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
  const row = e.target.closest("tr[data-href]");
  if (row && !e.metaKey && !e.ctrlKey && !e.shiftKey && e.button === 0) { go(row.dataset.href); return; }
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
