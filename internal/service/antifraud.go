package service

import "WhyAi/internal/repository"

type AntifraudService struct {
	repo *repository.Repository
}

func NewAntifraudService(repo *repository.Repository) *AntifraudService {
	return &AntifraudService{
		repo: repo,
	}
}

func (s *AntifraudService) CheckFraud(ip, fingerprint string) (bool, error) {
	return s.repo.Antifraud.CheckFraud(ip, fingerprint)
}
