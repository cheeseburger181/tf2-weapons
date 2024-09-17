package handlers

import (
	"egor/internal/middleware/logger"
	"encoding/json"
	"net/http"
	"os"
	"path/filepath"
)

func listFilesInDirectory(directoryPath string) ([]string, error) {
	var files []string

	err := filepath.Walk(directoryPath, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		if !info.IsDir() {
			files = append(files, path)
		}
		return nil
	})

	return files, err
}

func List(w http.ResponseWriter, r *http.Request) {
	l := logger.Get(r.Context())

	list, err := listFilesInDirectory("storage")
	if err != nil {
		handleError(w, l, 500, err)
		return
	}

	by, err := json.Marshal(list)
	if err != nil {
		handleError(w, l, http.StatusInternalServerError, err)
		return
	}

	_, err = w.Write(by)
	if err != nil {
		handleError(w, l, http.StatusInternalServerError, err)
		return
	}
}
