package steam

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strconv"

	"egor/internal/domain"
)

type Steam struct{}

const TFGameId = "440"
const InventoryItems = "2"

func (s *Steam) GetItems(profileId, inventory, gameId string) (*domain.Item, error) {
	url := fmt.Sprintf("https://steamcommunity.com/inventory/%s/%s/%s?l=russian&count=5000",
		profileId, gameId, inventory,
	)

	resp, err := http.Get(url)
	if err != nil {
		panic(err)
	}

	code := resp.StatusCode
	if code != http.StatusOK {
		return nil, fmt.Errorf(strconv.Itoa(code))
	}

	data, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	res := domain.Item{}
	err = json.Unmarshal(data, &res)
	if err != nil {
		return nil, err
	}

	return &res, nil
}
