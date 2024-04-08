# syntax=docker/dockerfile:1

FROM golang:1.20 AS build-stage
WORKDIR /app
# COPY go.mod go.sum ./
COPY . .
RUN go mod download
RUN CGO_ENABLED=1 GOOS=linux make cloudServer

# Deploy the application binary into a lean image
FROM gcr.io/distroless/base-debian11 AS build-release-stage

WORKDIR /

COPY --from=build-stage /bin/cloudServer /bin/cloudServer

EXPOSE 8080 9091 9092

USER nonroot:nonroot

ENTRYPOINT ["/bin/cloudServer"]
