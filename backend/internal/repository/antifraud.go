package repository

import "github.com/jmoiron/sqlx"

type AntifraudRepository struct {
	db *sqlx.DB
}

func NewAntifraudRepository(db *sqlx.DB) *AntifraudRepository {
	return &AntifraudRepository{
		db: db,
	}
}

func (r *AntifraudRepository) CheckFraud(ip, fingerprint string) (bool, error) {
	var exists bool
	query := `SELECT EXISTS(SELECT 1 FROM users WHERE ip = $1 AND fingerprint = $2);`
	if err := r.db.Get(&exists, query, ip, fingerprint); err != nil {
		return false, err
	}
	return exists, nil
}
