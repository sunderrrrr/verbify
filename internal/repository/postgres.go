package repository

import (
	"WhyAi/internal/config"
	"fmt"
	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
	"log"
)

type DB struct {
	Host     string
	Port     string
	Username string
	Password string
	Database string
	SSLMode  string
}

const (
	userDb = "users"
	chatDb = "chats"
	msgDb  = "messages"
)

func NewDB(cfg *config.Config) (*sqlx.DB, error) {
	query := fmt.Sprintf("host=%s port=%s user=%s dbname=%s password=%s sslmode=%s", cfg.Database.Host, cfg.Database.Port, cfg.Database.User, cfg.Database.Name, cfg.Database.Password, cfg.Database.SSLMode)
	postgres, err := sqlx.Connect("postgres", query)
	if err != nil {
		return nil, err
	}
	err = postgres.Ping()
	if err != nil {
		log.Fatalf("postgres.go: error connecting to database: %s", err.Error())
	}
	return postgres, nil
}
