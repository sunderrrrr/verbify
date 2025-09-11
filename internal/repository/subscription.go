package repository

import (
	"WhyAi/internal/domain"
	"WhyAi/pkg/logger"

	"github.com/jmoiron/sqlx"
)

type SubscriptionRepository struct {
	db *sqlx.DB
}

func NewSubscriptionRepository(db *sqlx.DB) *SubscriptionRepository {
	return &SubscriptionRepository{db: db}
}

func (r *SubscriptionRepository) GetFeatureLimits(userId int) (*domain.Limits, error) {
	var planId int
	query := `SELECT sub_level from users WHERE id = $1`
	if err := r.db.QueryRow(query, userId).Scan(&planId); err != nil {
		return nil, err
	}
	logger.Log.Infof("plan id: %d", planId)
	var limits domain.Limits
	query = "SELECT essay_limit, chat_limit from plans WHERE id=$1"
	if err := r.db.Get(&limits, query, planId); err != nil {
		return nil, err
	}
	logger.Log.Infof("limits: %+v", limits)
	return &limits, nil
}
