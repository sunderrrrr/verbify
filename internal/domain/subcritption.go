package domain

type SubLevel int

const (
	SubUltra SubLevel = iota
	SubPremium
	SubBasic
)

type FeatureLimit struct {
	MaxPerDay int //-1 - неограничено
	Available bool
}

type Subscription struct {
	Level SubLevel
	Name  string
	Price float64
}
