package repository

import (
	"WhyAi/internal/domain"

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
	var limits domain.Limits
	query = "SELECT essay_limit, chat_limit from plans WHERE id=$1"
	if err := r.db.Get(&limits, query, planId); err != nil {
		return nil, err
	}
	return &limits, nil
}

func (r *SubscriptionRepository) GetPlanById(id int) (*domain.Plan, error) {
	var plan domain.Plan
	query := `SELECT * FROM plans WHERE id = $1`
	if err := r.db.Get(&plan, query, id+1); err != nil {
		return nil, err
	}
	return &plan, nil
}

func (r *SubscriptionRepository) SetSubscription(userId int, subscriptionId int) error {
	query := `UPDATE users SET sub_level = $2 WHERE id = $1`
	if _, err := r.db.Exec(query, userId, subscriptionId); err != nil {
		return err
	}
	return nil
}

func (r *SubscriptionRepository) GetAllPlans() ([]domain.Plan, error) {
	query := `SELECT id, name, essay_limit, chat_limit, price FROM plans`
	var plans []domain.Plan
	if err := r.db.Select(&plans, query); err != nil {
		return nil, err
	}
	return plans, nil
}

func (r *SubscriptionRepository) CreateTransaction(payment *domain.Payment) error {
	query := `INSERT INTO subscriptions (user_id, plan_id, payment_id, status) VALUES ($1, $2, $3, $4)`
	if _, err := r.db.Exec(query, payment.UserId, payment.PlanId, payment.PaymentId, payment.Status); err != nil {
		return err
	}
	return nil
}

func (r *SubscriptionRepository) ActivateSubscription(paymentId string) error {
	var userId int
	var planId int
	query := `UPDATE subscriptions SET status = "active" start_at = now() end_at = now() + interval '30 days' updated_at = now() WHERE payment_id = $2 RETURNING user_id, plan_id`
	if err := r.db.QueryRow(query, paymentId).Scan(userId, planId); err != nil {
		return err
	}
	query = `UPDATE subscriptions SET plan_id = $2 WHERE id = $1`
	if _, err := r.db.Exec(query, paymentId); err != nil {
		return err
	}
	return nil
}
