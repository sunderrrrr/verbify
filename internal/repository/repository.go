package repository

import (
	models2 "WhyAi/internal/domain"
	"github.com/jmoiron/sqlx"
)

type Repository struct {
	Chat
	Auth
	User
}

type Chat interface {
	ChatExist(taskId, userId int) (bool, error)
	CreateChat(userId, taskId int) (int, error)
	AddMessage(taskId, userId int, message models2.Message) error
	ClearContext(taskId, userId int) error
	GetChat(taskId, userId int) ([]models2.Message, error)
}

type Auth interface {
	SignUp(user models2.User) (int, error)
	GetUser(username, password string, login bool) (models2.User, error)
}

type User interface {
	GetRoleById(userId int) (int, error)
	ResetPassword(username string, newPassword string) error
}

func NewRepository(db *sqlx.DB) *Repository {
	return &Repository{
		Auth: NewAuthPostgres(db),
		Chat: NewChatPostgres(db),
		User: NewUserRepository(db),
	}

}
