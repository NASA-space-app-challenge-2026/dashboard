HOST := 127.0.0.1
PORT ?= 8000

.PHONY: dev

# Serves the site, opens the browser and reloads it when files change.
dev:
	python3 src/dev_server.py $(HOST) $(PORT)
