package logger

import (
	"os"

	"github.com/sirupsen/logrus"
)

// вынес логгер в отдельный пакет для единых настроек
var Log = logrus.New()

func init() {
	Log.SetOutput(os.Stdout)
	Log.SetLevel(logrus.InfoLevel)
	Log.SetFormatter(&logrus.TextFormatter{
		EnvironmentOverrideColors: true,
		ForceColors:               true,
		FullTimestamp:             true,
	})
}
