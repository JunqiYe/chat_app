# syntax=docker/dockerfile:1

FROM golang:1.20-alpine AS build-stage
WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download


RUN apk add build-base
RUN wget -q -O /etc/apk/keys/sgerrand.rsa.pub https://alpine-pkgs.sgerrand.com/sgerrand.rsa.pub
RUN wget https://github.com/sgerrand/alpine-pkg-glibc/releases/download/2.35-r1/glibc-2.35-r1.apk
RUN apk add glibc-2.35-r1.apk
RUN apk add --no-cache musl-dev


COPY . .

RUN GOOS=linux CGO_ENABLED=1 go build -ldflags '-linkmode external -w -extldflags "-static"' -tags musl -o /bin/cloudServer cmd/server/server.go
RUN chmod +x /bin/cloudServer

RUN mkdir /log
RUN touch /log/testlogfile
RUN chmod a+rw /log/testlogfile


# Deploy the application binary into a lean image
FROM gcr.io/distroless/base-debian11 AS build-release-stage

WORKDIR /

COPY --from=build-stage /bin/cloudServer /bin/cloudServer
COPY --from=build-stage /log/testlogfile /log/testlogfile

EXPOSE 8080 9092

USER nonroot:nonroot

ENTRYPOINT ["/bin/cloudServer"]
