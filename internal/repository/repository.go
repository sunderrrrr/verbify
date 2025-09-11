package repository

import (
	"WhyAi/internal/domain"

	"github.com/jmoiron/sqlx"
)

type Repository struct {
	Chat
	Auth
	User
	Subscription
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
	GetUser(username, password string, login bool) (domain.User, error)
}

type User interface {
	GetRoleById(userId int) (int, error)
	ResetPassword(username string, newPassword string) error
}
type Subscription interface {
	GetFeatureLimits(userId int) (*domain.Limits, error)
}

func NewRepository(db *sqlx.DB) *Repository {
	return &Repository{
		Auth:         NewAuthPostgres(db),
		Chat:         NewChatPostgres(db),
		User:         NewUserRepository(db),
		Subscription: NewSubscriptionRepository(db),
	}

}
