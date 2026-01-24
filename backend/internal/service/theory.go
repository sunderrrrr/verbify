package service

import (
	"WhyAi/internal/repository"
	"WhyAi/pkg/logger"
	"fmt"
	"io/ioutil"
	"strconv"
)

type TheoryService struct {
	repo repository.Repository
}

func NewTheoryService(repo repository.Repository) *TheoryService {
	return &TheoryService{repo: repo}
}

func GetTheory(n string) (string, error) {

	data, err := ioutil.ReadFile(fmt.Sprintf("./static/theory/%s.txt", n))
	if err != nil {
		logger.Log.Errorf("Error while reading file: %v", err)
		return "", err
	}
	return string(data), nil
}
func LoadContext() (string, error) {
	data, err := ioutil.ReadFile("./static/theory/context.txt")
	if err != nil {
		return "", err
	}
	return string(data), nil
}
func (t *TheoryService) SendTheory(n string) (string, error) {
	_, err := strconv.Atoi(n)
	if err != nil {
		return "", err
	}
	theory, err := GetTheory(n)
	if err != nil {
		logger.Log.Errorf("Error while getting theory: %v", err)
		return "", err
	}
	return theory, nil
}
