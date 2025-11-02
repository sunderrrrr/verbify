package service

import (
	"WhyAi/internal/config"
	"WhyAi/internal/domain"
	"WhyAi/pkg/logger"
	"WhyAi/pkg/sender"
	"bytes"
	"encoding/json"
	"errors"
	"net/http"
	"strings"
	"unicode"
)

type LLMService struct {
	ApiUrl string
	Token  string
}

func NewLLMService(cfg *config.Config) *LLMService {
	return &LLMService{ApiUrl: cfg.LLM.BaseURL, Token: cfg.LLM.APIKey}
}

func (s *LLMService) AskLLM(messages []domain.Message, isEssay bool) (*domain.Message, error) {
	model := "gpt-5-nano"
	if isEssay {
		model = "o4-mini"
	}
	body, err := json.Marshal(domain.LLMRequest{
		Model:       model,
		Temperature: 0,
		Messages:    messages,
	})
	if err != nil {
		return nil, errors.New("request marshal fail")
	}

	req, err := http.NewRequest("POST", s.ApiUrl, bytes.NewReader(body))
	if err != nil {
		return nil, errors.New("fail to create request")
	}

	req.Header.Set("Content-Type", "application/json; charset=utf-8")
	req.Header.Set("Authorization", "Bearer "+s.Token)

	resp, err := sender.Client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var res domain.LLMResponse
	//slogger.Log.Infof("response raw %v")
	logger.Log.Infof("response code %v", resp.StatusCode)

	if err = json.NewDecoder(resp.Body).Decode(&res); err != nil {
		return nil, errors.New("fail to decode response: " + err.Error())
	}
	logger.Log.Infof("response: %v", res)
	if len(res.Choices) == 0 {
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
	return strings.Map(func(r rune) rune {
		if unicode.IsControl(r) && r != '\n' && r != '\t' {
			return -1
		}
		return r
	}, text)
}
