package rinfo

import (
	"net/http"

	"egor/internal/middleware/logger"
)

func RequestInfo(next http.HandlerFunc) http.HandlerFunc {
	return func(writer http.ResponseWriter, request *http.Request) {
		l := logger.Get(request.Context())
		l.Inf("got %s request from %s to %s", request.Method, request.Host, request.RequestURI)
		next.ServeHTTP(writer, request)
	}
}
