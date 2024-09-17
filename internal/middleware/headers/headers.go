package headers

import (
	"fmt"
	"net/http"
)

func Headers(next http.HandlerFunc) http.HandlerFunc {
	return func(writer http.ResponseWriter, request *http.Request) {
		writer.Header().Set("Content-Type", "application/json")
		err := validateHeaders(request.Header)
		if err != nil {
			writer.WriteHeader(http.StatusUnsupportedMediaType)
		}

		next(writer, request)
	}
}

var headersMap = map[string]string{
	"Content-Type": "application/json",
}

func validateHeaders(header http.Header) error {
	for key, val := range headersMap {
		h := header.Get(key)
		if h != val {
			return fmt.Errorf("header %s is invalid", key)
		}
	}

	return nil
}
