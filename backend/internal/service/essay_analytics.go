package service

import (
	"WhyAi/internal/domain"
	"WhyAi/internal/repository"
	"WhyAi/pkg/logger"
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"strings"
	"time"
)

type AnalyticsService struct {
	repo repository.Analytics
	llm  LLM
}

func NewAnalyticsService(repo repository.Analytics, llm LLM) *AnalyticsService {
	logger.Log.Infof("repo: %v, llm %v", repo, llm)
	return &AnalyticsService{repo: repo, llm: llm}
}

var (
	mockRawStats = &domain.StatsRaw{
		Id:                2,
		UserId:            1,
		EssayRates:        [4]float64{3.0, 3.5, 4.0, 3.0},
		ProblematicThemes: []string{"theme1", "theme2", "theme3", "theme4"}, // ровно 4 темы
		Theme1:            3,
		Theme2:            4,
		Theme3:            2,
		Theme4:            5,
		CreatedAt:         time.Now().Add(-48 * time.Hour),
		UpdatedAt:         time.Now(),
	}
	mockLLMContent = &domain.Message{
		Content: `{
		  "id": 1,
		  "user_id": 123,
		  "essay_avg_rate": 20.5,
		  "problematic_themes": "Наблюдается положительная динамика в освоении материала - Ваши оценки выросли с 19 до 22 баллов. Однако анализ проблемных зон выявляет устойчивые сложности с правописанием Н/НН в причастиях и обособлением определительных оборотов, которые повторяются в трех из четырех работ. В третьем сочинении появились новые проблемы с речевыми ошибками и согласованием, но в последней работе Вы смогли их преодолеть. Наибольшее внимание уделялось теме 1, что, вероятно, способствовало улучшению результатов в соответствующих разделах. Рекомендуется сосредоточиться на отработке пунктуации в сложных синтаксических конструкциях, так как эта проблема проявляется стабильно.",
		  "most_clickable_theme": 1
		}`,
	}
)

func (s *AnalyticsService) UpdateMetrics(userId, lastRate int, problem string) error {

	return s.repo.UpdateMetrics(userId, lastRate, problem)
}

func (s *AnalyticsService) AnalyzeStats(userId int) (domain.StatsAnalysisResponse, error) {
	rawMetrics, err := s.repo.GetMetricsInfo(userId)
	//rawMetrics = mockRawStats
	//err = nil
	logger.Log.Infof("rawMerics: %v", rawMetrics)
	if err != nil {
		logger.Log.Errorf("user.service.GetMetricsInfo failed: %v", err)
		return domain.StatsAnalysisResponse{}, err
	}

	// Проверяем структуру rawMetrics
	if rawMetrics == nil {
		//logger.Log.Error("rawMetrics is nil")
		return domain.StatsAnalysisResponse{}, errors.New("metrics data is nil")
	}

	logger.Log.Infof("problematicThemes length: %d", len(rawMetrics.ProblematicThemes))
	for _, theme := range rawMetrics.ProblematicThemes {
		logger.Log.Info(theme)
	}

	if len(rawMetrics.ProblematicThemes) < 4 {
		//logger.Log.Warn("not enough data to analyze")
		return domain.StatsAnalysisResponse{}, errors.New("not enough data to analyze")
	}
	for _, pr := range rawMetrics.ProblematicThemes {
		logger.Log.Info(pr)
	}
	prompt, err := generateAnalysisPrompt(rawMetrics)
	if err != nil {
		return domain.StatsAnalysisResponse{}, err
	}

	msg := []domain.Message{{
		Role:    "system",
		Content: prompt},
	}
	logger.Log.Infof("analytics: %v", msg)
	resp, err := s.llm.AskLLM(msg, false)
	//resp, err := mockLLMContent, nil
	if err != nil {
		logger.Log.Errorf("service.AskLLM failed: %v", err)
		return domain.StatsAnalysisResponse{}, err
	}

	if resp == nil {
		logger.Log.Error("llm response is nil")
		return domain.StatsAnalysisResponse{}, errors.New("empty response from LLM")
	}

	logger.Log.Infof("LLM response: %s", resp.Content)

	response := strings.ReplaceAll(resp.Content, "`", "")

	logger.Log.Info("unmarshaling JSON")
	var metrics domain.StatsAnalysisResponse
	if err = json.Unmarshal([]byte(response), &metrics); err != nil {
		logger.Log.Errorf("json unmarshal failed: %v", err)
		logger.Log.Errorf("response that failed: %s", response)
		return domain.StatsAnalysisResponse{}, err
	}

	return metrics, nil
}

func generateAnalysisPrompt(raw *domain.StatsRaw) (string, error) {
	prompt, err := os.ReadFile("./static/theory/analysis.txt")
	if err != nil {
		logger.Log.Errorf("Error reading essay prompt file: %v", err)
		return "", err
	}
	return fmt.Sprintf(string(prompt), raw), nil
}
