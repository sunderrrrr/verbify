package service

import (
	"WhyAi/internal/config"
	"WhyAi/pkg/sender"
	"bytes"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"path/filepath"
	"strings"
)

type ScanService struct {
	Token string
}

var prompt = `Ты получаешь несколько изображений, которые являются последовательными страницами одного документа. Если изображение одно просто верни ТОЛЬКО его чистый текст БЕЗ КОММЕНАТРИЕВ

ТВОЯ ЗАДАЧА:
1. Проанализируй ВСЕ изображения в предоставленном порядке
2. Восстанови полный текст документа от начала до конца
3. Сохрани:
   - Логическую последовательность текста
   - Абзацы и форматирование
   - Нумерацию страниц (если есть)
   - Заголовки и подзаголовки
4. Если текст обрывается на одной странице и продолжается на следующей - аккуратно соедини
5. Верни ЕДИНЫЙ связный текст
6. ВНОСИТЬ КОММЕНТАРИИ ЗАПРЕЩЕНО - ТЫ ДОЛЖЕН ВЕРНУТЬ ТОЛЬКО ТЕКСТ.
Результат должен читаться как цельный документ.`

func NewScanService(cfg *config.Config) *ScanService {
	return &ScanService{Token: cfg.LLM.OR_API}
}

func (s *ScanService) ScanPhoto(files []io.Reader, filenames []string) (string, error) {

	content := []map[string]interface{}{
		{
			"type": "text",
			"text": prompt,
		},
	}

	for i, file := range files {
		imageData, err := io.ReadAll(file)
		if err != nil {
			return "", fmt.Errorf("failed to read image %d: %w", i+1, err)
		}

		encodedImage := base64.StdEncoding.EncodeToString(imageData)
		mimeType := s.getMimeType(filenames[i])

		content = append(content, map[string]interface{}{
			"type": "image_url",
			"image_url": map[string]string{
				"url": "data:" + mimeType + ";base64," + encodedImage,
			},
		})
	}

	request := map[string]interface{}{
		"model":       "qwen/qwen2.5-vl-32b-instruct:free",
		"temperature": 0,
		"messages": []map[string]interface{}{
			{
				"role":    "user",
				"content": content,
			},
		},
	}

	return s.sendRequest(request)
}

func (s *ScanService) sendRequest(request map[string]interface{}) (string, error) {
	jsonData, err := json.Marshal(request)
	if err != nil {
		return "", fmt.Errorf("failed to marshal request: %w", err)
	}

	req, err := http.NewRequest("POST", "https://openrouter.ai/api/v1/chat/completions", bytes.NewBuffer(jsonData))
	if err != nil {
		return "", fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+s.Token)

	resp, err := sender.Client.Do(req)
	if err != nil {
		return "", fmt.Errorf("failed to send request: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("failed to read response: %w", err)
	}

	var result map[string]interface{}
	if err := json.Unmarshal(body, &result); err != nil {
		return "", fmt.Errorf("failed to parse response: %w", err)
	}

	if errorObj, exists := result["error"]; exists {
		if errorMap, ok := errorObj.(map[string]interface{}); ok {
			if message, ok := errorMap["message"].(string); ok {
				return "", fmt.Errorf("API error: %s", message)
			}
		}
		return "", fmt.Errorf("API error: %v", errorObj)
	}

	choices, exists := result["choices"]
	if !exists {
		return "", fmt.Errorf("no 'choices' field in response")
	}

	choicesSlice, ok := choices.([]interface{})
	if !ok || len(choicesSlice) == 0 {
		return "", fmt.Errorf("invalid choices format")
	}

	firstChoice, ok := choicesSlice[0].(map[string]interface{})
	if !ok {
		return "", fmt.Errorf("invalid first choice format")
	}

	message, ok := firstChoice["message"].(map[string]interface{})
	if !ok {
		return "", fmt.Errorf("invalid message format")
	}

	content, ok := message["content"].(string)
	if !ok {
		return "", fmt.Errorf("invalid content format")
	}

	return content, nil
}

func (s *ScanService) getMimeType(filename string) string {
	ext := strings.ToLower(filepath.Ext(filename))
	switch ext {
	case ".png":
		return "image/png"
	case ".jpg", ".jpeg":
		return "image/jpeg"
	case ".gif":
		return "image/gif"
	case ".webp":
		return "image/webp"
	default:
		return "image/jpeg"
	}
}
