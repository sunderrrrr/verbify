package handler

import (
	"WhyAi/internal/domain"
	"WhyAi/pkg/responser"
	"net/http"

	"github.com/gin-gonic/gin"
)

func (h *Handler) AnalyzeStats(c *gin.Context) {
	id, err := h.middleware.GetUserId(c)
	if err != nil {
		responser.NewErrorResponse(c, http.StatusUnauthorized, domain.UnAuthorizedError, nil)
		return
	}
	res, err := h.service.Analytics.AnalyzeStats(id)
	if err != nil {
		if err.Error() == "metrics data is nil" || err.Error() == "not enough data to analyze" {
			responser.NewErrorResponse(c, http.StatusInternalServerError, err.Error(), nil)
			return
		} else {
			responser.NewErrorResponse(c, http.StatusInternalServerError, "failed to analyze stats", err)
			return
		}
	}
	c.JSON(http.StatusOK, gin.H{
		"result": res,
	})
}
