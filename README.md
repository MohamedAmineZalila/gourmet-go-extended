# 🍽 Gourmet-Go — Distributed Order System

A production-like distributed system implementing the **Saga Orchestration Pattern** with Java gRPC microservices, PostgreSQL databases, a React frontend, Dockerized deployment, and a GitHub Actions CI/CD pipeline.

---

## 📐 Architecture

```
[React UI :80] ──HTTP──► [Order-Orchestrator :8080]
                                    │
                ┌───────────────────┼───────────────────┐
             gRPC                gRPC                gRPC
                ▼                   ▼                   ▼
      [Order-Service]     [Kitchen-Service]   [Accounting-Service]
         :50051               :50052               :50053
            │                    │                    │
        [order-db]          [kitchen-db]        [accounting-db]
        PostgreSQL           PostgreSQL           PostgreSQL
```

---

## ⚙️ Business Logic

### ✅ Happy Path (amount < $100)

1. User submits order via UI
2. Orchestrator creates order → **APPROVAL_PENDING**
3. Kitchen ticket created
4. Payment authorized ✅
5. Order → **APPROVED**

### ❌ Compensation Path — Saga Rollback (amount ≥ $100)

1. Steps 1–3 same as above
2. Payment authorization fails ❌
3. Kitchen ticket **rejected** (compensation triggered)
4. Order → **REJECTED**

---

## 🚀 Extensions Implemented

| Extension             | Description                                                                 |
| --------------------- | --------------------------------------------------------------------------- |
| 📊 Live Dashboard     | Real-time stats with animated counters and bar chart                        |
| 📋 Order History      | Full paginated table with filters, search, and timestamps                   |
| 🚫 Order Cancellation | Cancel any pending or approved order directly from the UI                   |
| ⚛️ React Frontend     | Modern React UI built with Vite, Framer Motion animations, and Tailwind CSS |

---

## 🛠 Tech Stack

| Layer            | Technology                                     |
| ---------------- | ---------------------------------------------- |
| Language         | Java 17 + Maven                                |
| Communication    | gRPC / Protobuf                                |
| Persistence      | Hibernate 6 + PostgreSQL 15                    |
| Frontend         | React 18 + Vite + Tailwind CSS + Framer Motion |
| Containerization | Docker + Docker Compose                        |
| CI/CD            | GitHub Actions                                 |
| Image Registry   | Docker Hub                                     |
| Web Server       | Nginx (serves React build)                     |

---

## 🖥️ Services

| Service            | Port             | Database                  |
| ------------------ | ---------------- | ------------------------- |
| Order Service      | `50051` gRPC     | `orderdb` PostgreSQL      |
| Kitchen Service    | `50052` gRPC     | `kitchendb` PostgreSQL    |
| Accounting Service | `50053` gRPC     | `accountingdb` PostgreSQL |
| Orchestrator       | `8080` HTTP REST | —                         |
| React UI           | `80` HTTP        | —                         |

---

## ▶️ Quick Start

### Prerequisites

- Docker Desktop installed and running
- Docker Hub account

### Run the full stack

```bash
# 1. Clone the repo
git clone https://github.com/MohamedAmineZalila/gourmet-go-extended.git
cd gourmet-go

# 2. Create your .env file
echo "DOCKERHUB_USERNAME=aminezalila" > .env

# 3. Pull images from Docker Hub and start
docker-compose pull
docker-compose up

# 4. Open the UI
# http://localhost
```

> ⚠️ First run: use `docker-compose up` (not `docker-compose up -d`) so you can see the logs and confirm all services started correctly.

### Reset everything (wipe databases)

```bash
docker-compose down -v
docker-compose up
```

---

## 🔁 CI/CD Pipeline

### GitHub Secrets Required

Go to your repo → **Settings → Secrets and variables → Actions** → **New repository secret**

| Secret               | Value                                                 |
| -------------------- | ----------------------------------------------------- |
| `DOCKERHUB_USERNAME` | Your Docker Hub username                              |
| `DOCKERHUB_TOKEN`    | Docker Hub access token (Account Settings → Security) |

### Pipeline Stages

```
Push to main
    │
    ▼
┌─────────────────────────────────┐
│  Matrix: Build & Package        │
│  (runs in parallel)             │
│  • gourmet-order-service        │
│  • gourmet-kitchen-service      │
│  • gourmet-accounting-service   │
│  • gourmet-orchestrator         │
└────────────────┬────────────────┘
                 │ all pass
                 ▼
┌─────────────────────────────────┐
│  Docker Build & Push            │
│  • Build 5 images               │
│  • Push to Docker Hub           │
│    tagged :latest + :sha        │
└─────────────────────────────────┘
```

---

## 🌐 API Reference

### Place Order

```http
POST http://localhost:8080/api/orders
Content-Type: application/json

{"orderId": "order-001", "amount": 50}
```

### List All Orders

```http
GET http://localhost:8080/api/orders
```

### Get Order Status

```http
GET http://localhost:8080/api/orders/order-001
```

### Cancel Order

```http
POST http://localhost:8080/api/orders/order-001/cancel
```

### Health Check

```http
GET http://localhost:8080/health
```

---

## 🗄️ Verify Databases

```bash
# Orders table
docker exec -it order-db psql -U postgres -d orderdb -c "SELECT * FROM orders;"

# Kitchen tickets
docker exec -it kitchen-db psql -U postgres -d kitchendb -c "SELECT * FROM tickets;"

# Payment records
docker exec -it accounting-db psql -U postgres -d accountingdb -c "SELECT * FROM payments;"
```

---

## 📁 Project Structure

```
gourmet-go/
├── gourmet-order-service/        # gRPC Order Service + PostgreSQL
├── gourmet-kitchen-service/      # gRPC Kitchen Service + PostgreSQL
├── gourmet-accounting-service/   # gRPC Accounting Service + PostgreSQL
├── gourmet-orchestrator/         # Saga Orchestrator + HTTP REST API
├── gourmet-ui/                   # React + Vite frontend (served by Nginx)
├── docker-compose.yml            # Full stack deployment
├── .github/workflows/ci-cd.yml   # GitHub Actions pipeline
└── README.md
```

---

_Built as part of the Distributed Systems course — Horizon School of Digital Technologies_
