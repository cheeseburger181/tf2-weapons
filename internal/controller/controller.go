package controller

import (
	"net/http"

	"egor/internal/handlers"
	"egor/internal/logger"
	log "egor/internal/middleware/logger"
	"egor/internal/middleware/rinfo"
)

type Controller struct {
	l logger.Logger
}

func New(l logger.Logger) *Controller {
	return &Controller{
		l: l,
	}
}

func (c *Controller) Start(addr string) error {
	http.HandleFunc("/", log.Logger(c.l, rinfo.RequestInfo(http.FileServer(http.Dir("static")).ServeHTTP)))
	http.HandleFunc("/items", log.Logger(c.l, rinfo.RequestInfo(handlers.Items)))
	http.HandleFunc("/list", log.Logger(c.l, rinfo.RequestInfo(handlers.List)))

	return http.ListenAndServe(addr, nil)
}
