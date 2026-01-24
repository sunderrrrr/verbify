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
		responser.NewErrorResponse(c, http.StatusBadRequest, domain.FieldValidationError, nil)
		logger.Log.Errorf("Error while binding input: %v", err)
		return
	}
	input.IP = c.Request.RemoteAddr
	input.Fingerprint = c.PostForm("fingerprint")
	logger.Log.Infof("signup input: %v\n", input)
	logger.Log.Infof("x forwared from %v", c.GetHeader("X-Forwarded-For"))
	signUp, err := h.service.Auth.CreateUser(input)
	if err != nil {
		logger.Log.Infoln(err)
		if err.Error() == domain.AntiFraudDeniedRegError {
			responser.NewErrorResponse(c, http.StatusUnauthorized, domain.AntiFraudDeniedRegError, err)
			return
		}
		responser.NewErrorResponse(c, http.StatusUnauthorized, domain.SignUpError, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{"id": signUp})

}

// TODO Сделать обработчик входа
func (h *Handler) signIn(c *gin.Context) {
	var input domain.AuthUser
	if err := c.BindJSON(&input); err != nil {
		responser.NewErrorResponse(c, http.StatusBadRequest, domain.FieldValidationError, nil)
		return
	}
	signIn, err := h.service.Auth.GenerateToken(input)
	if err != nil {
		responser.NewErrorResponse(c, http.StatusUnauthorized, domain.SignInError, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"token": signIn})
}
