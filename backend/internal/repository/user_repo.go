package repository

import (
	"context"
	"errors"
	"fmt"
	"strconv"
	"strings"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/jacky/hoop-exchange/backend/internal/model"
)

type UserRepository struct {
	Pool *pgxpool.Pool
}

func NewUserRepository(pool *pgxpool.Pool) *UserRepository {
	return &UserRepository{Pool: pool}
}

func (r *UserRepository) Create(ctx context.Context, email, username, passwordHash string) (*model.User, error) {
	user := &model.User{}
	err := r.Pool.QueryRow(ctx,
		`INSERT INTO users (email, username, password_hash)
		 VALUES ($1, $2, $3)
		 RETURNING id, email, username, password_hash, created_at`,
		email, username, passwordHash,
	).Scan(&user.ID, &user.Email, &user.Username, &user.PasswordHash, &user.CreatedAt)
	if err != nil {
		return nil, fmt.Errorf("create user: %w", err)
	}
	return user, nil
}

func (r *UserRepository) GetByEmail(ctx context.Context, email string) (*model.User, error) {
	user := &model.User{}
	err := r.Pool.QueryRow(ctx,
		`SELECT id, email, username, COALESCE(password_hash, ''), created_at
		 FROM users WHERE email = $1`,
		email,
	).Scan(&user.ID, &user.Email, &user.Username, &user.PasswordHash, &user.CreatedAt)
	if err != nil {
		return nil, fmt.Errorf("get user by email: %w", err)
	}
	return user, nil
}

func (r *UserRepository) GetByID(ctx context.Context, id uuid.UUID) (*model.User, error) {
	user := &model.User{}
	err := r.Pool.QueryRow(ctx,
		`SELECT id, email, username, COALESCE(password_hash, ''), created_at
		 FROM users WHERE id = $1`,
		id,
	).Scan(&user.ID, &user.Email, &user.Username, &user.PasswordHash, &user.CreatedAt)
	if err != nil {
		return nil, fmt.Errorf("get user by id: %w", err)
	}
	return user, nil
}

// CreateOAuth creates a user from OAuth (Google) - no password.
// Assigns default username "userN" using a sequence (unique, no duplicates).
func (r *UserRepository) CreateOAuth(ctx context.Context, id uuid.UUID, email string) error {
	for i := 0; i < 10; i++ {
		var n int64
		err := r.Pool.QueryRow(ctx, `SELECT nextval('user_username_seq')`).Scan(&n)
		if err != nil {
			return fmt.Errorf("create oauth user: %w", err)
		}
		username := "user" + strconv.FormatInt(n, 10)

		_, err = r.Pool.Exec(ctx,
			`INSERT INTO users (id, email, username, password_hash)
			 VALUES ($1, $2, $3, NULL)
			 ON CONFLICT (id) DO NOTHING`,
			id, email, username,
		)
		if err != nil {
			if isUniqueViolation(err) {
				continue // username taken (legacy user), retry with next number
			}
			return fmt.Errorf("create oauth user: %w", err)
		}
		return nil
	}
	return fmt.Errorf("create oauth user: could not assign unique username")
}

func isUniqueViolation(err error) bool {
	var pgErr *pgconn.PgError
	if errors.As(err, &pgErr) {
		return pgErr.Code == "23505" // unique_violation
	}
	return false
}

// UpdateUsername updates the user's display username.
func (r *UserRepository) UpdateUsername(ctx context.Context, userID uuid.UUID, username string) error {
	username = strings.TrimSpace(username)
	_, err := r.Pool.Exec(ctx,
		`UPDATE users SET username = $1 WHERE id = $2`,
		username, userID,
	)
	if err != nil {
		if isUniqueViolation(err) {
			return fmt.Errorf("username is already taken")
		}
		return fmt.Errorf("update username: %w", err)
	}
	return nil
}
