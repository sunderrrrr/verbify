package service

import (
	"WhyAi/internal/domain"
	"WhyAi/internal/repository"
	"errors"
)

type PracticeService struct {
	llm       LLM
	analytics Analytics
	repo      repository.Practice
}

func NewPracticeService(llm LLM, analytics Analytics, repo repository.Practice) *PracticeService {
	return &PracticeService{
		llm:       llm,
		analytics: analytics,
		repo:      repo,
	}
}

func (s *PracticeService) GeneratePractice(taskType, count int) ([]domain.PracticeTask, error) {
	if !(taskType >= 1 && taskType <= 26 && count >= 1) {
		return nil, errors.New("invalid task type or count")
	}
	tasks, err := s.repo.GetTasksForPractice(taskType, count)
	if err != nil {
		return nil, err
	}
	return tasks, nil
}
func (s *PracticeService) CheckPractice(userId int, practice domain.PracticeRequest) (domain.PracticeResult, error) {
	if len(practice.Answers) != practice.Count {
		return domain.PracticeResult{}, errors.New("answers count mismatch")
	}

	correct := 0
	answerMap := make(map[int]bool)

	for _, task := range practice.Answers {
		if answerMap[task.TaskId] {
			return domain.PracticeResult{}, errors.New("duplicate task answer")
		}
		answerMap[task.TaskId] = true

		t, err := s.repo.GetTaskById(task.TaskId)
		if err != nil {
			return domain.PracticeResult{}, err
		}

		isCorrect := task.Value == t.CorrectAnswer
		if isCorrect {
			correct++
		}
	}

	attemptId, err := s.repo.CreateAttempt(userId, practice.EgeNumber, practice.Count, correct)
	if err != nil {
		return domain.PracticeResult{}, err
	}

	checked := make([]domain.CheckedPractice, 0, len(practice.Answers))

	for _, task := range practice.Answers {
		t, err := s.repo.GetTaskById(task.TaskId)
		if err != nil {
			return domain.PracticeResult{}, err
		}

		isCorrect := task.Value == t.CorrectAnswer

		err = s.repo.SaveAnswer(attemptId, task.TaskId, task.Value, isCorrect, task.Comment)
		if err != nil {
			return domain.PracticeResult{}, err
		}

		checked = append(checked, domain.CheckedPractice{
			TaskId:      task.TaskId,
			UserAnswer:  task.Value,
			RightAnswer: t.CorrectAnswer,
			IsCorrect:   isCorrect,
			Comment:     task.Comment,
			Hint:        t.Hint,
		})
	}

	res := domain.PracticeResult{
		AttemptId: attemptId,
		Results:   checked,
		Stats: struct {
			Total     int `json:"total"`
			Correct   int `json:"correct"`
			Incorrect int `json:"incorrect"`
			Percent   int `json:"percent"`
		}{
			Total:     practice.Count,
			Correct:   correct,
			Incorrect: practice.Count - correct,
			Percent:   int(float64(correct) / float64(practice.Count) * 100),
		},
	}

	return res, nil
}
