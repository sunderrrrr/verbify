package domain

type EssayTheme struct {
	Id    int    `json:"id"`
	Theme string `json:"theme"`
	Text  string `json:"text"`
}

type EssayRequest struct {
	Theme string `json:"theme" binding:"required"`
	Text  string `json:"text" binding:"required"`
	Essay string `json:"essay" binding:"required"`
}
type EssayTempResponse struct {
	Score          [10]int `json:"score" binding:"required"`
	Feedback       string  `json:"feedback" binding:"required"`
	Recommendation string  `json:"recommendation" binding:"required"`
	Problems       string  `json:"problems" binding:"required"`
}
type EssayResponse struct {
	Score          int    `json:"score"`
	Feedback       string `json:"feedback"`
	Recommendation string `json:"recommendation"`
}

type EssayScanResponse struct {
	Response string `json:"response"`
}
