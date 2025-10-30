package responser

import (
	"github.com/gin-gonic/gin"
)

// единый вывод ошибок для api
type errorResponse struct {
	Msg string `json:"result"`
}

func NewErrorResponse(c *gin.Context, statusCode int, msg string) {
	c.AbortWithStatusJSON(statusCode, errorResponse{Msg: msg})
	//slogger.Log.Error("Error while binding input: %v", msg)
}
