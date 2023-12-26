.PHONY: server
server:
	go run -race cmd/server/server.go

.PHONY: test_server
test_server:
	go run -race cmd/server/server.go -test

server.exe:
	go build -o bin/server.exe cmd/server/server.go

.PHONY: test
test: server.exe
	sudo ./bin/server.exe -test ./test &

.PHONY: local_test
local_test:
	go run -race cmd/server/server.go ./test

.PHONY: cloud_test
cloud_test:
	go run msg_cloudTest.go
# go build main.go
# go run cmd/fetch/main.go -req ./cmd/fetch/samples/input.txt -resp ./cmd/fetch/samples/output.txt localhost:8080
# .PHONY: gohttpd
# gohttpd:
# 	go run cmd/gohttpd/main.go ./docroot_dirs/htdocs1 8080

# .PHONY: tritonhttpd
# tritonhttpd:
# 	go run cmd/tritonhttpd/main.go -port 8080 -vh_config ./virtual_hosts.yaml -docroot ./docroot_dirs

