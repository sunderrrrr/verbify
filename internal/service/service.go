package service

import (
	"WhyAi/internal/config"
	models2 "WhyAi/internal/domain"
	"WhyAi/internal/repository"
)

type Service struct {
	Theory
	Auth
	LLM
	Chat
	Facts
	Essay
	User
}

type Theory interface {
	SendTheory(n string, forBot bool) (string, error)
}
type Auth interface {
	CreateUser(user models2.User) (int, error)
	GenerateToken(user models2.AuthUser) (string, error)
	ParseToken(token string) (models2.User, error)
}

type LLM interface {
	AskLLM(messages []models2.Message, isEssay bool) (*models2.Message, error)
}

type Chat interface {
	Chat(taskId, userId int) ([]models2.Message, error)
	AddMessage(taskId int, userId int, message models2.Message) error
	ClearContext(taskId, userId int) error
}

type Facts interface {
	GetFacts() ([]models2.Fact, error)
}
type Essay interface {
	GetEssayThemes() ([]models2.EssayTheme, error)
	GenerateUserPrompt(request models2.EssayRequest) (string, error)
	ProcessEssayRequest(request models2.EssayRequest) (*models2.EssayResponse, error)
}
type User interface {
	ResetPassword(resetModel models2.UserReset) error
	ResetPasswordRequest(email models2.ResetRequest) error
	GeneratePasswordResetToken(email, signingKey string) (string, error)
	GetRoleById(userId int) (int, error)
}

func NewService(cfg *config.Config, repo *repository.Repository) *Service {
	LLMs := NewLLMService(cfg)
	return &Service{
		Auth:   NewAuthService(repo),
		Theory: NewTheoryService(*repo),
		LLM:    LLMs,
		Chat:   NewChatService(*repo, LLMs),
		Facts:  NewFactService(),
		Essay:  NewEssayService(),
		User:   NewUserService(repo.User),
	}
}
