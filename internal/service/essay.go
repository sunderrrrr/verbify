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
	logger.Log.Infoln(eResponse)
	finalResult := domain.EssayResponse{
		Score:          finalScore,
		Feedback:       eResponse.Feedback,
		Recommendation: eResponse.Recommendation,
	}
	return &finalResult, nil
}

func (s *EssayService) TempEssayRequest(request domain.EssayRequest) (*domain.EssayResponse, error) {
	return &domain.EssayResponse{
		Score:          22,
		Feedback:       "**K1 (1/1):** Позиция автора чётко сформулирована — главная цель критики – взращивать талант, а не подавлять его.\n**K2 (3/3):** Приведены два примера из текста (покровительствующие критикующие критики), дана поясняющая интерпретация каждого и указана их смысловая связь.\n**K3 (2/2):** Высказано согласие с позицией автора и приведён аргумент из личного опыта (примеры с учительницей и другом-художником).\n**K4 (1/1):** Текст передан без искажения фактов оригинала.\n**K5 (2/2):** Логичное и связное изложение, явных противоречий нет.\n**K6 (1/1):** Этические нормы соблюдены, оскорблений или грубости нет.\n**K7 (3/3):** Орфографических ошибок не обнаружено.\n**K8 (3/3):** Пунктуационные нормы соблюдены, знаки препинания расставлены корректно.\n**K9 (2/3):** Есть одна грамматическая ошибка: неверный падеж в сочетании «нравственных качествах человека».\n**K10 (3/3):** Речевые нормы соблюдены, стилистических нарушений не выявлено",
		Recommendation: "- Для K9: Исправить грамматическую ошибку — заменить «нравственных качествах человека» на «нравственных качеств человека».",
	}, nil
}
