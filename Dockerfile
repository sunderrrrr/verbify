FROM golang:1.24 AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download
COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o server ./cmd/main.go

FROM debian:bookworm-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates tzdata curl bash \
 && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app .


EXPOSE 8090

CMD ["./server"]
