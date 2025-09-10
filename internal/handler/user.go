package handler

import (
	"WhyAi/internal/domain"
	"WhyAi/pkg/logger"
	"WhyAi/pkg/responser"
	"github.com/gin-gonic/gin"
	"net/http"
)

func (h *Handler) GetUserInfo(c *gin.Context) {
}

func (h *Handler) UpdateUserInfo(c *gin.Context) {
}

func (h *Handler) DeleteUserInfo(c *gin.Context) {
}

func (h *Handler) SendResetRequest(c *gin.Context) {
	var input domain.ResetRequest
	err := c.BindJSON(&input)
	if err != nil {
		responser.NewErrorResponse(c, http.StatusInternalServerError, domain.FieldValidationError)
		return
	}
	err = h.service.User.ResetPasswordRequest(input)
	if err != nil {
		responser.NewErrorResponse(c, http.StatusInternalServerError, domain.PasswordResetRequestError)
		logger.Log.Errorf("Error while processing user request: %v", err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"status": "request sent"})

}

func (h *Handler) UpdatePassword(c *gin.Context) {
	var input domain.UserReset
	err := c.BindJSON(&input)
	if err != nil {
		responser.NewErrorResponse(c, http.StatusInternalServerError, domain.FieldValidationError)
		return
	}
	err = h.service.User.ResetPassword(input)
	if err != nil {
		responser.NewErrorResponse(c, http.StatusInternalServerError, domain.PasswordResetError)
		logger.Log.Errorf("Error while processing password reset: %v", err)
		return
	} else {
		c.JSON(http.StatusOK, gin.H{"status": "password reset confirmed"})
	}

}
