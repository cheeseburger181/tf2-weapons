package main

import (
	"egor/internal/controller"
	logrus2 "egor/pkg/logrus"
)

func main() {
	err := run()
	if err != nil {
		panic(err)
	}
}

func run() error {
	l := logrus2.New()

	c := controller.New(l)
	return c.Start(":8080")
}
