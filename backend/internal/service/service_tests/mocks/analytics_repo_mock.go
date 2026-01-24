package mocks

import (
	"WhyAi/internal/domain"

	"github.com/stretchr/testify/mock"
)

type MockAnalyticsRepo struct {
	mock.Mock
}

func (m *MockAnalyticsRepo) UpdateMetrics(userId, lastRate int, problem string) error {
	args := m.Called(userId, lastRate, problem)
	return args.Error(0)
}

func (m *MockAnalyticsRepo) GetMetricsInfo(userId int) (*domain.StatsRaw, error) {
	args := m.Called(userId)
	var result *domain.StatsRaw
	if args.Get(0) != nil {
		result = args.Get(0).(*domain.StatsRaw)
	}
	return result, args.Error(1)
}
