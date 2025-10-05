package sender

import (
	"net/http"
	"time"
)

var Client = &http.Client{
	Transport: &http.Transport{
		IdleConnTimeout:     30 * time.Second,
		MaxIdleConnsPerHost: 2,
	},
	Timeout: 20 * time.Second,
}
