package domain

type Fact struct {
	Fact string `json:"fact"`
}

type FactArr struct {
	Facts []Fact `json:"facts"`
}
