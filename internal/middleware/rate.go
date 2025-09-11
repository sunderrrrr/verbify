package middleware

import (
	"WhyAi/pkg/responser"
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

type limitter struct {
	count map[string]int
	mu    sync.RWMutex
}

var lim = limitter{
	count: make(map[string]int),
}

const (
	resetLimit  = time.Second * 10
	maxRequests = 5
)

func (m *MiddlewareService) RateLimitter(c *gin.Context) {
	ip := c.ClientIP()
	lim.mu.RLock()
	defer lim.mu.RUnlock()
	lim.count[ip]++
	if lim.count[ip] == 1 {
		time.AfterFunc(resetLimit, func() {
			lim.mu.Lock()
			delete(lim.count, ip)
			lim.mu.Unlock()
		})
	}
	if lim.count[ip] > maxRequests {
		responser.NewErrorResponse(c, http.StatusTooManyRequests, "too many requests")
		c.Abort()
	}
	c.Next()
}
