package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jacky/hoop-exchange/backend/internal/repository"
)

type MarketHandler struct {
	Players *repository.PlayerRepository
}

func NewMarketHandler(players *repository.PlayerRepository) *MarketHandler {
	return &MarketHandler{Players: players}
}

func (h *MarketHandler) GetStatus(c *gin.Context) {
	status, err := h.Players.GetCurrentSeasonStatus(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch market status"})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"isOffSeason": status.IsOffSeason,
		"seasonLabel": status.Label,
		"seasonEnd":   status.EndDate,
	})
}
