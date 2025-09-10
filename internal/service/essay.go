package service

import (
	models2 "WhyAi/internal/domain"
	"WhyAi/pkg/logger"
	"encoding/json"
	"fmt"
	"os"
	"strings"
)

type EssayService struct {
	LLM *LLMService
}

func NewEssayService() *EssayService {
	return &EssayService{}
}

func (s *EssayService) GetEssayThemes() ([]models2.EssayTheme, error) {
	data, err := os.ReadFile("./static/essays.json")
	if err != nil {
		logger.Log.Error("Error reading essays.json:", err)
		return nil, err
	}
	var themes []models2.EssayTheme
	if err = json.Unmarshal(data, &themes); err != nil {
		logger.Log.Error("Error parsing essays.json:", err)
		return nil, err
	}
	return themes, nil
}

func (s *EssayService) GenerateUserPrompt(request models2.EssayRequest) (string, error) {
	prompt, err := os.ReadFile("./static/theory/essay.txt")
	if err != nil {
		logger.Log.Error("Error reading essay prompt file:", err)
		return "", err
	}
	return fmt.Sprintf(string(prompt), request.Essay, request.Theme, request.Text), nil
}

func (s *EssayService) ProcessEssayRequest(request models2.EssayRequest) (*models2.EssayResponse, error) {
	prompt, err := s.GenerateUserPrompt(request)
	if err != nil {
		return nil, err
	}

	llmRequest := []models2.Message{{Role: "user", Content: prompt}}
	llmAsk, err := s.LLM.AskLLM(llmRequest, true)
	if err != nil {
		return nil, err
	}

	resp := strings.ReplaceAll(llmAsk.Content, "`", "")
	var eResponse models2.EssayResponse
	if err = json.Unmarshal([]byte(resp), &eResponse); err != nil {
		return nil, err
	}
	return &eResponse, nil
}
