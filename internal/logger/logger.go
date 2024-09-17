package logger

type Logger interface {
	Inf(format string, params ...any)
	Wrn(format string, params ...any)
	Err(format string, params ...any)
}
