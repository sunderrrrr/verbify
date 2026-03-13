// internal/repository/practice.go
package repository

import (
	"WhyAi/internal/domain"
	"database/sql"
	"errors"
	"fmt"

	"github.com/jmoiron/sqlx"
)

type PracticeRepository struct {
	db *sqlx.DB
}

func NewPracticeRepository(db *sqlx.DB) *PracticeRepository {
	return &PracticeRepository{db: db}
}

// GetTasksForPractice - получение заданий по номеру ЕГЭ
func (r *PracticeRepository) GetTasksForPractice(egeNumber, count int) ([]domain.PracticeTask, error) {
	var tasks []domain.PracticeTask
	query := `SELECT id, ege_number, text, hint FROM practice_tasks 
              WHERE ege_number = $1 
              ORDER BY RANDOM() 
              LIMIT $2`

	err := r.db.Select(&tasks, query, egeNumber, count)
	if err != nil {
		return nil, err
	}

	if len(tasks) == 0 {
		return nil, fmt.Errorf("no tasks found for ege_number %d", egeNumber)
	}

	return tasks, nil
}

// GetTaskById - получение задания по ID
func (r *PracticeRepository) GetTaskById(taskId int) (*domain.PracticeTask, error) {
	var task domain.PracticeTask
	query := `SELECT id, correct_answer, hint FROM practice_tasks WHERE id = $1`

	err := r.db.Get(&task, query, taskId)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, errors.New("task not found")
		}
		return nil, err
	}

	return &task, nil
}

// CreateAttempt - создание попытки
func (r *PracticeRepository) CreateAttempt(userId, egeNumber, tasksCount, correctCount int) (int, error) {
	var attemptId int
	query := `INSERT INTO practice_attempts (user_id, ege_number, tasks_count, correct_count) 
              VALUES ($1, $2, $3, $4) 
              RETURNING id`

	err := r.db.Get(&attemptId, query, userId, egeNumber, tasksCount, correctCount)
	if err != nil {
		return 0, err
	}

	return attemptId, nil
}

// SaveAnswer - сохранение ответа
func (r *PracticeRepository) SaveAnswer(attemptId, taskId int, userAnswer string, isCorrect bool, comment string) error {
	query := `INSERT INTO practice_answers (attempt_id, task_id, user_answer, is_correct, comment) 
              VALUES ($1, $2, $3, $4, $5)`

	_, err := r.db.Exec(query, attemptId, taskId, userAnswer, isCorrect, comment)
	return err
}

// GetAttemptResults - получение результатов попытки
func (r *PracticeRepository) GetAttemptResults(attemptId int) ([]domain.CheckedPractice, error) {
	var results []domain.CheckedPractice
	query := `SELECT 
                pt.id as task_id,
                pa.user_answer,
                pt.correct_answer as right_answer,
                pa.is_correct as correct,
                pa.comment,
                pt.hint
              FROM practice_answers pa
              JOIN practice_tasks pt ON pa.task_id = pt.id
              WHERE pa.attempt_id = $1
              ORDER BY pa.id`

	err := r.db.Select(&results, query, attemptId)
	if err != nil {
		return nil, err
	}

	return results, nil
}
