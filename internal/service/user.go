package service

import (
	"WhyAi/internal/domain"
	"WhyAi/internal/repository"
	"WhyAi/pkg/logger"
	"errors"
	"fmt"
	"os"
	"time"

	"github.com/golang-jwt/jwt"
)

type UserService struct {
	repo repository.User
}
type ResetClaims struct {
	jwt.StandardClaims
	Email string `json:"email"`
}

func NewUserService(repo repository.User) *UserService {
	return &UserService{repo: repo}
}
func (s *UserService) GeneratePasswordResetToken(email, signingKey string) (string, error) {
	if email == "" || email == " " {
		logger.Log.Error("Email is empty")
		return "", errors.New("email is empty")
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, &ResetClaims{
		jwt.StandardClaims{
			ExpiresAt: time.Now().Add(tokenTTL / 72).Unix(),
			IssuedAt:  time.Now().Unix(),
		},
		email,
	})

	return token.SignedString([]byte(signingKey))
}

func (s *UserService) ResetPassword(resetModel domain.UserReset) error {
	token, err := jwt.ParseWithClaims(resetModel.Token, &ResetClaims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("invalid signing method")
		}

		return []byte(signingKey), nil
	})
	if err != nil {
		logger.Log.Error("Error while parsing token: %v", err)
		return err
	}
	claims, ok := token.Claims.(*ResetClaims)
	if !ok || !token.Valid {
		logger.Log.Error("Invalid token")
		return errors.New("token claims are not of type jwt.MapClaims or token invalid")

	}
	email := claims.Email
	if email == "" {
		logger.Log.Error("Empty email in token claims")
		return errors.New("empty email")
	}
	return s.repo.ResetPassword(email, generatePasswordHash(resetModel.NewPass))
}

func (s *UserService) GetRoleById(userId int) (int, error) {
	return s.repo.GetRoleById(userId)
}

func (s *UserService) ResetPasswordRequest(email domain.ResetRequest) error {
	token, err := s.GeneratePasswordResetToken(email.Login, signingKey)
	if err != nil {
		logger.Log.Errorf("Error while generating token: %v", err)
		return err
	}
	resetLink := fmt.Sprintf("%s/reset/?t=%s", os.Getenv("FRONTEND_URL"), token)
	fmt.Println(resetLink)
	/*
		from := os.Getenv("DB_HOST")
		password := os.Getenv("DB_HOST")
		fmt.Println(resetLink)
		// Информация о получателе
		to := []string{
			email.Login,
		}

		// smtp сервер конфигурация
		smtpHost := os.Getenv("DB_HOST")
		smtpPort := os.Getenv("DB_HOST")

		// Сообщение.
		message := []byte("<h1>Сброс пароля</h1>\n" +
			"<p>Перейдите по ссылке, чтобы сбросить пароль</p>\n" +
			"<a href=\"" + resetLink + "\">Сброс</a>\n" +
			"<p>Если вы не запрашивали сброс, не переходите. Время действия ссылки один час</p>")
		log.Default().Println("mail gen end")
		// Авторизация.
		auth := smtp.PlainAuth("", from, password, smtpHost)

		// Отправка почты.
		err = smtp.SendMail(smtpHost+":"+smtpPort, auth, from, to, message)
		if err != nil {
			return err

		}
		fmt.Println("Почта отправлена!") */
	return nil

}
