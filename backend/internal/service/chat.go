package service

import (
	"WhyAi/internal/domain"
	"WhyAi/internal/repository"
	"strconv"
)

type ChatService struct {
	repo    repository.Repository
	context string
	Theory  *TheoryService
	LLM     *LLMService
}

func NewChatService(repo repository.Repository, llm *LLMService, theory *TheoryService) *ChatService {
	context, err := LoadContext()
	if err != nil {
		return nil
	}
	return &ChatService{repo: repo, LLM: llm, Theory: theory, context: context}
}

func (s *ChatService) Chat(taskId, userId int) ([]domain.Message, error) {
	req, err := s.repo.ChatExist(taskId, userId)
	if err != nil {
		return nil, err
	}
	if !req {
		theory, _ := s.Theory.SendTheory(strconv.Itoa(taskId))
		msg := domain.Message{
			Role:    "system",
			Content: s.context + theory,
		}
		err := s.AddMessage(taskId, userId, msg)
		if err != nil {
			return nil, err
		}
		return []domain.Message{}, nil
	}
	chat, err := s.repo.GetChat(taskId, userId)
	if err != nil {
		return nil, err
	}
	return chat, err
}
func (s *ChatService) AddMessage(taskId, userId int, message domain.Message) error {
	if message.Role == "user" {
		if err := s.repo.AddMessage(taskId, userId, message); err != nil {
			return err
		}
		history, err := s.Chat(taskId, userId)
		if err != nil {
			return err
		}
		request, err := s.LLM.AskLLM(history, false)
		if err != nil {
			return err
		}
		if request == nil {
			return err
		}
		if err := s.repo.AddMessage(taskId, userId, *request); err != nil {
			return err
		}
		return nil
	} else if message.Role == "bot" || message.Role == "system" {
		if err := s.repo.AddMessage(taskId, userId, message); err != nil {
			return err
		}
	}
	return nil
}

func (s *ChatService) ClearContext(taskId, userId int) error {
	if err := s.repo.ClearContext(taskId, userId); err != nil {
		return err
	}
	theory, _ := s.Theory.SendTheory(strconv.Itoa(taskId))
	msg := domain.Message{
		Role:    "system",
		Content: s.context + theory,
	}
	if err := s.AddMessage(taskId, userId, msg); err != nil {
		return err
	}
	return nil

}
