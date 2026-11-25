"""로컬 개발 서버. 사용법: python3 src/dev_server.py <host> <port>

브라우저가 받아 간 파일이 바뀌면 새로고침한다 (감시할 파일을 따로 적지 않는다). 사이트의 하위 주소(/stats, /teams/...)는 index.html 로 응답한다.
"""
import sys, time, webbrowser
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

from crawl import ROOT

INDEX = ROOT / "index.html"
RELOAD_PATH = "/__reload"
RELOAD_SCRIPT = """<script>setInterval(async () => {{
  try {{ if (Number(await (await fetch("{path}")).text()) > {loaded_at}) location.reload(); }} catch {{}}
}}, 1000);</script>
"""


served = set()  # 브라우저에 보낸 파일. 이 파일들만 감시한다


def last_modified():
    return max((f.stat().st_mtime for f in list(served) if f.is_file()), default=0)


class Handler(SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == RELOAD_PATH:
            return self.reply(str(last_modified()), "text/plain")
        target = Path(self.translate_path(self.path))
        if target == INDEX or (not target.is_file() and "text/html" in self.headers.get("Accept", "")):
            served.add(INDEX)
            script = RELOAD_SCRIPT.format(path=RELOAD_PATH, loaded_at=time.time())
            return self.reply(INDEX.read_text().replace("</body>", script + "</body>"), "text/html")
        if target.is_file():
            served.add(target)
        super().do_GET()

    def reply(self, text, content_type):
        body = text.encode()
        self.send_response(200)
        self.send_header("Content-Type", f"{content_type}; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")  # index.html 의 ?v= 해시가 그대로여도 고친 파일을 다시 받는다
        super().end_headers()

    def log_request(self, code="-", size="-"):
        if self.path != RELOAD_PATH:
            super().log_request(code, size)


if __name__ == "__main__":
    host, port = sys.argv[1], int(sys.argv[2])
    with ThreadingHTTPServer((host, port), partial(Handler, directory=str(ROOT))) as server:
        url = f"http://{host}:{port}"
        print(f"{url} (종료: Ctrl+C)", flush=True)
        webbrowser.open(url)
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            pass
