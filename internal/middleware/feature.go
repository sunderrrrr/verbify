package middleware

import (
	"WhyAi/pkg/logger"
	"WhyAi/pkg/responser"
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

func (m *MiddlewareService) FeatureLimit(feature string) gin.HandlerFunc {
	return func(c *gin.Context) {
		id, err := m.GetUserId(c)

		if err != nil {
			return
		}
		limits, err := m.service.Subscription.GetPlans(id)
		if err != nil {
			responser.NewErrorResponse(c, http.StatusInternalServerError, "failed to get subscriptions")
			logger.Log.Errorf("failed to get subscriptions: %v", err)
			return
		}
		var limit int
		switch feature {
		case "chat":
			limit = limits.ChatLimit
		case "essay":
			limit = limits.EssayLimit
		default:
			responser.NewErrorResponse(c, http.StatusBadRequest, "invalid feature")
		}

		today := time.Now().Format("02-01-2006")
		featureKey := fmt.Sprintf("%s:%s:%s", id, feature, today)
		count, err := m.redis.Incr(c, featureKey)
		if err != nil {
			responser.NewErrorResponse(c, http.StatusInternalServerError, "failed to incr feature")
			return
		}
		if count == 1 {
			midnight := time.Now().Truncate(24 * time.Hour).Add(24 * time.Hour)
			_, _ = m.redis.Expire(c, featureKey, time.Until(midnight))
		}
		if int(count) > limit {
			responser.NewErrorResponse(c, http.StatusTooManyRequests, "you reached the limit")
			logger.Log.Infof("feature %s limit %d/%d", feature, count, limit)
			c.Abort()
			return
		}
		logger.Log.Infof("feature %s limit %d/%d", feature, count, limit)
		c.Next()
	}
}
