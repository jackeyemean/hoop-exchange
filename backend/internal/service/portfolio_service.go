package service

import (
	"context"
	"fmt"

	"github.com/google/uuid"

	"github.com/jacky/nba-exchange/backend/internal/repository"
)

type PortfolioPosition struct {
	PlayerSeasonID   int      `json:"playerSeasonId"`
	Quantity         int      `json:"quantity"`
	AvgCost          float64  `json:"avgCost"`
	CurrentPrice     float64  `json:"currentPrice"`
	MarketValue      float64  `json:"marketValue"`
	UnrealizedPnL    float64  `json:"unrealizedPnl"`
	UnrealizedPnLPct float64  `json:"unrealizedPnlPct"`
	Player           *struct {
		FirstName string `json:"firstName"`
		LastName  string `json:"lastName"`
	} `json:"player"`
}

type PortfolioSummary struct {
	Positions          []PortfolioPosition `json:"positions"`
	CashBalance        float64             `json:"cashBalance"`
	TotalPositionValue float64            `json:"totalPositionValue"`
	TotalValue         float64            `json:"totalValue"`
}

type PortfolioService struct {
	Positions *repository.PositionRepository
	Players   *repository.PlayerRepository
	Wallets   *repository.WalletRepository
}

func NewPortfolioService(positions *repository.PositionRepository, players *repository.PlayerRepository, wallets *repository.WalletRepository) *PortfolioService {
	return &PortfolioService{
		Positions: positions,
		Players:   players,
		Wallets:   wallets,
	}
}

func (s *PortfolioService) GetPortfolio(ctx context.Context, userID uuid.UUID) (*PortfolioSummary, error) {
	wallet, err := s.Wallets.GetByUserID(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("get wallet: %w", err)
	}

	positions, err := s.Positions.GetByUserID(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("get positions: %w", err)
	}

	var portfolioPositions []PortfolioPosition
	var portfolioValue float64

	for _, pos := range positions {
		ph, err := s.Players.GetLatestPrice(ctx, pos.PlayerSeasonID)
		if err != nil {
			continue
		}

		marketValue := ph.Price * float64(pos.Quantity)
		pnl := (ph.Price - pos.AvgCost) * float64(pos.Quantity)
		var pnlPct float64
		if pos.AvgCost > 0 {
			pnlPct = (ph.Price - pos.AvgCost) / pos.AvgCost
		}

		playerSeason, err := s.Players.GetPlayerSeasonByID(ctx, pos.PlayerSeasonID)
		if err != nil {
			continue
		}

		portfolioPositions = append(portfolioPositions, PortfolioPosition{
			PlayerSeasonID:   pos.PlayerSeasonID,
			Quantity:         pos.Quantity,
			AvgCost:          pos.AvgCost,
			CurrentPrice:     ph.Price,
			MarketValue:      marketValue,
			UnrealizedPnL:    pnl,
			UnrealizedPnLPct: pnlPct,
			Player: &struct {
				FirstName string `json:"firstName"`
				LastName  string `json:"lastName"`
			}{
				FirstName: playerSeason.Player.FirstName,
				LastName:  playerSeason.Player.LastName,
			},
		})
		portfolioValue += marketValue
	}

	return &PortfolioSummary{
		Positions:          portfolioPositions,
		CashBalance:        wallet.Balance,
		TotalPositionValue: portfolioValue,
		TotalValue:         wallet.Balance + portfolioValue,
	}, nil
}
