package handler

import (
	"WhyAi/internal/domain"
	"WhyAi/pkg/logger"
	"WhyAi/pkg/responser"
	"net/http"

	"github.com/gin-gonic/gin"
)

func (h *Handler) GetEssayTasks(c *gin.Context) {
	if _, err := h.middleware.GetUserId(c); err != nil {
		responser.NewErrorResponse(c, http.StatusUnauthorized, domain.InvalidIdError)
		logger.Log.Errorf("Error while getting user id: %v", err)
		return
	}
	themes, err := h.service.Essay.GetEssayThemes()
	if err != nil {
		responser.NewErrorResponse(c, http.StatusInternalServerError, domain.GetEssayThemesFailed)
		logger.Log.Errorf("Error while getting themes: %v", err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"result": themes})
}

func (h *Handler) SendEssay(c *gin.Context) {
	var input domain.EssayRequest
	if _, err := h.middleware.GetUserId(c); err != nil {
		responser.NewErrorResponse(c, http.StatusUnauthorized, domain.InvalidIdError)
		logger.Log.Errorf("Error while getting user id: %v", err)
		return
	}
	if err := c.BindJSON(&input); err != nil {
		responser.NewErrorResponse(c, http.StatusBadRequest, domain.FieldValidationError)
		return
	}
	response, err := h.service.Essay.ProcessEssayRequest(input)
	if err != nil {
		responser.NewErrorResponse(c, http.StatusInternalServerError, domain.EssayGraduateError)
		logger.Log.Errorf("Error while processing essay request: %v", err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"result": response})
}
