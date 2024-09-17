package files

import (
	"bytes"
	"egor/internal/domain"
	"encoding/json"
	"io"
	"os"
)

func Save(item domain.Item, name string) error {
	f, err := os.Create("storage/" + name + ".json")
	if err != nil {
		return err
	}
	defer f.Close()

	i, _ := json.Marshal(item)
	b := bytes.NewBuffer(i)
	_, err = io.Copy(f, b)
	if err != nil {
		return err
	}

	return nil
}

func Load(name string) (*domain.Item, error) {
	f, err := os.Open("storage/" + name + ".json")
	if err != nil {
		panic(err)
	}
	defer f.Close()
	b, err := io.ReadAll(f)
	if err != nil {
		return nil, err
	}

	i := domain.Item{}
	err = json.Unmarshal(b, &i)
	if err != nil {
		return nil, err
	}

	return &i, nil
}
