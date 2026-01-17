package handler

import (
	"WhyAi/internal/domain"
	"WhyAi/pkg/responser"

	"github.com/gin-gonic/gin"
)

func (h *Handler) adminIdentity(c *gin.Context) {
	r, err := h.middleware.GetRoleId(c)
	if err != nil {
		responser.NewErrorResponse(c, 500, domain.InvalidRoleError, nil)
	}
	if r != 0 {
		responser.NewErrorResponse(c, 403, "you are not admin", nil)
		return
	}
	c.Next()
}

func (h *Handler) GetAllUsersList(c *gin.Context) {}

func (h *Handler) SetSubscription(c *gin.Context) {}

func (h *Handler) RemoveSubscription(c *gin.Context) {}

func (h *Handler) DeleteUser(c *gin.Context) {}
