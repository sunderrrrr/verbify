package repository

import (
	"WhyAi/internal/domain"

	"github.com/jmoiron/sqlx"
)

//сборный файл всех интерфейсов репозиториев в пакете

type Repository struct {
	Chat
	Auth
	User
	Subscription
	Antifraud
	Analytics
}

type Chat interface {
	ChatExist(taskId, userId int) (bool, error)
	CreateChat(userId, taskId int) (int, error)
	AddMessage(taskId, userId int, message domain.Message) error
	ClearContext(taskId, userId int) error
	GetChat(taskId, userId int) ([]domain.Message, error)
}

type Auth interface {
	SignUp(user domain.User) (int, error)
	GetUser(username string) (domain.User, error)
}

type User interface {
	GetRoleById(userId int) (int, error)
	GetUserById(userId int) (*domain.User, error)
	ResetPassword(username string, newPassword string) error
}
type Subscription interface {
	GetFeatureLimits(userId int) (*domain.Limits, error)
	GetPlanById(id int) (*domain.Plan, error)
	GetAllPlans() ([]domain.Plan, error)
	SetSubscription(userId int, subscriptionId int) error
	CreateTransaction(payment *domain.Payment) error
	ActivateSubscription(paymentId string) error
}

type Antifraud interface {
	CheckFraud(ip, fingerprint string) (bool, error)
}

type Analytics interface {
	UpdateMetrics(userId, lastRate int, problem string) error
	GetMetricsInfo(userId int) (*domain.StatsRaw, error)
}

func NewRepository(db *sqlx.DB) *Repository {
	return &Repository{
		Auth:         NewAuthPostgres(db),
		Chat:         NewChatPostgres(db),
		User:         NewUserRepository(db),
		Subscription: NewSubscriptionRepository(db),
		Antifraud:    NewAntifraudRepository(db),
		Analytics:    NewAnalyticsRepository(db),
	}

}
