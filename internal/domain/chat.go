package domain

import "time"

// Chat представляет чат пользователя по конкретному заданию
type Chat struct {
	UserID    int       `db:"user_id" json:"user_id"`
	TaskID    int       `db:"task_id" json:"task_id"`
	CreatedAt time.Time `db:"created_at" json:"created_at"`
}

// Message представляет сообщение в чате
type Message struct {
	ID        int       `db:"id" json:"id"`                 // Уникальный ID сообщения
	UserID    int       `db:"user_id" json:"user_id"`       // ID пользователя
	TaskID    int       `db:"task_id" json:"task_id"`       // ID задания
	Role      string    `db:"role" json:"role"`             // "user" или "assistant"
	Content   string    `db:"content" json:"content"`       // Текст сообщения
	CreatedAt time.Time `db:"created_at" json:"created_at"` // Время создания
}

// ChatRequest - запрос на создание/получение чата
type ChatRequest struct {
	UserID int `json:"user_id" binding:"required"`
	TaskID int `json:"task_id" binding:"required"`
}

// MessageRequest - запрос на отправку сообщения
type MessageRequest struct {
	UserID  int    `json:"user_id" binding:"required"`
	TaskID  int    `json:"task_id" binding:"required"`
	Role    string `json:"role" binding:"required,oneof=user assistant"`
	Content string `json:"content" binding:"required"`
}

// ChatHistoryResponse - ответ с историей сообщений
type ChatHistoryResponse struct {
	UserID   int       `json:"user_id"`
	TaskID   int       `json:"task_id"`
	Messages []Message `json:"messages"`
}

type LLMRequest struct {
	Model       string    `json:"model"`
	Messages    []Message `db:"messages" json:"messages"`
	MaxToken    int       `db:"max_token" json:"max_token,omitempty"`
	Stream      bool      `db:"stream" json:"stream,omitempty"`
	Temperature int       `db:"temperature" json:"temperature,omitempty"`
}

type LLMResponse struct {
	ID      string `db:"id" json:"id"`
	Choices []struct {
		Message Message `json:"message"`
	} `json:"choices"`
}
