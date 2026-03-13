package handler

import (
	"WhyAi/internal/domain"
	"WhyAi/pkg/logger"
	"WhyAi/pkg/responser"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func (h *Handler) TasksDescriptions(c *gin.Context) {
	_, err := h.middleware.GetUserId(c)
	if err != nil {
		responser.NewErrorResponse(c, http.StatusUnauthorized, domain.InvalidIdError, err)
		return
	}

}

func (h *Handler) GeneratePractice(c *gin.Context) {
	userId, err := h.middleware.GetUserId(c)
	logger.Log.Infoln(userId)
	if err != nil {
		responser.NewErrorResponse(c, http.StatusUnauthorized, domain.InvalidIdError, err)
		return
	}

	taskTypeStr := c.Query("type")
	countStr := c.Query("count")

	taskType, err := strconv.Atoi(taskTypeStr)
	if err != nil || taskType < 1 || taskType > 26 {
		responser.NewErrorResponse(c, http.StatusBadRequest, "invalid task type", nil)
		return
	}

	count, err := strconv.Atoi(countStr)
	if err != nil || count < 1 || count > 20 {
		responser.NewErrorResponse(c, http.StatusBadRequest, "invalid count", nil)
		return
	}

	tasks, err := h.service.Practice.GeneratePractice(taskType, count)
	if err != nil {
		responser.NewErrorResponse(c, http.StatusInternalServerError, "failed to generate practice", err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"user_id": userId,
		"tasks":   tasks,
	})
}

func (h *Handler) CheckPractice(c *gin.Context) {
	userId, err := h.middleware.GetUserId(c)
	if err != nil {
		responser.NewErrorResponse(c, http.StatusUnauthorized, domain.InvalidIdError, nil)
		return
	}

	var input domain.PracticeRequest
	if err := c.BindJSON(&input); err != nil {
		responser.NewErrorResponse(c, http.StatusBadRequest, domain.FieldValidationError, err)
		return
	}
	input.UserId = userId

	result, err := h.service.Practice.CheckPractice(userId, input)
	if err != nil {
		responser.NewErrorResponse(c, http.StatusInternalServerError, "failed to check practice", err)
		return
	}

	c.JSON(http.StatusOK, gin.H{"result": result})
}
