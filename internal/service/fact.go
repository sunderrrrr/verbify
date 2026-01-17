package service

import (
	"WhyAi/internal/domain"
	"WhyAi/pkg/logger"
	"io/ioutil"

	"github.com/goccy/go-json"
)

type FactService struct {
}

func NewFactService() *FactService {
	return &FactService{}
}

func (s *FactService) GetFacts() ([]domain.Fact, error) {
	data, err := ioutil.ReadFile("./static/facts.json")
	if err != nil {
		logger.Log.Errorf("Error while reading facts.json: %v", err)
		return nil, err
	}
	var facts []domain.Fact
	err = json.Unmarshal(data, &facts)
	if err != nil {
		logger.Log.Errorf("Error while parsing facts.json: %v", err)
		return nil, err
	}
	return facts, nil
}
