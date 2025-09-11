package redis

import (
	"WhyAi/internal/config"
	"context"
	"time"

	"github.com/redis/go-redis/v9"
)

type Client struct {
	cli *redis.Client
}

func NewClient(cfg *config.Config) *Client {
	return &Client{
		cli: redis.NewClient(&redis.Options{
			Addr:     cfg.Redis.Host + ":" + cfg.Redis.Port,
			Password: cfg.Redis.Password,
			DB:       0,
		}),
	}
}

func (c *Client) Incr(ctx context.Context, key string) (int64, error) {
	return c.cli.Incr(ctx, key).Result()
}

func (c *Client) Get(ctx context.Context, key string) (string, error) {
	return c.cli.Get(ctx, key).Result()
}

func (c *Client) Set(ctx context.Context, key string, value interface{}, ttl time.Duration) error {
	return c.cli.Set(ctx, key, value, ttl).Err()
}

func (c *Client) TTL(ctx context.Context, key string) (time.Duration, error) {
	return c.cli.TTL(ctx, key).Result()
}

func (c *Client) Expire(ctx context.Context, key string, ttl time.Duration) (bool, error) {
	return c.cli.Expire(ctx, key, ttl).Result()
}

func (c *Client) Del(ctx context.Context, keys ...string) (int64, error) {
	return c.cli.Del(ctx, keys...).Result()
}

func (c *Client) Ping(ctx context.Context) error {
	return c.cli.Ping(ctx).Err()
}
