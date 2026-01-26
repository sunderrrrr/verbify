FROM golang:1.24 AS builder

WORKDIR /app

# Копируем файлы зависимостей
COPY go.mod go.sum ./
RUN go mod download

COPY . .


FROM builder AS development-builder

# Сборка для разработки (с отладочной информацией)
RUN CGO_ENABLED=0 GOOS=linux go build -o server ./cmd/main.go


FROM builder AS production-builder

# Сборка для продакшена (оптимизированная)
RUN CGO_ENABLED=0 GOOS=linux go build \
    -ldflags="-s -w -X main.buildTime=$(date -u +'%Y-%m-%d_%H:%M:%S')" \
    -o server ./cmd/main.go


FROM debian:bookworm-slim AS development

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    tzdata \
    curl \
    bash \
    vim \
    git \
    htop \
    net-tools \
    dnsutils \
    procps \
    && rm -rf /var/lib/apt/lists/*

COPY --from=development-builder /app/server .

COPY --from=development-builder /app/static ./static/
COPY --from=development-builder /app/config.yml ./

COPY --from=development-builder /app/ ./

VOLUME ["/app"]

EXPOSE 8090

CMD ["./server"]


FROM debian:bookworm-slim AS production

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    tzdata \
    && rm -rf /var/lib/apt/lists/*

COPY --from=production-builder /app/server .

COPY --from=production-builder /app/static ./static/
COPY --from=production-builder /app/config.yml ./

RUN groupadd --system --gid 10001 appgroup && \
    useradd --system --uid 10001 --gid appgroup appuser && \
    chown -R appuser:appgroup /app

USER appuser

EXPOSE 8090

CMD ["./server"]