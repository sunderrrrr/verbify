package mocks

import (
	"WhyAi/internal/domain"

	"github.com/stretchr/testify/mock"
)

type LlmServiceMock struct {
	mock.Mock
}

func (m *LlmServiceMock) AskLLM(messages []domain.Message, isEssay bool) (*domain.Message, error) {
	args := m.Called(messages, isEssay)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.Message), args.Error(0)
}
