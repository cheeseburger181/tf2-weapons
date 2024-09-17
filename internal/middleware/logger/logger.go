package logger

import (
	"context"
	"net/http"

	"egor/internal/logger"
)

type contextKey struct{}

func Logger(logger logger.Logger, next http.HandlerFunc) http.HandlerFunc {
	return func(writer http.ResponseWriter, request *http.Request) {
		request = request.WithContext(set(request.Context(), logger))
		next(writer, request)
	}
}

func set(ctx context.Context, l logger.Logger) context.Context {
	return context.WithValue(ctx, contextKey{}, l)
}

func Get(ctx context.Context) logger.Logger {
	val := ctx.Value(contextKey{})
	l, ok := val.(logger.Logger)
	if !ok {
		panic("missing logger in context")
	}
	return l
}
