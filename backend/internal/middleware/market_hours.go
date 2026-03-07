package middleware

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

// MarketOpen enforces trading hours: weekdays 6am-6pm ET, weekends 6am-1pm ET.
func MarketOpen(timezone string, openHour, openMin, closeHour, closeMin, closeHourWeekend int) gin.HandlerFunc {
	loc, err := time.LoadLocation(timezone)
	if err != nil {
		panic("invalid market timezone: " + err.Error())
	}

	return func(c *gin.Context) {
		now := time.Now().In(loc)

		open := time.Date(now.Year(), now.Month(), now.Day(), openHour, openMin, 0, 0, loc)
		closeHourToday := closeHour
		if now.Weekday() == time.Saturday || now.Weekday() == time.Sunday {
			closeHourToday = closeHourWeekend
		}
		close := time.Date(now.Year(), now.Month(), now.Day(), closeHourToday, closeMin, 0, 0, loc)

		if now.Before(open) || now.After(close) {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "Market is closed"})
			return
		}

		c.Next()
	}
}
