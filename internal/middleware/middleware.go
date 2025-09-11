package middleware

import (
	"WhyAi/internal/service"
	"WhyAi/pkg/redis"

	"github.com/gin-gonic/gin"
)

const (
	authorizationHeader = "Authorization"
	userCtx             = "userId"
	roleCtx             = "roleId"
)

type MiddlewareService struct {
	service *service.Service
	redis   *redis.Client
	Auth
}

func NewMiddleware(service *service.Service, redis *redis.Client) *MiddlewareService {
	return &MiddlewareService{service: service, redis: redis}
}

type Auth interface {
	UserIdentity(c *gin.Context)
	FeatureLimit(feature string) gin.HandlerFunc
}
