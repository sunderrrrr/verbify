package domain

import (
	"time"
)

type StatsRaw struct {
	Id                int        `json:"id" db:"id"`
	UserId            int        `json:"user_id" db:"user_id"`
	EssayRates        [4]float64 `json:"essay_avg_rate" db:"essay_avg_rate"`
	ProblematicThemes []string   `json:"problematic_themes" db:"problematic_themes"`
	Theme1            int        `json:"theme1" db:"theme1"`
	Theme2            int        `json:"theme2" db:"theme2"`
	Theme3            int        `json:"theme3" db:"theme3"`
	Theme4            int        `json:"theme4" db:"theme4"`
	CreatedAt         time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt         time.Time  `json:"updated_at" db:"updated_at"`
}

type StatsAnalysisResponse struct {
	Id                  int     `json:"id" binding:"required"`
	UserId              int     `json:"user_id" binding:"required"`
	EssayAvgRates       float64 `json:"essay_avg_rate" binding:"required"`
	ProblematicAnalysis string  `json:"problematic_themes" binding:"required"`
	MostClickableTheme  int     `json:"most_clickable_theme" binding:"required"`
}
