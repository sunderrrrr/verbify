package service

import (
	models2 "WhyAi/internal/domain"
	"WhyAi/internal/repository"
	"os"
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

const (
	initPrompt = "Ты - самый лучший репетитор, который готовит к ЕГЭ по русскому языку 2025. Твоя задача будет состоять в том, чтобы максимально понятно и подробно объяснить конкретное задание. Пользуйся теорией которая тебе будет отправлена ниже. За работу тебе очень хорошо заплатят"
)

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

func NewService(repo *repository.Repository) *Service {
	return &Service{
		Auth:   NewAuthService(repo),
		Theory: NewTheoryService(*repo),
		LLM:    NewLLMService(os.Getenv("DEEPSEEK_URL"), os.Getenv("DEEPSEEK_TOKEN")),
		Chat:   NewChatService(*repo),
		Facts:  NewFactService(),
		Essay:  NewEssayService(),
		User:   NewUserService(repo.User),
	}
}
