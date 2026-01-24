package service

import (
	"WhyAi/internal/service/service_tests/mocks"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestUpdateMetrics(t *testing.T) {
	t.Run("update stats metrics", func(t *testing.T) {
		mockRepo := new(mocks.MockAnalyticsRepo)
		mockLlm := new(mocks.LlmServiceMock)
		mockService := NewAnalyticsService(mockRepo, mockLlm)
		mockRepo.On("UpdateMetrics", 1, 22, "qwerty").Return(nil)
		err := mockService.UpdateMetrics(1, 22, "qwerty")
		assert.NoError(t, err)
		assert.Equal(t, err, nil)
		mockRepo.AssertExpectations(t)
		mockLlm.AssertExpectations(t)
	})

}
