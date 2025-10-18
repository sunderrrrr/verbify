package service

import (
	"WhyAi/internal/config"
	"WhyAi/internal/domain"
	"WhyAi/internal/repository"
)

// сборный файл всех интерфейсов сервисов аналогично репозиторию
type Service struct {
	Theory
	Auth
	LLM
	Chat
	Facts
	Essay
	User
	Subscription
	Antifraud
}

type Theory interface {
	SendTheory(n string) (string, error)
}
type Auth interface {
	CreateUser(user domain.User) (int, error)
	GenerateToken(user domain.AuthUser) (string, error)
	ParseToken(token string) (domain.User, error)
}

type LLM interface {
	AskLLM(messages []domain.Message, isEssay bool) (*domain.Message, error)
}

type Chat interface {
	Chat(taskId, userId int) ([]domain.Message, error)
	AddMessage(taskId int, userId int, message domain.Message) error
	ClearContext(taskId, userId int) error
}

type Facts interface {
	GetFacts() ([]domain.Fact, error)
}
type Essay interface {
	GetEssayThemes() ([]domain.EssayTheme, error)
	GenerateUserPrompt(request domain.EssayRequest) (string, error)
	ProcessEssayRequest(request domain.EssayRequest) (*domain.EssayResponse, error)
}
type User interface {
	ResetPassword(resetModel domain.UserReset) error
	ResetPasswordRequest(email domain.ResetRequest) error
	GeneratePasswordResetToken(email, signingKey string) (string, error)
	GetRoleById(userId int) (int, error)
	GetUserById(userId int) (domain.UserPublicInfo, error)
}
type Subscription interface {
	GetPlans(userId int) (*domain.Limits, error)
	GetPlanById(id int) (*domain.Plan, error)
	GetAllPlans() ([]domain.Plan, error)
	SetSubscription(userId int, subscriptionId int) error
	CreateSubscriptionURL(userId int, subscriptionId int) (string, error)
	ActivateSubscription(paymentId string) error
}

type Antifraud interface {
	CheckFraud(ip, fingerprint string) (bool, error)
}

func NewService(cfg *config.Config, repo *repository.Repository) *Service {
	LLMs := NewLLMService(cfg)
	AF := NewAntifraudService(repo)
	TH := NewTheoryService(*repo)
	return &Service{
		Auth:         NewAuthService(cfg, repo, AF),
		Theory:       TH,
		LLM:          LLMs,
		Chat:         NewChatService(*repo, LLMs, TH),
		Facts:        NewFactService(),
		Essay:        NewEssayService(),
		User:         NewUserService(cfg, repo),
		Subscription: NewSubscriptionService(cfg, repo),
		Antifraud:    AF,
	}
}
