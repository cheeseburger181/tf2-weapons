package logrus

import (
	"log"
	"time"
)

type Logger struct {
}

func New() *Logger {
	return &Logger{}
}

func (l *Logger) Inf(format string, params ...any) {
	log.Printf("INFO: "+time.Now().String()+" "+format, params)
}

func (l *Logger) Wrn(format string, params ...any) {
	log.Printf("WARN: "+time.Now().String()+" "+format, params)
}

func (l *Logger) Err(format string, params ...any) {
	log.Printf("ERRR: "+time.Now().String()+" "+format, params)
}
