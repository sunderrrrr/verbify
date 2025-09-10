package repository

import (
	"WhyAi/internal/domain"
	"WhyAi/pkg/logger"
	"database/sql"
	"fmt"
	"github.com/jmoiron/sqlx"
)

type AuthPostgres struct {
	db *sqlx.DB
}

func NewAuthPostgres(db *sqlx.DB) *AuthPostgres {
	return &AuthPostgres{db}
}

func (a *AuthPostgres) SignUp(user domain.User) (int, error) {
	var id int
	query := fmt.Sprintf(`INSERT INTO %s (name, email, pass_hash, user_type, sub_level) VALUES ($1, $2,$3, 1, 2) RETURNING id`, userDb)
	result := a.db.QueryRow(query, user.Name, user.Email, user.Password)
	err := result.Scan(&id)
	if err != nil {
		logger.Log.Error("Error while signing up user: %v", err)
		return 0, err
	}
	return id, nil

}

// TODO дописать запрос
func (a *AuthPostgres) GetUser(username, password string, login bool) (domain.User, error) {
	var user domain.User
	var result *sql.Row
	if login {
		query := fmt.Sprintf(`SELECT * FROM %s WHERE email = $1 AND pass_hash = $2`, userDb)
		result = a.db.QueryRow(query, username, password)
	} else { // Если нужна проверка только по почте
		query := fmt.Sprintf(`SELECT id, name, email FROM %s WHERE email = $1`, userDb)
		result = a.db.QueryRow(query, username)
	}
	err := result.Scan(&user.Id, &user.Name, &user.Email, &user.Password, &user.UserType, &user.Subsription)
	if err != nil {
		logger.Log.Error("Error while getting user: %v", err)
		return domain.User{}, err
	}
	return user, nil
}
