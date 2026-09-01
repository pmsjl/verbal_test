# Verbal Memory Experiment

A web-based experimental platform for studying the effects of music on short-term verbal memory, inspired by [humanbenchmark.com](https://humanbenchmark.com)'s Verbal Memory test.

## Experiment Design

- **Between-subjects design**: two groups — *music* vs *no music*
- **Task**: judge whether each displayed English word is NEW (first time seen) or SEEN (seen before in this session)
- **Metrics collected**: final score and completion time
- **Covariate**: music listening habits (self-reported)

Participants start with 3 lives; each wrong answer costs 1 life. The test ends when all lives are lost.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vite 5 + React 18 + TypeScript 5 + Tailwind CSS 3 |
| Backend | Spring Boot 3.2 + MyBatis-Plus 3.5 (Java 17) |
| Database | MySQL 8 |
| Audio | HTML5 `<audio>` with auto-discovery via Vite glob |

## Project Structure

```
verbal_test/
├── frontend/                  # React + Vite + Tailwind
│   ├── src/
│   │   ├── components/        # InfoForm, ReadyScreen, TestScreen, DoneScreen, AdminPage, Leaderboard
│   │   ├── lib/
│   │   │   ├── api.ts         # Typed HTTP client
│   │   │   └── verbalTest.ts  # Core test state machine & difficulty algorithm
│   │   ├── data/
│   │   │   └── wordlist.ts    # English vocabulary word list
│   │   └── assets/audio/      # Drop any audio file here (auto-detected)
│   └── ...
├── backend/                   # Spring Boot
│   ├── src/main/java/com/verbaltest/
│   │   ├── config/            # CORS configuration
│   │   ├── controller/        # REST API controllers
│   │   ├── service/           # Business logic
│   │   ├── mapper/            # MyBatis-Plus mappers
│   │   ├── entity/            # JPA entities
│   │   └── dto/               # Request/response DTOs
│   └── sql/init.sql           # Database init script
└── CLAUDE.md                  # Detailed project documentation
```

## API Endpoints

| Method | Path | Description |
|---|---|---|
| POST | `/api/participants` | Register a participant |
| POST | `/api/records` | Submit a test result |
| GET | `/api/records` | List all records |
| GET | `/api/records/export` | Export all records as CSV |
| DELETE | `/api/records/{id}` | Delete a single record |
| POST | `/api/records/batch-delete` | Batch delete records |

## Getting Started

### Prerequisites

- Java 17+, Maven, Node.js 18+, pnpm, MySQL 8

### 1. Database

```bash
mysql -u root -p < backend/sql/init.sql
```

### 2. Backend

```bash
cd backend
# Edit src/main/resources/application.yml or set environment variables:
#   DB_HOST, DB_PORT, DB_NAME, DB_USERNAME, DB_PASSWORD
mvn spring-boot:run
# Starts on http://localhost:8080
```

### 3. Frontend

```bash
cd frontend
pnpm install
pnpm dev
# Starts on http://localhost:5173
```

### 4. Audio

Drop a single audio file (MP3/FLAC/WAV/etc.) into `frontend/src/assets/audio/`. It will be auto-detected at build time — no configuration needed.

## 生产部署

当前生产环境采用 Docker Compose + Cloudflare Tunnel：

- 前端部署于 Cloudflare Pages：`https://verbal.pmsjl.com`；
- Spring Boot 后端与 MySQL 部署于阿里云 ECS；
- 后端与 MySQL 位于 Docker bridge network `verbal-net`，通过 Compose service DNS 通信；
- MySQL 使用 Docker named volume `verbal_mysql_data` 持久化；
- 后端仅映射至 ECS `127.0.0.1:8080`；
- `verbal-api.pmsjl.com` 通过 remotely-managed Cloudflare Tunnel 转发至后端；
- 当前生产请求链路不依赖 Nginx / Certbot。

详细部署说明见 [`deploy/README.md`](./deploy/README.md)。

## Admin Panel

Visit `?admin=1` to access the admin page for viewing, exporting, and deleting records.

## License

MIT
