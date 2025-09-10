package domain

type User struct {
	Id          int    `json:"id" db:"id"`
	Name        string `json:"name" db:"name" binding:"required"`
	Email       string `json:"email"  binding:"required" db:"email"`
	Password    string `json:"password"  binding:"required"`
	Subsription int    `json:"subscription" db:"sub_level"` // 0 - Ультра; 1 - Премиум; 2 - Базовый
	UserType    int    `json:"user_type" db:"user_type"`    // 0 - Пользователь; 1 - Админ
}
type AuthUser struct {
	Email    string `json:"email"  binding:"required"`
	Password string `json:"password"  binding:"required"`
}

type UserReset struct {
	Token   string `json:"token" binding:"required"`
	NewPass string `json:"new_password" binding:"required"`
}

type ResetRequest struct {
	Login string `json:"login" binding:"required"`
}
