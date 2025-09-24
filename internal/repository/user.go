package repository

import (
	"WhyAi/internal/domain"
	"fmt"

	"github.com/jmoiron/sqlx"
)

type UserRepository struct {
	db *sqlx.DB
}

func NewUserRepository(db *sqlx.DB) *UserRepository {
	return &UserRepository{db: db}
}

func (ur *UserRepository) ResetPassword(username string, newPassword string) error {
	tx, err := ur.db.Begin()
	if err != nil {
		return err
	}
	query := fmt.Sprintf(
		"UPDATE %s SET pass_hash=$1 WHERE email=$2",
		userDb, // Теперь безопасно, т.к. проверено
	)
	_, err = tx.Exec(query, newPassword, username)
	if err != nil {
		if err = tx.Rollback(); err != nil {
			return err
		}
		return err
	}
	return tx.Commit()
}
func (ur *UserRepository) GetRoleById(userId int) (int, error) {
	var role int
	query := fmt.Sprintf("SELECT user_type FROM %s WHERE id=$1", userDb)
	err := ur.db.Get(&role, query, userId)
	if err != nil {
		return 0, err
	}
	return role, nil
}

func (ur *UserRepository) GetUserById(userId int) (*domain.User, error) {
	var user domain.User
	query := `SELECT name, email, sub_level from users WHERE id=$1`
	if err := ur.db.Get(&user, query, userId); err != nil {
		return nil, err
	}
	return &user, nil

}
