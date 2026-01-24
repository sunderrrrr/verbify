package domain

import "time"

type Limits struct {
	ChatLimit  int `db:"chat_limit"`
	EssayLimit int `db:"essay_limit"`
}

type Plan struct {
	Id         int       `db:"id" json:"id"`
	Name       string    `db:"name" json:"name"`
	ChatLimit  int       `db:"chat_limit" json:"chat_limit"`
	EssayLimit int       `db:"essay_limit" json:"essay_limit"`
	Price      int       `db:"price" json:"price"`
	Created_at time.Time `db:"created_at" json:"created_at"`
	Updated_at time.Time `db:"updated_at" json:"updated_at"`
}

type PaymentInfo struct {
	PaymentID   string `json:"payment_id"`
	PaymentName string `json:"payment_name"`
	Url         string `json:"url"`
}

type PaymentRequest struct {
	PlanId int `json:"plan_id"`
}

type Payment struct {
	Id        int       `json:"id" db:"id"`
	UserId    int       `json:"user_id" db:"user_id"`
	PlanId    int       `json:"plan_id" db:"plan_id"`
	PaymentId string    `json:"payment_id" db:"payment_id"`
	Status    string    `json:"status" db:"status"`
	StartAt   time.Time `json:"start_at" db:"start_at"`
	EndAt     time.Time `json:"end_at" db:"end_at"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
	UpdatedAt time.Time `json:"updated_at" db:"updated_at"`
}

type CustomWebhook struct {
	Id     string `json:"id"`
	Status string `json:"status"`
}
