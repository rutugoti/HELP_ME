# LastMinute

An AI-powered productivity companion with a microservices backend and a React Native mobile application.

## Prerequisites

Ensure you have the following installed on your system:

- **Node.js** >= 20.0.0
- **pnpm** >= 9.0.0
- **Docker** and **Docker Compose**

---

## Getting Started

Follow these steps to set up and run the project locally.

### 1. Install Dependencies

Run the following command at the root of the workspace to install all packages:

```bash
pnpm install
```

### 2. Set Up Infrastructure

Start the database, caching, and message broker containers (PostgreSQL, Redis, RabbitMQ) using Docker:

```bash
docker compose up -d
```

### 3. Run Database Migrations

Build the shared packages and apply the database migrations:

```bash
pnpm --filter @lastminute/database run build
pnpm --filter @lastminute/database run migrate:latest
```

### 4. Configure Environment Variables

Copy the `.env.example` templates in each service directory (or create a `.env` file) and fill in the required configuration:

- `services/user-service/.env`
- `services/task-service/.env`
- `services/calendar-service/.env`
- `services/notification-service/.env`
- `services/ai-service/.env`
- `services/api-gateway/.env`
- `apps/mobile/.env`

---

## Running the Application

### Start the Microservices Backend

To start all backend microservices and the API gateway concurrently in development mode:

```bash
pnpm dev
```

The services run on the following ports:

- **API Gateway**: `3000`
- **User Service**: `3001`
- **Task Service**: `3002`
- **Calendar Service**: `3003`
- **Notification Service**: `3004`
- **AI Service**: `3005`

### Start the Mobile App

To run the React Native mobile application (via Expo):

1. Navigate to the mobile app directory:
   ```bash
   cd apps/mobile
   ```
2. Start the Expo development server:
   ```bash
   pnpm start
   ```
3. Open on Android or iOS via Expo Go, an emulator, or a physical device.

---

## Development commands

- **Build**: `pnpm build`
- **Typecheck**: `pnpm typecheck`
- **Lint**: `pnpm lint`
- **Test**: `pnpm test`
