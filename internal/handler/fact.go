package handler

import (
	"WhyAi/internal/domain"
	"WhyAi/pkg/responser"
	"net/http"

	"github.com/gin-gonic/gin"
)

func (h *Handler) GetFact(c *gin.Context) {
	req, err := h.service.Facts.GetFacts()
	if err != nil {
		responser.NewErrorResponse(c, http.StatusInternalServerError, domain.FactsGetError, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"facts": req})
}
