package handler

import (
	"WhyAi/internal/domain"
	"WhyAi/pkg/responser"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func (h *Handler) GetOrCreateChat(c *gin.Context) {
	userId, err := h.middleware.GetUserId(c)
	if err != nil {
		responser.NewErrorResponse(c, http.StatusInternalServerError, domain.InvalidIdError, nil)
		return
	}
	taskId, err := strconv.Atoi(c.Param("id"))
	req, err := h.service.Chat.Chat(taskId, userId)
	if err != nil {
		responser.NewErrorResponse(c, http.StatusInternalServerError, domain.GetChatError, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"result": req})
}

func (h *Handler) SendMessage(c *gin.Context) {
	userId, err := h.middleware.GetUserId(c)
	var msg domain.Message
	if err != nil {
		responser.NewErrorResponse(c, http.StatusInternalServerError, domain.InvalidIdError, nil)
		return
	}
	taskId, err := strconv.Atoi(c.Param("id"))

	if err := c.ShouldBindJSON(&msg); err != nil {
		responser.NewErrorResponse(c, http.StatusInternalServerError, domain.FieldValidationError, nil)
		return
	}
	//Добавляем вопрос пользователя
	if req := h.service.Chat.AddMessage(taskId, userId, msg); req != nil {
		responser.NewErrorResponse(c, http.StatusInternalServerError, domain.AddMessageError, err)
		return
	}

	final, err := h.service.Chat.Chat(taskId, userId)
	if err != nil {
		responser.NewErrorResponse(c, http.StatusInternalServerError, domain.GetChatError, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"result": final})
}

func (h *Handler) ClearContext(c *gin.Context) {
	userId, err := h.middleware.GetUserId(c)
	if err != nil {
		responser.NewErrorResponse(c, http.StatusInternalServerError, domain.InvalidIdError, nil)
		return
	}
	taskId, err := strconv.Atoi(c.Param("id"))
	if del := h.service.Chat.ClearContext(taskId, userId); del != nil {
		responser.NewErrorResponse(c, http.StatusInternalServerError, domain.ClearContextError, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"result": "ok"})
}
