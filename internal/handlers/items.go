package handlers

import (
	"encoding/json"
	"io"
	"net/http"

	"egor/internal/domain"
	"egor/internal/files"
	logger2 "egor/internal/logger"
	"egor/internal/middleware/logger"
	"egor/internal/steam"
)

type ItemsIn struct {
	SteamId string `json:"steamId"`
	Refresh bool   `json:"refresh"`
}

type ErrorOut struct {
	Error string `json:"error"`
}

func handleError(w http.ResponseWriter, l logger2.Logger, code int, err error) {
	l.Err(err.Error())
	b, _ := json.Marshal(ErrorOut{Error: err.Error()})
	w.Write(b)
}

func Items(w http.ResponseWriter, r *http.Request) {
	l := logger.Get(r.Context())
	b, err := io.ReadAll(r.Body)
	if err != nil {
		handleError(w, l, http.StatusInternalServerError, err)
		return
	}
	defer r.Body.Close()

	req := ItemsIn{}
	err = json.Unmarshal(b, &req)
	if err != nil {
		handleError(w, l, http.StatusInternalServerError, err)
		return
	}

	item := &domain.Item{}
	if req.Refresh {
		s := &steam.Steam{}
		item, err = s.GetItems(req.SteamId, steam.InventoryItems, steam.TFGameId)
		if err != nil {
			handleError(w, l, http.StatusInternalServerError, err)
			return
		}
		err = files.Save(*item, req.SteamId)
		if err != nil {
			handleError(w, l, http.StatusInternalServerError, err)
			return
		}
	} else {
		item, err = files.Load(req.SteamId)
		if err != nil {
			handleError(w, l, http.StatusInternalServerError, err)
			return
		}
	}

	by, err := json.Marshal(item)
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
