package app

import (
	"WhyAi"
	"WhyAi/internal/config"
	"WhyAi/internal/handler"
	"WhyAi/internal/repository"
	"WhyAi/internal/service"
	"WhyAi/pkg/logger"
	redis2 "WhyAi/pkg/redis"
	"fmt"
)

func Run() {

	cfg := config.Load()
	fmt.Println("Initializing...")
	fmt.Println("\n██╗   ██╗███████╗██████╗ ██████╗ ██╗███████╗██╗   ██╗\n██║   ██║██╔════╝██╔══██╗██╔══██╗██║██╔════╝╚██╗ ██╔╝\n██║   ██║█████╗  ██████╔╝██████╔╝██║█████╗   ╚████╔╝ \n╚██╗ ██╔╝██╔══╝  ██╔══██╗██╔══██╗██║██╔══╝    ╚██╔╝  \n ╚████╔╝ ███████╗██║  ██║██████╔╝██║██║        ██║   \n  ╚═══╝  ╚══════╝╚═╝  ╚═╝╚═════╝ ╚═╝╚═╝        ╚═╝   \n                                                     \n")
	fmt.Println("Version: 1.0.0")
	logger.Log.Infof("RUNNING MODE: %s", cfg.Server.Mode)
	logger.Log.Infof("PORT: %s | FRONTEND: %s", cfg.Server.Port, cfg.Security.FrontendUrl)
	logger.Log.Infof("PAYMENT SERVICE URL %s", cfg.Payment.BaseURL)
	logger.Log.Infof("DB_HOST: %s | DB_PORT: %s", cfg.Database.Host, cfg.Database.Port)
	redis := redis2.NewClient(cfg)
	//Подключение к бд
	db, err := repository.NewDB(cfg)
	if err != nil {
		logger.Log.Fatalf("Error connecting to database: %v", err)
	}
	logger.Log.Infoln("Database connection established")
	//Инициализация зависимостей
	NewRepository := repository.NewRepository(db)
	NewService := service.NewService(cfg, NewRepository)
	NewHandler := handler.NewHandler(NewService, redis, cfg)
	server := new(WhyAi.Server)
	logger.Log.Println("Running server")
	if err = server.Run(cfg, NewHandler); err != nil {
		logger.Log.Fatalf("Fatal Error: %v", err)
	}
}
