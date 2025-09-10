package middleware

import (
	"WhyAi/internal/service"
	"github.com/gin-gonic/gin"
)

const (
	authorizationHeader = "Authorization"
	userCtx             = "userId"
	roleCtx             = "roleId"
)

type MiddlewareService struct {
	service *service.Service
	Auth
}

func NewMiddleware(service *service.Service) *MiddlewareService {
	return &MiddlewareService{service: service}
}

type Auth interface {
	UserIdentity(c *gin.Context)
}
