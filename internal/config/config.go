package config

import (
	"WhyAi/pkg/logger"
	"fmt"
	"log"
	"sync"

	"github.com/joho/godotenv"
	"github.com/spf13/viper"
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
	Redis struct {
		Host     string `mapstructure:"HOST"`
		Port     string `mapstructure:"PORT"`
		Password string `mapstructure:"PASSWORD"`
		DB       string `mapstructure:"DB"`
	} `mapstructure:"REDIS"`
	LLM struct {
		APIKey  string `mapstructure:"API_KEY"`
		BaseURL string `mapstructure:"BASE_URL"`
	} `mapstructure:"LLM"`
	Payment struct {
		ApiKey  string `mapstructure:"API_KEY"`
		BaseURL string `mapstructure:"BASE_URL"`
	} `mapstructure:"PAYMENT"`

	Security struct {
		Salt        string `mapstructure:"SALT"`
		SigningKey  string `mapstructure:"SIGNING_KEY"`
		FrontendUrl string `mapstructure:"FRONTEND_URL"`
	} `mapstructure:"SECURITY"`
}

var (
	config *Config
	once   sync.Once
)

func Load() (*Config, error) {
	once.Do(func() {
		viper.SetConfigName("config")
		viper.SetConfigType("yaml")
		viper.AddConfigPath(".")
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

		viper.BindEnv("database.password", "DATABASE_PASSWORD")
		viper.BindEnv("database.user", "DATABASE_USER")
		viper.BindEnv("database.name", "DATABASE_NAME")
		viper.BindEnv("llm.api_key", "LLM_API_KEY")
		viper.BindEnv("security.salt", "SECURITY_SALT")
		viper.BindEnv("security.signing_key", "SECURITY_SIGNING_KEY")
		viper.BindEnv("redis.password", "REDIS_PASSWORD")
		viper.BindEnv("redis.db", "REDIS_DB")
		viper.BindEnv("payment.api_key", "PAYMENT_API_KEY")
		viper.AutomaticEnv()

		if err := viper.ReadInConfig(); err != nil {
			fmt.Printf("Error reading config file, %s", err)
		}

		config = &Config{}
		if err := viper.Unmarshal(config); err != nil {
			logger.Log.Fatalf("unable to decode config: %v", err)
		}
		if config.Database.Password == "" {
			log.Fatal("DATABASE_PASSWORD environment variable is required")
		}

	})

	return config, nil
}
