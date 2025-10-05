
COMPOSE=docker-compose
DEV_FILE=docker-compose.override.yml
PROD_FILE=docker-compose.yml

dev:
	@echo "Запуск локальной разработки..."
	$(COMPOSE) up --build

dev-down:
	@echo "Остановка локального окружения..."
	$(COMPOSE) down

dev-restart: dev-down dev


prod-up:
	@echo "Запуск продакшн окружения..."
	$(COMPOSE) -f $(PROD_FILE) up --build -d

prod-down:
	@echo "Остановка продакшн окружения..."
	$(COMPOSE) -f $(PROD_FILE) down

prod-restart: prod-down prod-up

logs:
	@echo "Просмотр логов всех сервисов..."
	$(COMPOSE) logs -f

ps:
	@echo "Список запущенных контейнеров..."
	$(COMPOSE) ps

clean:
	@echo "Удаление всех контейнеров и сетей..."
	$(COMPOSE) down -v
