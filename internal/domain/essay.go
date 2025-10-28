package domain

type EssayTheme struct {
	Id    int    `json:"id"`
	Theme string `json:"theme"`
	Text  string `json:"text"`
}

type EssayRequest struct {
	Theme string `json:"theme"`
	Text  string `json:"text"`
	Essay string `json:"essay"`
}
type EssayTempResponse struct {
	Score          [10]int `json:"score"`
	Feedback       string  `json:"feedback"`
	Recommendation string  `json:"recommendation"`
}
type EssayResponse struct {
	Score          int    `json:"score"`
	Feedback       string `json:"feedback"`
	Recommendation string `json:"recommendation"`
}

type EssayScanResponse struct {
	Response string `json:"response"`
}
