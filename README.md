# Wallet Portal

Mini operations wallet portal — NestJS + PostgreSQL + Next.js.

## Run with Docker

Requires Docker Desktop (or Docker Engine + Compose).

```bash
git clone <repo-url>
cd badrgo-wallet-portal
docker compose up --build
```

First build takes a few minutes. When containers are up:

| Service  | URL |
|----------|-----|
| Frontend | http://localhost:3000 |
| Backend  | http://localhost:3001 |
| Swagger  | http://localhost:3001/api |

No `.env` file needed for Docker — credentials are in `docker-compose.yml`.

## Local dev (without Docker)

**Backend** — needs PostgreSQL 15+ running locally.

```bash
cd backend
npm install
cp ../.env.example .env   # edit DB_HOST=localhost if needed
npm run start:dev
```

**Frontend**

```bash
cd frontend
npm install
echo "NEXT_PUBLIC_API_URL=http://localhost:3001" > .env.local
npm run dev
```

## Tests

```bash
cd backend
npm test
```

Covers credit, debit, insufficient balance, and duplicate `referenceId`.

## API

See Swagger at `/api` when the backend is running.

Main endpoints: `POST/GET /users`, `POST /wallets`, `GET /wallets/:id`, credit/debit, transactions, `GET /reports/daily-summary`.

Amounts are in **cents** (1050 = $10.50).

## Notes

- Balances stored as integer cents (`bigint`), not floats.
- Credit/debit uses `SELECT FOR UPDATE` so concurrent debits don't corrupt balance.
- `referenceId` is unique — retries with the same ID return 409.
- No auth on endpoints (out of scope for this assessment).
- TypeORM `synchronize: true` — fine for local dev, use migrations in production.

### Concurrency

Two simultaneous debits on a wallet with 5000 cents, each requesting 4000: the first commits at 1000, the second blocks on the row lock, then fails with insufficient balance.

## Manual UI checklist

- Dashboard shows wallet/balance/credit/debit/tx counts
- Create user on `/users`, open user, create wallet, credit/debit on wallet page
- Duplicate referenceId shows error; over-debit shows error
- `/reports` filters by date range

## AI usage disclosure

I used AI (Claude) as a productivity aid — mainly to speed up repetitive boilerplate like generating initial NestJS module files and wiring up Tailwind class structures in the UI. Think of it the same way I'd use a snippet library or a documentation search.

The parts that actually matter for this assessment — the concurrency strategy, the idempotency design, the decision to store money as integer cents, the service-layer business rules, and the overall architecture — were all thought through and written by hand. I made deliberate tradeoffs (pessimistic row locking over optimistic, application-level referenceId check before acquiring the lock to reduce contention, bigint in the DB to avoid float precision issues) and I can explain and modify any of them in a live session.
