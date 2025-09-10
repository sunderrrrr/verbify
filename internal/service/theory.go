package service

import (
	"WhyAi/internal/repository"
	"WhyAi/pkg/logger"
	"fmt"
	"io/ioutil"
)

type TheoryService struct {
	repo repository.Repository
}

func NewTheoryService(repo repository.Repository) *TheoryService {
	return &TheoryService{repo: repo}
}

func GetTheory(n string, forBot bool) (string, error) {

	data, err := ioutil.ReadFile(fmt.Sprintf("./static/theory/%s.txt", n))
	if err != nil {
		logger.Log.Error("Error while reading file: %v", err)
		return "", err
	}
	return string(data), nil
}
func LoadContext() (string, error) {
	data, err := ioutil.ReadFile(fmt.Sprintf("./static/theory/context.txt"))
	if err != nil {
		return "", err
	}
	return string(data), nil
}
func (t *TheoryService) SendTheory(n string, forBot bool) (string, error) {
	theory, err := GetTheory(n, forBot)
	if err != nil {
		logger.Log.Error("Error while getting theory: %v", err)
		return "", err
	}
	return theory, nil
}
