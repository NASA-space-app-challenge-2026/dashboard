HOST := 127.0.0.1
PORT ?= 8000
URL = http://$(HOST):$(PORT)

.PHONY: run

# Opens the default browser once the server responds.
run:
	(curl -sf --retry 5 --retry-connrefused --retry-delay 1 -o /dev/null $(URL) && open $(URL)) & \
	python3 -m http.server $(PORT) --bind $(HOST)
