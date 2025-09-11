package domain

type Limits struct {
	ChatLimit  int `db:"chat_limit"`
	EssayLimit int `db:"essay_limit"`
}
