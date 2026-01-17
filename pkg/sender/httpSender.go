package sender

import (
	"net/http"
	"time"
)

// решил вынести клиент в отдельный пакет чтобы не создавать при каждом запросе новый объект
// так как запросы происходят довольно часто это позволит повысить скорость и сэкономит ресурсы
var Client = &http.Client{
	Transport: &http.Transport{
		IdleConnTimeout:     30 * time.Second,
		MaxIdleConnsPerHost: 2,
	},
	Timeout: 180 * time.Second,
}
