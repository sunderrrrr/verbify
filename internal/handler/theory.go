package handler

import (
	"WhyAi/internal/domain"
	"WhyAi/pkg/logger"
	"WhyAi/pkg/responser"
	"net/http"

	"github.com/gin-gonic/gin"
)

func (h *Handler) SendTheory(c *gin.Context) {
	n := c.Param("id")
	if n == "" {
		responser.NewErrorResponse(c, http.StatusBadRequest, domain.GetTheoryError)
		return
	}

	theory, err := h.service.Theory.SendTheory(n)
	if err != nil {
		responser.NewErrorResponse(c, http.StatusInternalServerError, domain.GetTheoryError)
		logger.Log.Errorf("failed to send theory: %v", err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"theory": theory})
}
