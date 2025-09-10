package config

import (
	"fmt"
	"github.com/joho/godotenv"
	"github.com/spf13/viper"
	"log"
	"sync"
)

type Config struct {
	Server struct {
		Mode string `mapstructure:"MODE"`
		Port string `mapstructure:"PORT"`
		Host string `mapstructure:"HOST"`
	} `mapstructure:"SERVER"`

	Database struct {
		Host     string `mapstructure:"HOST"`
		Port     string `mapstructure:"PORT"`
		User     string `mapstructure:"USER"`
		Password string `mapstructure:"PASSWORD"`
		Name     string `mapstructure:"NAME"`
		SSLMode  string `mapstructure:"SSL_MODE"`
	} `mapstructure:"DATABASE"`

	LLM struct {
		APIKey  string `mapstructure:"API_KEY"`
		BaseURL string `mapstructure:"BASE_URL"`
	} `mapstructure:"LLM"`

	Security struct {
		FrontendUrl string `mapstructure:"FRONTEND_URL"`
	} `mapstructure:"SECURITY"`
}

var (
	config *Config
	once   sync.Once
)

func Load() *Config {
	once.Do(func() {
		viper.SetConfigName("config")
		viper.SetConfigType("yaml")
		viper.AddConfigPath(".")
		viper.AddConfigPath("./config")
		if viper.GetString("server.mode") != "PROD" {
			if err := godotenv.Load(); err != nil {
				log.Printf("Warning: .env file not found: %v", err)
			}
		}
		viper.SetDefault("SERVER.PORT", "8080")
		viper.SetDefault("SERVER.HOST", "0.0.0.0")
		viper.SetDefault("DATABASE.SSL_MODE", "disable")
		viper.SetDefault("LLM.BASE_URL", "https://api.proxyapi.ru/deepseek/chat/completions")
		viper.SetDefault("SECURITY.FRONTEND_URL", "http://localhost:3000")

		// Явные привязки ENV variables к путям конфига
		viper.BindEnv("database.password", "DATABASE_PASS")
		viper.BindEnv("database.user", "DATABASE_USER")
		viper.BindEnv("database.name", "DATABASE_NAME")
		viper.BindEnv("llm.api_key", "LLM_API_KEY")

		viper.AutomaticEnv()

		if err := viper.ReadInConfig(); err != nil {
			log.Printf("Warning: Config file not found: %v", err)
		}

		config = &Config{}
		if err := viper.Unmarshal(config); err != nil {
			panic(fmt.Sprintf("Unable to decode config: %v", err))
		}

		// Проверка обязательных полей
		if config.Database.Password == "" {
			log.Fatal("DATABASE_PASSWORD environment variable is required")
		}

	})

	return config
}
