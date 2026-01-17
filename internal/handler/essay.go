package handler

import (
	"WhyAi/internal/domain"
	"WhyAi/pkg/responser"
	"net/http"

	"github.com/gin-gonic/gin"
)

func (h *Handler) GetEssayTasks(c *gin.Context) {
	if _, err := h.middleware.GetUserId(c); err != nil {
		responser.NewErrorResponse(c, http.StatusUnauthorized, domain.InvalidIdError, nil)
		return
	}
	themes, err := h.service.Essay.GetEssayThemes()
	if err != nil {
		responser.NewErrorResponse(c, http.StatusInternalServerError, domain.GetEssayThemesFailed, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"result": themes})
}

func (h *Handler) SendEssay(c *gin.Context) {
	id, err := h.middleware.GetUserId(c)
	var input domain.EssayRequest
	if _, err := h.middleware.GetUserId(c); err != nil {
		responser.NewErrorResponse(c, http.StatusUnauthorized, domain.InvalidIdError, nil)
		return
	}
	if err := c.BindJSON(&input); err != nil {
		responser.NewErrorResponse(c, http.StatusBadRequest, domain.FieldValidationError, err)
		return
	}
	response, err := h.service.Essay.ProcessEssayRequest(id, input)
	if err != nil {
		responser.NewErrorResponse(c, http.StatusInternalServerError, domain.EssayGraduateError, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"result": response})
}
