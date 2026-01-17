package handler

import (
	"WhyAi/internal/domain"
	"WhyAi/pkg/logger"
	"WhyAi/pkg/responser"
	"net/http"

	"github.com/gin-gonic/gin"
)

func (h *Handler) GetUserInfo(c *gin.Context) {
	id, err := h.middleware.GetUserId(c)
	if err != nil {
		responser.NewErrorResponse(c, http.StatusUnauthorized, domain.UnAuthorizedError, err)
		return
	}
	info, err := h.service.GetUserById(id)
	if err != nil {
		responser.NewErrorResponse(c, http.StatusInternalServerError, "failed to get user info", err)
		logger.Log.Errorf("failed to get user info: %v", err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"info": info})
}

func (h *Handler) UpdateUserInfo(c *gin.Context) {
}

func (h *Handler) DeleteUserInfo(c *gin.Context) {
}

func (h *Handler) SendResetRequest(c *gin.Context) {
	var input domain.ResetRequest

	if err := c.BindJSON(&input); err != nil {
		responser.NewErrorResponse(c, http.StatusInternalServerError, domain.FieldValidationError, nil)
		return
	}

	if err := h.service.User.ResetPasswordRequest(input); err != nil {
		responser.NewErrorResponse(c, http.StatusInternalServerError, domain.PasswordResetRequestError, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"status": "request sent"})

}

func (h *Handler) UpdatePassword(c *gin.Context) {
	var input domain.UserReset
	if err := c.BindJSON(&input); err != nil {
		responser.NewErrorResponse(c, http.StatusInternalServerError, domain.FieldValidationError, err)
		return
	}
	if err := h.service.User.ResetPassword(input); err != nil {
		responser.NewErrorResponse(c, http.StatusInternalServerError, domain.PasswordResetError, err)
		logger.Log.Errorf("Error while processing password reset: %v", err)
		return
	} else {
		c.JSON(http.StatusOK, gin.H{"status": "password reset confirmed"})
	}
}

func (h *Handler) GetStats(c *gin.Context) {}

func (h *Handler) GenerateStatsReport(c *gin.Context) {
	id, err := h.middleware.GetUserId(c)
	if err != nil {
		responser.NewErrorResponse(c, http.StatusUnauthorized, domain.UnAuthorizedError, err)
		return
	}
	report, err := h.service.Analytics.AnalyzeStats(id)
	if err != nil {
		responser.NewErrorResponse(c, http.StatusInternalServerError, "failed to generate stats report", nil)
		logger.Log.Errorf("failed to generate stats report: %v", err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"result": report})
}
