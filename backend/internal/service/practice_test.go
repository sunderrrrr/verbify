package service

import (
	"WhyAi/internal/domain"
	"WhyAi/internal/repository"
	"fmt"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestPracticeService_CheckPractice(t *testing.T) {
	type fields struct {
		llm       LLM
		analytics Analytics
		repo      repository.Practice
	}
	type args struct {
		userId   int
		practice domain.PracticeRequest
	}
	tests := []struct {
		name    string
		fields  fields
		args    args
		want    domain.PracticeResult
		wantErr assert.ErrorAssertionFunc
	}{
		// TODO: Add test cases.
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			s := &PracticeService{
				llm:       tt.fields.llm,
				analytics: tt.fields.analytics,
				repo:      tt.fields.repo,
			}
			got, err := s.CheckPractice(tt.args.userId, tt.args.practice)
			if !tt.wantErr(t, err, fmt.Sprintf("CheckPractice(%v, %v)", tt.args.userId, tt.args.practice)) {
				return
			}
			assert.Equalf(t, tt.want, got, "CheckPractice(%v, %v)", tt.args.userId, tt.args.practice)
		})
	}
}
