package handler

import (
	"WhyAi/internal/domain"
	"WhyAi/pkg/logger"
	"WhyAi/pkg/responser"
	"github.com/gin-gonic/gin"
	"net/http"
	"strconv"
)

func (h *Handler) GetOrCreateChat(c *gin.Context) {
	userId, err := h.middleware.GetUserId(c)
	if err != nil {
		responser.NewErrorResponse(c, http.StatusInternalServerError, domain.InvalidIdError)
		logger.Log.Errorf("Error while getting user id: %v", err)
		return
	}
	taskId, err := strconv.Atoi(c.Param("id"))
	req, err := h.service.Chat.Chat(taskId, userId)
	if err != nil {
		responser.NewErrorResponse(c, http.StatusInternalServerError, domain.GetChatError)
		logger.Log.Errorf("Error while getting chat: %v", err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"result": req})
}

func (h *Handler) SendMessage(c *gin.Context) {
	userId, err := h.middleware.GetUserId(c)
	var msg domain.Message
	if err != nil {
		responser.NewErrorResponse(c, http.StatusInternalServerError, domain.InvalidIdError)
		logger.Log.Errorf("Error while getting user id: %v", err)
		return
	}
	taskId, err := strconv.Atoi(c.Param("id"))

	if err := c.ShouldBindJSON(&msg); err != nil {
		responser.NewErrorResponse(c, http.StatusInternalServerError, domain.FieldValidationError)
		logger.Log.Errorf("Error while binding input: %v", err)
		return
	}
	//Добавляем вопрос пользователя
	if req := h.service.Chat.AddMessage(taskId, userId, msg); req != nil {
		responser.NewErrorResponse(c, http.StatusInternalServerError, domain.AddMessageError)
		logger.Log.Errorf("Error while sending message: %v", req)
		return
	}

	final, err := h.service.Chat.Chat(taskId, userId)
	if err != nil {
		responser.NewErrorResponse(c, http.StatusInternalServerError, domain.GetChatError)
		logger.Log.Errorf("Error while getting chat: %v", err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"result": final})
}

func (h *Handler) ClearContext(c *gin.Context) {
	userId, err := h.middleware.GetUserId(c)
	if err != nil {
		responser.NewErrorResponse(c, http.StatusInternalServerError, domain.InvalidIdError)
		logger.Log.Errorf("Error while getting user id: %v", err)
		return
	}
	taskId, err := strconv.Atoi(c.Param("id"))
	if del := h.service.Chat.ClearContext(taskId, userId); del != nil {
		responser.NewErrorResponse(c, http.StatusInternalServerError, domain.ClearContextError)
		logger.Log.Errorf("Error while clearing context: %v", del)
		return
	}
	c.JSON(http.StatusOK, gin.H{"result": "ok"})
}
