package middleware

import (
	"WhyAi/pkg/responser"
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

type visitor struct {
	count    int
	lastSeen time.Time
}

type limitter struct {
	visitors map[string]*visitor
	mu       sync.RWMutex
}

var lim = limitter{
	visitors: make(map[string]*visitor),
}

const (
	windowSize   = 30 * time.Second
	maxRequests  = 20
	cleanupEvery = time.Minute // Очистка старых записей каждую минуту
)

func init() {
	// Запускаем горутину для очистки старых записей
	go func() {
		for {
			time.Sleep(cleanupEvery)
			lim.mu.Lock()
			for ip, v := range lim.visitors {
				if time.Since(v.lastSeen) > windowSize {
					delete(lim.visitors, ip)
				}
			}
			lim.mu.Unlock()
		}
	}()
}

// Рейт лимиттер (жестко навайбкожен, тк я плохо понимаю пока в конкурентности и горутинах)
func (m *MiddlewareService) RateLimitter(c *gin.Context) {
	ip := c.ClientIP()
	now := time.Now()

	lim.mu.Lock()
	defer lim.mu.Unlock()
	/* for name, values := range c.Request.Header {
		for _, value := range values {
			logger.Log.Infof("  %s: %s\n", name, value)
		}
	} */
	v, exists := lim.visitors[ip]
	if !exists {
		v = &visitor{count: 0, lastSeen: now}
		lim.visitors[ip] = v
	}

	if now.Sub(v.lastSeen) > windowSize {
		v.count = 0
		v.lastSeen = now
	}

	if v.count >= maxRequests {
		responser.NewErrorResponse(c, http.StatusTooManyRequests, "too many requests")
		c.Abort()
		return
	}

	v.count++
	v.lastSeen = now

	c.Next()
}
