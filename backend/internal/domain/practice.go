package domain

// internal/domain/practice.go
type PracticeTask struct {
	Id            int    `json:"id" db:"id"`
	EgeNumber     int    `json:"ege_number" db:"ege_number"` // 9, 10, 11...
	Text          string `json:"text" db:"text"`
	Hint          string `json:"hint" db:"hint"`
	CorrectAnswer string `json:"-" db:"correct_answer"` // не отдаем на фронт
}

type TaskAnswer struct {
	TaskId  int    `json:"task_id"`
	Value   string `json:"value"`
	Comment string `json:"comment"`
}

type PracticeRequest struct {
	UserId    int          `json:"user_id"`
	EgeNumber int          `json:"ege_number"` // 9, 10, 11...
	Count     int          `json:"count"`
	Answers   []TaskAnswer `json:"answers"`
}

type CheckedPractice struct {
	TaskId      int    `json:"task_id"`
	UserAnswer  string `json:"user_answer"`
	RightAnswer string `json:"right_answer"`
	IsCorrect   bool   `json:"is_correct"`
	Comment     string `json:"comment,omitempty"`
	Hint        string `json:"hint,omitempty"`
}

type PracticeResult struct {
	AttemptId int               `json:"attempt_id"`
	Results   []CheckedPractice `json:"results"`
	Stats     struct {
		Total     int `json:"total"`
		Correct   int `json:"correct"`
		Incorrect int `json:"incorrect"`
		Percent   int `json:"percent"`
	} `json:"stats"`
}
