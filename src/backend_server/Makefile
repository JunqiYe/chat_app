cloudServer:
	go build -o /bin/cloudServer cmd/server/server.go

.PHONY: server
server: cloudServer
	./bin/cloudServer
# go run -race cmd/server/server.go

.PHONY: testing_server
testing_server: cloudServer
	./bin/cloudServer -test

.PHONY: local_test_server
local_test_server:
	./bin/cloudServer ./test
# go run -race cmd/server/server.go ./test



