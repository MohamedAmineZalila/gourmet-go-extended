# 🍽 Gourmet-Go — Distributed Order System

A production-like distributed system implementing the **Saga Orchestration Pattern** with gRPC microservices, PostgreSQL databases, Docker deployment, and GitHub Actions CI/CD.

## Architecture

```
[Browser UI] ──HTTP──► [Order-Orchestrator :8080]
                              │
              ┌───────────────┼───────────────┐
           gRPC            gRPC            gRPC
              ▼               ▼               ▼
    [Order-Service]  [Kitchen-Service]  [Accounting-Service]
       :50051             :50052             :50053
          │                  │                  │
       [order-db]        [kitchen-db]      [accounting-db]
       PostgreSQL         PostgreSQL         PostgreSQL
```

## Business Logic

### Happy Path (amount < $100)
1. User submits order via UI
2. Orchestrator sets order → **APPROVAL_PENDING**
3. Kitchen ticket created
4. Payment authorized ✅
5. Order → **APPROVED**

### Compensation Path (amount ≥ $100)
1. Steps 1–3 same as above
2. Payment rejected ❌
3. Kitchen ticket **rejected** (compensation)
4. Order → **REJECTED**

## Quick Start (Docker)

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/gourmet-go.git
cd gourmet-go

# 2. Set your Docker Hub username
cp .env.example .env
# Edit .env and set DOCKERHUB_USERNAME=your_username

# 3. Start everything
docker-compose up

# 4. Open the UI
open http://localhost
```

## CI/CD Setup

### GitHub Secrets Required

Go to your GitHub repo → **Settings → Secrets and variables → Actions** and add:

| Secret | Value |
|--------|-------|
| `DOCKERHUB_USERNAME` | Your Docker Hub username |
| `DOCKERHUB_TOKEN` | Your Docker Hub access token |

### Pipeline Stages
1. **Build** — Maven compiles all 4 services in parallel
2. **Package** — Fat JARs produced via maven-shade-plugin
3. **Docker Build** — Multi-stage Dockerfile builds each image
4. **Push** — Images pushed to Docker Hub with `latest` + commit SHA tags

## Services

| Service | Port | DB |
|---------|------|----|
| Order Service | 50051 (gRPC) | orderdb (PostgreSQL) |
| Kitchen Service | 50052 (gRPC) | kitchendb (PostgreSQL) |
| Accounting Service | 50053 (gRPC) | accountingdb (PostgreSQL) |
| Orchestrator | 8080 (HTTP REST) | — |
| UI | 80 (HTTP) | — |

## API

### Place Order
```
POST http://localhost:8080/api/orders
Content-Type: application/json

{"orderId": "order-001", "amount": 50}
```

### Check Order Status
```
GET http://localhost:8080/api/orders/order-001
```
