package handler

import (
	"WhyAi/internal/domain"
	"WhyAi/pkg/logger"
	"WhyAi/pkg/responser"
	"net/http"

	"github.com/gin-gonic/gin"
)

func (h *Handler) SubscriptionCreate(c *gin.Context) {
	id, err := h.middleware.GetUserId(c)
	if err != nil {
		responser.NewErrorResponse(c, http.StatusUnauthorized, domain.UnAuthorizedError, nil)
		return
	}
	var input domain.PaymentRequest
	if err := c.ShouldBindJSON(&input); err != nil {
		responser.NewErrorResponse(c, http.StatusBadRequest, domain.FieldValidationError, nil)
		return
	}
	link, err := h.service.Subscription.CreateSubscriptionURL(id, input.PlanId)
	if err != nil {
		responser.NewErrorResponse(c, http.StatusInternalServerError, domain.CreatePaymentLinkError, err)
		logger.Log.Errorf("create subscription url error: %v", err)
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"url": link,
	})
}

func (h *Handler) Webhook(c *gin.Context) {
	token := c.GetHeader("X-Auth-Token")
	if token == "" || token == " " || token != h.cfg.Payment.ApiKey {
		responser.NewErrorResponse(c, http.StatusUnauthorized, domain.UnAuthorizedError, nil)
		return
	}
	var input domain.CustomWebhook
	if err := c.ShouldBindJSON(&input); err != nil {
		responser.NewErrorResponse(c, http.StatusBadRequest, domain.FieldValidationError, err)
	}
	if input.Status == "succeeded" {
		if err := h.service.Subscription.ActivateSubscription(input.Id); err != nil {
			responser.NewErrorResponse(c, http.StatusInternalServerError, domain.CreatePaymentLinkError, err)
			return
		}

	}
}

func (h *Handler) GetPlans(c *gin.Context) {
	_, err := h.middleware.GetUserId(c)
	if err != nil {
		responser.NewErrorResponse(c, http.StatusUnauthorized, domain.UnAuthorizedError, nil)
		return
	}
	plans, err := h.service.GetAllPlans()
	if err != nil {
		responser.NewErrorResponse(c, http.StatusInternalServerError, domain.CreatePaymentLinkError, err)
		logger.Log.Errorf("get plans err: %v", err)
		return
	}
	c.JSON(http.StatusOK, plans)
}
