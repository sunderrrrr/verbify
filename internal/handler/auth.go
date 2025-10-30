package handler

import (
	"WhyAi/internal/domain"
	"WhyAi/pkg/logger"
	"WhyAi/pkg/responser"
	"net/http"

	"github.com/gin-gonic/gin"
)

func (h *Handler) signUp(c *gin.Context) {
	var input domain.User
	if err := c.BindJSON(&input); err != nil {
		responser.NewErrorResponse(c, http.StatusBadRequest, domain.FieldValidationError)
		logger.Log.Errorf("Error while binding input: %v", err)
		return
	}
	input.IP = c.ClientIP()
	input.Fingerprint = c.PostForm("fingerprint")

	signUp, err := h.service.Auth.CreateUser(input)
	if err != nil {
		logger.Log.Infoln(err)
		if err.Error() == domain.AntiFraudDeniedRegError {
			responser.NewErrorResponse(c, http.StatusUnauthorized, domain.AntiFraudDeniedRegError)
			return
		}
		responser.NewErrorResponse(c, http.StatusUnauthorized, domain.SignUpError)
		logger.Log.Error("Error while creating user: %v", err)
		return
	}

	c.JSON(http.StatusOK, gin.H{"id": signUp})

}

// TODO Сделать обработчик входа
func (h *Handler) signIn(c *gin.Context) {
	var input domain.AuthUser
	if err := c.BindJSON(&input); err != nil {
		responser.NewErrorResponse(c, http.StatusBadRequest, domain.FieldValidationError)
		logger.Log.Error("Error while binding input: %v", err)
		return
	}
	signIn, err := h.service.Auth.GenerateToken(input)
	if err != nil {
		responser.NewErrorResponse(c, http.StatusUnauthorized, domain.SignInError)
		logger.Log.Error("Error while generating token: %v", err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"token": signIn})
}
