package service

import (
	"WhyAi/internal/domain"
	"WhyAi/internal/repository"
	"WhyAi/pkg/logger"
	"crypto/sha1"
	"errors"
	"fmt"
	"github.com/golang-jwt/jwt/v5"
	"time"
)

type AuthService struct {
	repo repository.Auth
}

func NewAuthService(repo repository.Auth) *AuthService {
	return &AuthService{repo: repo}
}

type tokenClaims struct {
	jwt.RegisteredClaims
	UserId int `json:"user_id"`
}

const (
	salt       = "gdfgdf789fsd798ghdfh9d8f79d8fs"                            //абфускатор пароля "соль"
	signingKey = "js786b87^*bn98v79&(*jhkjhKj6kiu6iU^^u6iU^uk6tiuufv6biu^u6" //ключ подписи
	tokenTTL   = time.Hour * 12                                              //время действия токена
)

func (s *AuthService) GenerateToken(login domain.AuthUser) (string, error) {
	//get user from db

	user, err := s.repo.GetUser(login.Email, generatePasswordHash(login.Password), true)

	if err != nil {
		logger.Log.Errorf("AuthService.GenerateToken error: %v", err.Error())
		return "fail", err
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, &tokenClaims{
		jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(tokenTTL)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
		user.Id,
	})
	return token.SignedString([]byte(signingKey))
}

func (s *AuthService) ParseToken(accessToken string) (domain.User, error) {
	token, err := jwt.ParseWithClaims(accessToken, &tokenClaims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("invalid signing method")
		}

		return []byte(signingKey), nil
	})
	if err != nil {
		logger.Log.Errorf("AuthService.ParseToken error: %v", err.Error())

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
	user.Password = generatePasswordHash(user.Password)
	return s.repo.SignUp(user)
}

// TODO Дописать получение
func generatePasswordHash(password string) string {
	hash := sha1.New()
	hash.Write([]byte(password))

	return fmt.Sprintf("%x", hash.Sum([]byte(salt)))
}
