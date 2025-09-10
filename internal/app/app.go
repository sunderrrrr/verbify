package app

import (
	"WhyAi"
	"WhyAi/internal/config"
	"WhyAi/internal/handler"
	"WhyAi/internal/repository"
	"WhyAi/internal/service"
	"WhyAi/pkg/logger"
	"fmt"
)

func Run() {

	cfg := config.Load()
	fmt.Println("Initializing...")
	fmt.Println("\n██╗   ██╗███████╗██████╗ ██████╗ ██╗███████╗██╗   ██╗\n██║   ██║██╔════╝██╔══██╗██╔══██╗██║██╔════╝╚██╗ ██╔╝\n██║   ██║█████╗  ██████╔╝██████╔╝██║█████╗   ╚████╔╝ \n╚██╗ ██╔╝██╔══╝  ██╔══██╗██╔══██╗██║██╔══╝    ╚██╔╝  \n ╚████╔╝ ███████╗██║  ██║██████╔╝██║██║        ██║   \n  ╚═══╝  ╚══════╝╚═╝  ╚═╝╚═════╝ ╚═╝╚═╝        ╚═╝   \n                                                     \n")
	fmt.Println("Version: 1.0.0")
	logger.Log.Infof("RUNNING MODE: %s", cfg.Server.Mode)
	logger.Log.Infof("PORT: %s | FRONTEND: %s", cfg.Server.Port, cfg.Security.FrontendUrl)
	logger.Log.Infof("DB_HOST: %s | DB_PORT: %s", cfg.Database.Host, cfg.Database.Port)

	//Подключение к бд
	db, err := repository.NewDB(cfg)
	if err != nil {
		logger.Log.Fatalf("Error connecting to database: %v", err)
	}
	logger.Log.Infoln("Database connection established")
	//Инициализация зависимостей
	NewRepository := repository.NewRepository(db)
	NewService := service.NewService(NewRepository)
	NewHandler := handler.NewHandler(NewService)
	server := new(WhyAi.Server)
	logger.Log.Println("Running server")
	if err = server.Run(cfg, NewHandler); err != nil {
		logger.Log.Fatalf("Fatal Error: %v", err)
	}
}
