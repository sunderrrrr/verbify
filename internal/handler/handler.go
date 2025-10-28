package handler

import (
	"WhyAi/internal/config"
	"WhyAi/internal/middleware"
	"WhyAi/internal/service"
	"WhyAi/pkg/redis"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

type Handler struct {
	service    *service.Service
	middleware *middleware.MiddlewareService
	cfg        *config.Config
}

func NewHandler(service *service.Service, redis *redis.Client, cfg *config.Config) *Handler {
	return &Handler{service: service, middleware: middleware.NewMiddleware(service, redis), cfg: cfg}
}

// Настройка роутинга
func (h *Handler) InitRoutes(cfg *config.Config) *gin.Engine {
	gin.SetMode(gin.DebugMode)
	router := gin.New()
	router.RedirectTrailingSlash = false
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{cfg.Security.FrontendUrl},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length", "Authorization"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))
	api := router.Group("/api", h.middleware.RateLimitter)
	{
		v1 := api.Group("/v1")
		{
			auth := v1.Group("auth")

			{

				auth.POST("/sign-up", h.signUp)
				auth.POST("/sign-in", h.signIn)
				auth.POST("/forgot", h.SendResetRequest)
				auth.POST("/reset", h.UpdatePassword)
			}

			user := v1.Group("/user", h.middleware.UserIdentity) // Инфа пользователя, подписки
			{
				user.GET("/info", h.GetUserInfo)
				user.PUT("/update", h.UpdateUserInfo)
				subscription := user.Group("subscription")
				{
					subscription.GET("/plans", h.GetPlans)
					subscription.POST("/plan", h.SubscriptionCreate)
					subscription.POST("/webhook", h.Webhook)
				}
			}

			theory := v1.Group("/theory", h.middleware.UserIdentity)
			{
				theory.GET("/:id", h.SendTheory)                                           //Получение теории
				theory.POST("/:id/chat", h.middleware.FeatureLimit("chat"), h.SendMessage) //Сообщение по заданию
				theory.GET("/:id/chat", h.GetOrCreateChat)                                 // Получить чат
				theory.DELETE("/:id/chat", h.ClearContext)                                 //Стереть контекст
			}

			essay := v1.Group("/essay", h.middleware.UserIdentity)
			{
				essay.GET("/themes", h.GetEssayTasks)
				essay.POST("/", h.middleware.FeatureLimit("essay"), h.SendEssay)
				essay.POST("/scan", h.ScanPhoto)
			}

			fact := v1.Group("/fact")
			fact.Use(cors.New(cors.Config{
				AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
				AllowHeaders:     []string{"Origin", "Content-Type", "Authorization", "Baggage", "Sentry-Trace"},
				ExposeHeaders:    []string{"Content-Length", "Authorization"},
				AllowCredentials: true,
				AllowOrigins:     []string{cfg.Security.FrontendUrl},
				MaxAge:           12 * time.Hour,
			}))
			{
				fact.GET("", h.GetFact) //Получить случайный лайфхак, ну или массив лайфхаков, чтобы уменьшить нагрузку
			}
			admin := v1.Group("/admin", h.middleware.UserIdentity, h.adminIdentity) //Админка
			{
				admin.GET("/")
			}
		}

	}

	return router
}
