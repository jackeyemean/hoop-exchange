package config

import (
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type Config struct {
	DatabaseURL       string
	APIPort           string
	WSPort            string
	SupabaseJWTSecret string // Legacy HS256 secret (optional if using JWKS)
	SupabaseURL       string // e.g. https://xxx.supabase.co - for JWKS (RS256) verification

	MarketOpenHour         int
	MarketOpenMinute       int
	MarketCloseHour        int
	MarketCloseMinute      int
	MarketCloseHourWeekend int // 1pm on Sat/Sun
	MarketTimezone         string

	StartingBalance float64
	ScalingFactor   float64
}

func Load() (*Config, error) {
	_ = godotenv.Load("../.env")

	cfg := &Config{
		DatabaseURL: envOrDefault("DATABASE_URL", "postgres://nbaexchange:nbaexchange@localhost:5432/nbaexchange?sslmode=disable"),
		APIPort:     envOrDefault("API_PORT", "8080"),
		WSPort:         envOrDefault("WS_PORT", "8081"),
		SupabaseJWTSecret: envOrDefault("SUPABASE_JWT_SECRET", ""),
		SupabaseURL:       envOrDefault("SUPABASE_URL", ""),
		MarketTimezone: envOrDefault("MARKET_TIMEZONE", "America/New_York"),
	}

	var err error
	cfg.MarketOpenHour, err = envIntOrDefault("MARKET_OPEN_HOUR", 6)
	if err != nil {
		return nil, err
	}
	cfg.MarketOpenMinute, err = envIntOrDefault("MARKET_OPEN_MINUTE", 0)
	if err != nil {
		return nil, err
	}
	cfg.MarketCloseHour, err = envIntOrDefault("MARKET_CLOSE_HOUR", 18)
	if err != nil {
		return nil, err
	}
	cfg.MarketCloseMinute, err = envIntOrDefault("MARKET_CLOSE_MINUTE", 0)
	if err != nil {
		return nil, err
	}
	cfg.MarketCloseHourWeekend, err = envIntOrDefault("MARKET_CLOSE_HOUR_WEEKEND", 13)
	if err != nil {
		return nil, err
	}
	cfg.StartingBalance, err = envFloatOrDefault("STARTING_BALANCE", 100000.00)
	if err != nil {
		return nil, err
	}
	cfg.ScalingFactor, err = envFloatOrDefault("SCALING_FACTOR", 2.08)
	if err != nil {
		return nil, err
	}

	return cfg, nil
}

func envOrDefault(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func envIntOrDefault(key string, fallback int) (int, error) {
	v := os.Getenv(key)
	if v == "" {
		return fallback, nil
	}
	return strconv.Atoi(v)
}

func envFloatOrDefault(key string, fallback float64) (float64, error) {
	v := os.Getenv(key)
	if v == "" {
		return fallback, nil
	}
	return strconv.ParseFloat(v, 64)
}
