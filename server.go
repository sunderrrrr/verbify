package WhyAi

import (
	"WhyAi/internal/config"
	"WhyAi/internal/handler"
	"context"
	"net/http"
	"time"
)

type Server struct {
	httpServer *http.Server
}

func (s *Server) Run(cfg *config.Config, handler *handler.Handler) error {
	s.httpServer = &http.Server{
		Addr:           ":" + cfg.Server.Port,
		Handler:        handler.InitRoutes(cfg),
		MaxHeaderBytes: 1 << 28,
		ReadTimeout:    180 * time.Second,
		WriteTimeout:   180 * time.Second,
	}
	return s.httpServer.ListenAndServe()
}

func (s *Server) Close(ctx context.Context) error {
	return s.httpServer.Shutdown(ctx)
}
