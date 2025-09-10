package service

import (
	"WhyAi/internal/domain"
	"WhyAi/pkg/logger"
	"bytes"
	"encoding/json"
	"errors"
	"net/http"
	"strings"
)

type LLMService struct {
	ApiUrl string
	Token  string
}

func NewLLMService(apiUrl, token string) *LLMService {
	return &LLMService{ApiUrl: apiUrl, Token: token}
}

func (s *LLMService) AskLLM(messages []domain.Message, isEssay bool) (*domain.Message, error) {
	body, err := json.Marshal(domain.LLMRequest{
		Model:       "deepseek-chat",
		Temperature: 0,
		Messages:    messages,
	})
	if err != nil {
		logger.Log.Errorf("Error marshaling LLM request: %v", err)
		return nil, errors.New("request marshal fail")
	}

	req, err := http.NewRequest("POST", s.ApiUrl, bytes.NewReader(body))
	if err != nil {
		logger.Log.Errorf("Error creating LLM request: %v", err)
		return nil, errors.New("fail to create request")
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+s.Token)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		logger.Log.Errorf("Error during LLM request: %v", err)
		return nil, errors.New("fail request")
	}
	defer resp.Body.Close()

	var res domain.LLMResponse
	if err = json.NewDecoder(resp.Body).Decode(&res); err != nil {
		logger.Log.Errorf("Error decoding LLM response: %v", err)
		return nil, errors.New("fail to decode response: " + err.Error())
	}
	if len(res.Choices) == 0 {
		logger.Log.Error("LLM response has no choices")
		return nil, errors.New("no choices in response")
	}

	ans := &res.Choices[0].Message
	if isEssay {
		ans.Content, _ = extractJson(ans.Content)
	}
	return ans, nil
}

func extractJson(text string) (string, error) {
	start, end := strings.Index(text, "{"), strings.LastIndex(text, "}")
	if start != -1 && end != -1 && start < end {
		return text[start : end+1], nil
	}
	return cleanText(text), nil
}

func cleanText(text string) string {
	var result strings.Builder
	for _, char := range text {
		if (char >= ' ' && char <= '~') || char == '\n' || char == ' ' {
			result.WriteRune(char)
		}
	}
	return result.String()
}
