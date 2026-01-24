package responser

import (
	"WhyAi/pkg/logger"

	"github.com/gin-gonic/gin"
)

// единый вывод ошибок для api
type errorResponse struct {
	Msg string `json:"result"`
}

func NewErrorResponse(c *gin.Context, statusCode int, msg string, err error) {
	c.AbortWithStatusJSON(statusCode, errorResponse{Msg: msg})
	if err != nil {
		logger.Log.Error(msg + ": " + err.Error())
	}
}
