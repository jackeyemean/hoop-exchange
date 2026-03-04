# Frontend Structure

The frontend is a **Next.js** app that provides the NBA Exchange UI: player discovery, trading, portfolio, indexes, and leaderboard. It uses TanStack Query for data fetching and a WebSocket client for real-time price updates.

---

## Directory Layout

```
web/
├── app/
│   ├── layout.tsx              # Root layout (providers, navbar)
│   ├── page.tsx                # Discover (home)
│   ├── globals.css
│   ├── login/page.tsx
│   ├── register/page.tsx
│   ├── players/[id]/page.tsx    # Player detail
│   ├── portfolio/page.tsx
│   ├── indexes/page.tsx
│   ├── indexes/[id]/page.tsx   # Index detail
│   └── leaderboard/page.tsx
├── components/
│   ├── auth-provider.tsx        # Auth state, login/logout
│   ├── query-provider.tsx       # TanStack Query setup
│   ├── theme-provider.tsx       # Light/dark theme
│   ├── navbar.tsx
│   ├── player-table.tsx        # Player list with tier badges
│   ├── trade-panel.tsx         # Buy/sell form
│   ├── price-chart.tsx         # Recharts area chart
│   └── price-badge.tsx         # Price + change %
├── lib/
│   ├── api.ts                  # REST API client
│   ├── ws.ts                   # WebSocket client
│   └── utils.ts                # formatCurrency, formatPct, pctColor
├── types/index.ts
├── package.json
└── next.config.ts
```

---

## Pages

| Route | Purpose |
|-------|---------|
| `/` | **Discover** – Browse players, top gainers/losers, search, sort by mcap/price/change |
| `/login` | Login form |
| `/register` | Registration form |
| `/players/[id]` | Player detail, price chart, trade panel |
| `/portfolio` | Positions, cash, orders, trades |
| `/indexes` | Index list |
| `/indexes/[id]` | Index detail, level chart, constituents |
| `/leaderboard` | Rankings by total value |

---

## Components

| Component | Purpose |
|-----------|---------|
| **AuthProvider** | Auth state (token, username), login/logout, wraps app |
| **QueryProvider** | TanStack Query (30s stale, 1 retry) |
| **ThemeProvider** | Light/dark mode |
| **Navbar** | Nav links, theme toggle, auth status |
| **PlayerTable** | Player list with tier badges, price, change |
| **TradePanel** | Buy/sell form, quantity, side |
| **PriceChart** | Recharts area chart for price history |
| **PriceBadge** | Price + change % display |

---

## State Management

| Mechanism | Purpose |
|-----------|---------|
| **TanStack Query** | API cache, `players`, `portfolio`, `indexes`, `leaderboard` |
| **AuthProvider** | Token in localStorage, username in context |
| **WebSocket** | `priceSocket` in `lib/ws.ts` for `prices` and `indexes` channels |

---

## API Client (`lib/api.ts`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `register` | POST /api/auth/register | Create account |
| `login` | POST /api/auth/login | Login |
| `getPlayers` | GET /api/players | List players |
| `getPlayer` | GET /api/players/:id | Player + prices (range: all/season/month/week/day) |
| `placeOrder` | POST /api/orders | Place buy/sell order |
| `getPortfolio` | GET /api/portfolio | Portfolio |
| `getOrders` | GET /api/orders | Order history |
| `getTrades` | GET /api/trades | Trade history |
| `getIndexes` | GET /api/indexes | Index list |
| `getIndex` | GET /api/indexes/:id | Index + constituents + history |
| `getLeaderboard` | GET /api/leaderboard | Leaderboard |

---

## WebSocket Client (`lib/ws.ts`)

- **PriceSocket** – Connects to `NEXT_PUBLIC_WS_URL` (default ws://localhost:8081/ws)
- **subscribe(channel, handler)** – Subscribe to `prices` or `indexes`
- **Message format** – `{ channel, data }` (parsed from server)
- **Reconnect** – Exponential backoff (1s → 30s max)

---

## Environment

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | REST API base URL (default http://localhost:8080) |
| `NEXT_PUBLIC_WS_URL` | WebSocket URL (default ws://localhost:8081/ws) |

---

## Suggested Modularization

For future scaling and readability:

1. **`components/ui/`** – Reusable UI primitives (Button, Input, Card)
2. **`components/features/`** – Feature-specific components (Discover, Portfolio, Trading)
3. **`hooks/`** – Custom hooks (useAuth, usePlayers, useWebSocket)
4. **`lib/api/`** – Split API client by domain (auth, players, trading, indexes)
5. **`types/`** – Shared TypeScript types matching backend models
6. **`constants/`** – Tier labels, routes, config
