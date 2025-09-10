package handler

import (
	"WhyAi/internal/domain"
	"WhyAi/pkg/logger"
	"WhyAi/pkg/responser"
	"github.com/gin-gonic/gin"
	"net/http"
)

func (h *Handler) GetFact(c *gin.Context) {
	req, err := h.service.Facts.GetFacts()
	if err != nil {
		responser.NewErrorResponse(c, http.StatusInternalServerError, domain.FactsGetError)
		logger.Log.Errorf("Error while processing fact request: %v", err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"facts": req})
}
