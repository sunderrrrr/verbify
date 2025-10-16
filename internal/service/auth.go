package service

import (
	"WhyAi/internal/config"
	"WhyAi/internal/domain"
	"WhyAi/internal/repository"
	"crypto/sha1"
	"errors"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type AuthService struct {
	repo      repository.Auth
	cfg       *config.Config
	antifraud *AntifraudService
}

func NewAuthService(cfg *config.Config, repo repository.Auth, antifraud *AntifraudService) *AuthService {
	return &AuthService{repo: repo, cfg: cfg, antifraud: antifraud}
}

type tokenClaims struct {
	jwt.RegisteredClaims
	UserId int `json:"user_id"`
}

const (
	tokenTTL = time.Hour * 2
)

func (s *AuthService) GenerateToken(login domain.AuthUser) (string, error) {
	//get user from db
	user, err := s.repo.GetUser(login.Email, generatePasswordHash(login.Password, s.cfg.Security.Salt), true)
	if err != nil {
		return "", err
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, &tokenClaims{
		jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(tokenTTL)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
		user.Id,
	})
	return token.SignedString([]byte(s.cfg.Security.SigningKey))
}

func (s *AuthService) ParseToken(accessToken string) (domain.User, error) {
	token, err := jwt.ParseWithClaims(accessToken, &tokenClaims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("invalid signing method")
		}

		return []byte(s.cfg.Security.SigningKey), nil
	})
	if err != nil {
		return domain.User{}, err
	}

	claims, ok := token.Claims.(*tokenClaims)
	if !ok {
		return domain.User{}, errors.New("token claims are not of type *tokenClaims")
	}

	returnUser := domain.User{
		Id: claims.UserId,
	}

	return returnUser, nil
}

func (s *AuthService) CreateUser(user domain.User) (int, error) {
	user.Password = generatePasswordHash(user.Password, s.cfg.Security.Salt)
	excist, err := s.antifraud.CheckFraud(user.IP, user.Fingerprint)
	if err != nil {
		return 0, err
	}
	if excist {
		return 0, errors.New("antifraud denied reg")
	}
	return s.repo.SignUp(user)
}

func generatePasswordHash(password, salt string) string {
	hash := sha1.New()
	hash.Write([]byte(password))

	return fmt.Sprintf("%x", hash.Sum([]byte(salt)))
}
