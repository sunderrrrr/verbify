package repository

import (
	"WhyAi/internal/domain"
	"database/sql"
	"errors"
	"fmt"
	"strings"

	"github.com/jmoiron/sqlx"
)

type AnalyticsRepository struct {
	db *sqlx.DB
}

func NewAnalyticsRepository(db *sqlx.DB) *AnalyticsRepository {
	return &AnalyticsRepository{db: db}
}

func (r *AnalyticsRepository) UpdateMetrics(userId, lastRate int, problem string) error {
	var exists bool
	query := `SELECT EXISTS (SELECT 1 FROM stats_raw WHERE user_id = $1)`
	if err := r.db.Get(&exists, query, userId); err != nil {
		return err
	}
	if !exists {
		query = `INSERT INTO stats_raw (user_id, essay_avg_rate, problematic_themes) VALUES ($1, $2, $3)`
		_, err := r.db.Exec(query, userId,
			fmt.Sprintf("{%d}", lastRate),
			fmt.Sprintf("{%s}", problem))
		return err
	} else {
		query = `UPDATE stats_raw 
			SET essay_avg_rate = array_append(
				CASE WHEN array_length(essay_avg_rate, 1) >= 4 
					THEN essay_avg_rate[2:4] 
					ELSE essay_avg_rate 
				END, $1::float),
				problematic_themes = array_append(
				CASE WHEN array_length(problematic_themes, 1) >= 4 
					THEN problematic_themes[2:4] 
					ELSE problematic_themes 
				END, $2),
				updated_at = CURRENT_TIMESTAMP
			WHERE user_id = $3`
		_, err := r.db.Exec(query, lastRate, problem, userId)
		return err
	}
}

func (r *AnalyticsRepository) GetMetricsInfo(userId int) (*domain.StatsRaw, error) {
	var exists bool
	query := `SELECT EXISTS (SELECT 1 FROM stats_raw WHERE user_id = $1)`
	if err := r.db.Get(&exists, query, userId); err != nil {
		return nil, err
	}

	if !exists {
		return nil, errors.New("stats not found")
	}

	type rawStats struct {
		Id            int            `db:"id"`
		UserId        int            `db:"user_id"`
		EssayRatesRaw sql.NullString `db:"essay_avg_rate"`
		ThemesRaw     sql.NullString `db:"problematic_themes"`
		Theme1        int            `db:"theme1"`
		Theme2        int            `db:"theme2"`
		Theme3        int            `db:"theme3"`
		Theme4        int            `db:"theme4"`
		CreatedAt     sql.NullTime   `db:"created_at"`
		UpdatedAt     sql.NullTime   `db:"updated_at"`
	}

	var raw rawStats
	query = `SELECT id, user_id, essay_avg_rate, problematic_themes, 
					theme1, theme2, theme3, theme4, created_at, updated_at 
			 FROM stats_raw WHERE user_id = $1`
	if err := r.db.Get(&raw, query, userId); err != nil {
		return nil, err
	}

	essayRates := parseFloatArray(raw.EssayRatesRaw)
	problematicThemes := parseStringArray(raw.ThemesRaw)

	var essayRatesArray [4]float64
	for i := 0; i < 4 && i < len(essayRates); i++ {
		essayRatesArray[i] = essayRates[i]
	}
	return &domain.StatsRaw{
		Id:                raw.Id,
		UserId:            raw.UserId,
		EssayRates:        essayRatesArray,
		ProblematicThemes: problematicThemes,
		Theme1:            raw.Theme1,
		Theme2:            raw.Theme2,
		Theme3:            raw.Theme3,
		Theme4:            raw.Theme4,
	}, nil
}

func parseFloatArray(nullStr sql.NullString) []float64 {
	if !nullStr.Valid || nullStr.String == "{}" {
		return []float64{}
	}

	cleaned := strings.Trim(nullStr.String, "{}")
	if cleaned == "" {
		return []float64{}
	}

	parts := strings.Split(cleaned, ",")
	result := make([]float64, 0, len(parts))

	for _, part := range parts {
		var value float64
		if _, err := fmt.Sscanf(part, "%f", &value); err == nil {
			result = append(result, value)
		}
	}

	return result
}

func parseStringArray(nullStr sql.NullString) []string {
	if !nullStr.Valid || nullStr.String == "{}" {
		return []string{}
	}

	cleaned := strings.Trim(nullStr.String, "{}")
	if cleaned == "" {
		return []string{}
	}

	parts := strings.Split(cleaned, ",")
	result := make([]string, 0, len(parts))

	for _, part := range parts {
		cleanedPart := strings.Trim(part, `"`)
		if cleanedPart != "" {
			result = append(result, cleanedPart)
		}
	}

	return result
}
