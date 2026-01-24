package service

import (
	"WhyAi/internal/domain"
	"fmt"
	"io"
	"path/filepath"
	"strings"
)

type ScanAdapter struct {
	llmService *LLMService
}

var scanPrompt = `Ты получаешь несколько изображений, которые являются последовательными страницами одного документа. Если изображение одно просто верни ТОЛЬКО его чистый текст БЕЗ КОММЕНТАРИЕВ

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

func NewScanService(llmService *LLMService) *ScanAdapter {
	return &ScanAdapter{llmService: llmService}
}

func (a *ScanAdapter) ScanPhoto(files []io.Reader, filenames []string) (string, error) {
	var imageDescriptions []string

	for i, file := range files {
		imageData, err := io.ReadAll(file)
		if err != nil {
			return "", fmt.Errorf("failed to read image %d: %w", i+1, err)
		}

		mimeType := a.getMimeType(filenames[i])

		imageDesc := fmt.Sprintf("[Image %d: %s, size: %d bytes]", i+1, mimeType, len(imageData))
		imageDescriptions = append(imageDescriptions, imageDesc)
	}

	prompt := scanPrompt + "\n\nДоступные изображения:\n" + strings.Join(imageDescriptions, "\n")

	messages := []domain.Message{
		{
			Role:    "user",
			Content: prompt,
		},
	}

	response, err := a.llmService.AskLLM(messages, false)
	if err != nil {
		return "", fmt.Errorf("failed to process scan request: %w", err)
	}

	return response.Content, nil
}

func (a *ScanAdapter) getMimeType(filename string) string {
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
