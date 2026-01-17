package service

import (
	"WhyAi/internal/config"
	"WhyAi/internal/domain"
	"WhyAi/internal/repository"
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"time"
)

type SubscriptionService struct {
	repo *repository.Repository
	cfg  *config.Config
}

func NewSubscriptionService(cfg *config.Config, repo *repository.Repository) *SubscriptionService {
	return &SubscriptionService{
		repo: repo,
		cfg:  cfg,
	}
}

func (s *SubscriptionService) GetPlans(userId int) (*domain.Limits, error) {
	return s.repo.Subscription.GetFeatureLimits(userId)
}

func (s *SubscriptionService) SetSubscription(userId int, subscriptionId int) error {
	return s.repo.Subscription.SetSubscription(userId, subscriptionId)
}

func (s *SubscriptionService) GetPlanById(id int) (*domain.Plan, error) {
	return s.repo.Subscription.GetPlanById(id)
}

func (s *SubscriptionService) GetAllPlans() ([]domain.Plan, error) {
	return s.repo.Subscription.GetAllPlans()
}

func (s *SubscriptionService) CreateSubscriptionURL(userId int, subscriptionId int) (string, error) {
	plan, err := s.GetPlanById(subscriptionId)

	if err != nil {
		return "", err
	}

	if plan == nil {
		return "", errors.New("plan not found")
	}

	paymentReq := map[string]interface{}{
		"amount":      float64(plan.Price),
		"currency":    "RUB",
		"description": fmt.Sprintf("Подписка на %s | UID: %d", plan.Name, userId),
		"return_url":  "https://verbify.icu/success",
		"metadata": map[string]string{
			"user_id": fmt.Sprintf("%d", userId),
			"plan_id": fmt.Sprintf("%d", plan.Id),
		},
	}
	body, err := json.Marshal(paymentReq)
	if err != nil {
		return "", err
	}
	apiUrl := fmt.Sprintf("%s/api/v1/payments", s.cfg.Payment.BaseURL)

	req, err := http.NewRequest(http.MethodPost, apiUrl, bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-API-Key", s.cfg.Payment.ApiKey)
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return "", errors.New(resp.Status)
	}
	var response domain.PaymentInfo
	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
		return "", err
	}

	payment := domain.Payment{
		UserId:    userId,
		PlanId:    plan.Id,
		PaymentId: response.PaymentID,
		Status:    "pending",
		StartAt:   time.Now().Add(time.Minute * 10),
		EndAt:     time.Now().Add(time.Minute * 10).Add(time.Hour * 24 * 30),
		CreatedAt: time.Now(),
	}
	if err := s.repo.Subscription.CreateTransaction(&payment); err != nil {
		return "", err
	}
	//logger.Log.Infoln(response)
	return response.Url, nil
}

func (s *SubscriptionService) ActivateSubscription(paymentId string) error {
	return s.repo.Subscription.ActivateSubscription(paymentId)
}
