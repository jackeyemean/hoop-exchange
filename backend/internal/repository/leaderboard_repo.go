package repository

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/jacky/nba-exchange/backend/internal/model"
)

type LeaderboardRepository struct {
	Pool *pgxpool.Pool
}

func NewLeaderboardRepository(pool *pgxpool.Pool) *LeaderboardRepository {
	return &LeaderboardRepository{Pool: pool}
}

func (r *LeaderboardRepository) GetByDate(ctx context.Context, date time.Time, limit int) ([]model.LeaderboardSnapshot, error) {
	rows, err := r.Pool.Query(ctx,
		`SELECT ls.id, ls.user_id, ls.snapshot_date, ls.portfolio_value, ls.cash_balance,
		        ls.total_value, ls.rank, ls.created_at, u.username
		 FROM leaderboard_snapshots ls
		 JOIN users u ON u.id = ls.user_id
		 WHERE ls.snapshot_date = $1
		 ORDER BY ls.rank ASC NULLS LAST
		 LIMIT $2`,
		date, limit,
	)
	if err != nil {
		return nil, fmt.Errorf("get leaderboard: %w", err)
	}
	defer rows.Close()

	var results []model.LeaderboardSnapshot
	for rows.Next() {
		var s model.LeaderboardSnapshot
		err := rows.Scan(&s.ID, &s.UserID, &s.SnapshotDate, &s.PortfolioValue,
			&s.CashBalance, &s.TotalValue, &s.Rank, &s.CreatedAt, &s.Username)
		if err != nil {
			return nil, fmt.Errorf("scan leaderboard: %w", err)
		}
		results = append(results, s)
	}
	return results, rows.Err()
}

// GetLive computes leaderboard from current positions and wallets (no snapshots needed)
func (r *LeaderboardRepository) GetLive(ctx context.Context, limit int) ([]model.LeaderboardSnapshot, error) {
	rows, err := r.Pool.Query(ctx,
		`WITH pos_values AS (
		     SELECT pos.user_id,
		            pos.quantity * COALESCE(ph.price, 0) as value
		     FROM positions pos
		     LEFT JOIN LATERAL (
		         SELECT price FROM price_history
		         WHERE player_season_id = pos.player_season_id
		         ORDER BY trade_date DESC LIMIT 1
		     ) ph ON true
		     WHERE pos.quantity > 0
		 ),
		 user_totals AS (
		     SELECT w.user_id, w.balance as cash_balance,
		            COALESCE(SUM(pv.value), 0) as portfolio_value
		     FROM wallets w
		     LEFT JOIN pos_values pv ON pv.user_id = w.user_id
		     GROUP BY w.user_id, w.balance
		 )
		 SELECT u.id, u.username, ut.cash_balance, ut.portfolio_value,
		        ut.cash_balance + ut.portfolio_value as total_value
		 FROM users u
		 JOIN user_totals ut ON ut.user_id = u.id
		 ORDER BY ut.cash_balance + ut.portfolio_value DESC
		 LIMIT $1`,
		limit,
	)
	if err != nil {
		return nil, fmt.Errorf("get live leaderboard: %w", err)
	}
	defer rows.Close()

	var results []model.LeaderboardSnapshot
	rank := 1
	for rows.Next() {
		var s model.LeaderboardSnapshot
		var userID uuid.UUID
		err := rows.Scan(&userID, &s.Username, &s.CashBalance, &s.PortfolioValue, &s.TotalValue)
		if err != nil {
			return nil, fmt.Errorf("scan live leaderboard: %w", err)
		}
		s.UserID = userID
		r := rank
		s.Rank = &r
		rank++
		results = append(results, s)
	}
	return results, rows.Err()
}
