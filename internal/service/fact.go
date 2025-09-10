package service

import (
	"WhyAi/internal/domain"
	"WhyAi/pkg/logger"
	"github.com/goccy/go-json"
	"io/ioutil"
)

type FactService struct {
}

func NewFactService() *FactService {
	return &FactService{}
}

func (s *FactService) GetFacts() ([]domain.Fact, error) {
	data, err := ioutil.ReadFile("./static/facts.json")
	if err != nil {
		logger.Log.Error("Error while reading facts.json: %v", err)
		return nil, err
	}
	var facts []domain.Fact
	err = json.Unmarshal(data, &facts)
	if err != nil {
		logger.Log.Error("Error while parsing facts.json: %v", err)
		return nil, err
	}
	return facts, nil
}
