package cache

import (
	"sync"
	"time"
)

// TTL is a simple in-memory cache with TTL per key.
type TTL struct {
	mu    sync.RWMutex
	items map[string]item
	ttl   time.Duration
}

type item struct {
	value  any
	expiry time.Time
}

// NewTTL creates a cache with the given TTL.
func NewTTL(ttl time.Duration) *TTL {
	c := &TTL{items: make(map[string]item), ttl: ttl}
	go c.cleanup()
	return c
}

func (c *TTL) cleanup() {
	ticker := time.NewTicker(c.ttl)
	defer ticker.Stop()
	for range ticker.C {
		c.mu.Lock()
		now := time.Now()
		for k, v := range c.items {
			if v.expiry.Before(now) {
				delete(c.items, k)
			}
		}
		c.mu.Unlock()
	}
}

// Get returns the cached value and true if found and not expired.
func (c *TTL) Get(key string) (any, bool) {
	c.mu.RLock()
	v, ok := c.items[key]
	c.mu.RUnlock()
	if !ok || v.expiry.Before(time.Now()) {
		return nil, false
	}
	return v.value, true
}

// Set stores a value with TTL from now.
func (c *TTL) Set(key string, value any) {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.items[key] = item{value: value, expiry: time.Now().Add(c.ttl)}
}
