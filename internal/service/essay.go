package service

import (
	"WhyAi/internal/domain"
	"WhyAi/pkg/logger"
	"encoding/json"
	"fmt"
	"os"
	"strings"
)

type EssayService struct {
	LLM *LLMService
}

func NewEssayService(llm *LLMService) *EssayService {
	return &EssayService{llm}
}

func (s *EssayService) GetEssayThemes() ([]domain.EssayTheme, error) {
	data, err := os.ReadFile("./static/essays.json")
	if err != nil {
		logger.Log.Error("Error reading essays.json:", err)
		return nil, err
	}
	var themes []domain.EssayTheme
	if err = json.Unmarshal(data, &themes); err != nil {
		logger.Log.Error("Error parsing essays.json:", err)
		return nil, err
	}
	return themes, nil
}

func (s *EssayService) GenerateUserPrompt(request domain.EssayRequest) (string, error) {
	prompt, err := os.ReadFile("./static/theory/essay.txt")
	if err != nil {
		logger.Log.Error("Error reading essay prompt file:", err)
		return "", err
	}
	return fmt.Sprintf(string(prompt), request.Essay, request.Theme, request.Text), nil
}

func (s *EssayService) ProcessEssayRequest(request domain.EssayRequest) (*domain.EssayResponse, error) {
	prompt, err := s.GenerateUserPrompt(request)
	if err != nil {
		return nil, err
	}

	llmRequest := []domain.Message{{Role: "user", Content: prompt}}
	llmAsk, err := s.LLM.AskLLM(llmRequest, true)
	if err != nil {
		return nil, err
	}

	resp := strings.ReplaceAll(llmAsk.Content, "`", "")
	var eResponse domain.EssayTempResponse
	if err = json.Unmarshal([]byte(resp), &eResponse); err != nil {
		return nil, err
	}
	finalScore := 0
	for i := 0; i < len(eResponse.Score); i++ {
		finalScore += eResponse.Score[i]
	}
	finalResult := domain.EssayResponse{
		Score:          finalScore,
		Feedback:       eResponse.Feedback,
		Recommendation: eResponse.Recommendation,
	}
	return &finalResult, nil
}
