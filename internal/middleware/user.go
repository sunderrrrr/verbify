package middleware

import (
	"WhyAi/internal/domain"
	"WhyAi/pkg/responser"
	"errors"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

// Промежуточкая аунтентификация пользователя
func (m *MiddlewareService) UserIdentity(c *gin.Context) {
	header := c.GetHeader(authorizationHeader)
	//origin := c.Request.Header.Get("Origin")
	//logger.Log.Infof("DEBUG: ORIGIN: %s", origin)
	if header == "" {
		responser.NewErrorResponse(c, http.StatusUnauthorized, domain.UnAuthorizedError, nil)
		return
	}
	headerParts := strings.Split(header, " ")
	if len(headerParts) != 2 {
		responser.NewErrorResponse(c, http.StatusUnauthorized, domain.UnAuthorizedError, nil)
		return
	}
	userId, err := m.service.Auth.ParseToken(headerParts[1])
	if err != nil {
		responser.NewErrorResponse(c, http.StatusUnauthorized, domain.ParseTokenError, err)
		return
	}
	roleId, err := m.service.User.GetRoleById(userId.Id)
	if err != nil {
		responser.NewErrorResponse(c, http.StatusInternalServerError, domain.GetRoleByUIDError, err)
		return
	}
	c.Set(roleCtx, roleId)
	c.Set(userCtx, userId.Id)
}

func (m *MiddlewareService) GetUserId(c *gin.Context) (int, error) {
	id, ok := c.Get(userCtx)
	if !ok {
		responser.NewErrorResponse(c, http.StatusUnauthorized, domain.NoUIDError, nil)
		return 0, errors.New(domain.NoUIDError)
	}
	idInt, ok := id.(int)
	if !ok {
		responser.NewErrorResponse(c, http.StatusUnauthorized, domain.InvalidIdError, nil)
		return 0, errors.New(domain.InvalidIdError)
	}
	return idInt, nil
}

func (m *MiddlewareService) GetRoleId(c *gin.Context) (int, error) {
	id, ok := c.Get(roleCtx)
	if !ok {
		responser.NewErrorResponse(c, http.StatusUnauthorized, domain.NoRoleError, nil)
		return 0, errors.New(domain.NoRoleError)
	}
	idInt, ok := id.(int)
	if !ok {
		responser.NewErrorResponse(c, http.StatusUnauthorized, domain.InvalidRoleError, nil)
		return 0, errors.New(domain.InvalidRoleError)
	}
	return idInt, nil
}
