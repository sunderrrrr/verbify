package service

import (
	"WhyAi/internal/config"
	"WhyAi/internal/domain"
	"WhyAi/internal/repository"
	"WhyAi/pkg/logger"
	"errors"
	"fmt"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type UserService struct {
	repo *repository.Repository
	cfg  *config.Config
}
type ResetClaims struct {
	jwt.RegisteredClaims
	Email string `json:"email"`
}

func NewUserService(cfg *config.Config, repo *repository.Repository) *UserService {
	return &UserService{repo: repo, cfg: cfg}
}

func (s *UserService) GeneratePasswordResetToken(email, signingKey string) (string, error) {
	if email == "" || email == " " {
		return "", errors.New("email is empty")
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, &ResetClaims{
		jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
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

		return []byte(s.cfg.Security.SigningKey), nil
	})
	if err != nil {
		logger.Log.Errorf("Error while parsing token: %v", err)
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
	newPassHash, err := generatePasswordHash(resetModel.NewPass)
	return s.repo.ResetPassword(email, newPassHash)
}

func (s *UserService) GetRoleById(userId int) (int, error) {
	return s.repo.GetRoleById(userId)
}

func (s *UserService) ResetPasswordRequest(email domain.ResetRequest) error {
	token, err := s.GeneratePasswordResetToken(email.Login, s.cfg.Security.SigningKey)
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

func (s *UserService) GetUserById(userId int) (domain.UserPublicInfo, error) {
	user, err := s.repo.GetUserById(userId)
	if err != nil {
		return domain.UserPublicInfo{}, err
	}
	plan, err := s.repo.GetPlanById(user.Subsription - 1)
	if err != nil {
		return domain.UserPublicInfo{}, err
	}
	return domain.UserPublicInfo{
		Name:         user.Name,
		Email:        user.Email,
		Subscription: plan.Name,
	}, nil

}
