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

Used Claude/Cursor for NestJS module scaffolding and some Tailwind layout. Concurrency locking, idempotency design, cents-based money handling, and service-layer business rules were written and reviewed manually.
