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
	query := fmt.Sprintf(`INSERT INTO %s (name, email, pass_hash, ip, fingerprint, user_type, sub_level) VALUES ($1, $2, $3, $4, $5, 1, 1) RETURNING id`, userDb)
	result := a.db.QueryRow(query, user.Name, user.Email, user.Password, user.IP, user.Fingerprint)
	err := result.Scan(&id)
	if err != nil {
		logger.Log.Errorf("Error while signing up user: %v", err)
		return 0, err
	}
	return id, nil

}

// TODO дописать запрос
func (a *AuthPostgres) GetUser(username string) (domain.User, error) {
	var user domain.User
	var result *sql.Row

	query := fmt.Sprintf(`SELECT id, name, email, pass_hash FROM %s WHERE email = $1`, userDb)
	result = a.db.QueryRow(query, username)

	err := result.Scan(&user.Id, &user.Name, &user.Email, &user.Password)
	if err != nil {
		return domain.User{}, err
	}
	return user, nil
}
