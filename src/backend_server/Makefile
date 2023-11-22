.PHONY: server
server:
	go run -race cmd/server/main.go ./data


server.exe: 
	go build cmd/server/main.go bin/server.exe

.PHONY: test
test: server.exe
	sudo ./main ./test &

.PHONY: local_test
local_test: server.exe
	go run -race main.go ./test

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

