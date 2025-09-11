package service

import (
	"WhyAi/internal/domain"
	"WhyAi/internal/repository"
)

type SubscriptionService struct {
	repo *repository.Repository
}

func NewSubscriptionService(repo *repository.Repository) *SubscriptionService {
	return &SubscriptionService{
		repo: repo,
	}
}

func (s *SubscriptionService) GetPlans(userId int) (*domain.Limits, error) {
	return s.repo.Subscription.GetFeatureLimits(userId)
}
