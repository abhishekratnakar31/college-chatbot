# 🚀 Deployment Guide: College Intelligence Platform

This document outlines the steps to deploy the full-stack College Intelligence Platform.

## 🏗️ Architecture Overview
- **Frontend**: Next.js (App Router)
- **Backend**: Node.js (Fastify + TypeScript)
- **Database**: PostgreSQL (Structured data)
- **Vector Search**: Qdrant (RAG context)
- **AI Engine**: OpenRouter (LLM + Embeddings)

---

## 🛠️ Step 1: Infrastructure Setup

### 1. PostgreSQL
Ensure you have a PostgreSQL instance running. Create a new database:
```sql
CREATE DATABASE college_chatbot;
```

### 2. Qdrant
Run Qdrant via Docker or use Qdrant Cloud:
```bash
docker run -p 6333:6333 qdrant/qdrant
```

---

## ⚙️ Step 2: Environment Variables

### Backend (`/server`)
Copy `.env.example` to `.env` and fill in the values:
- `DATABASE_URL`: Your Postgres connection string.
- `QDRANT_URL`: URL of your Qdrant instance.
- `OPENROUTER_API_KEY`: Your OpenRouter API key.
- `ALLOWED_ORIGIN`: Set to your frontend domain in production.

### Frontend (`/web`)
Copy `.env.example` to `.env.local`:
- `NEXT_PUBLIC_API_URL`: The URL where your backend is hosted.

---

## 📦 Step 3: Build & Start

### Backend
```bash
cd server
npm install
npm run build
npm run start
```
*The server will automatically initialize the database schema and seed initial college data on startup.*

### Frontend
```bash
cd web
npm install
npm run build
npm run start
```

---

## 🛡️ Production Best Practices

1. **Security**:
   - Change `ALLOWED_ORIGIN` from `*` to your actual frontend domain.
   - Use a robust reverse proxy like **Nginx** or **Cloudflare** for SSL/TLS.
2. **Process Management**:
   - Use **PM2** to manage your Node.js processes:
     ```bash
     pm2 start dist/index.js --name "college-api"
     ```
3. **Storage**:
   - The `/uploads` directory in the server stores PDF files. Ensure this directory is persisted across deployments or use an S3-compatible object store (requires code modification).
4. **Rate Limiting**:
   - The built-in rate limiter is IP-based. For high-traffic production, consider using a Redis-backed store for the rate limiter.

---

## ☁️ Step 4: Cloud Deployment (Vercel + Render)

### 1. Backend (Render)
Render is ideal for the Node.js server and PostgreSQL.

1.  **PostgreSQL**: Create a new **PostgreSQL** database on Render. Copy the **Internal Database URL**.
2.  **Web Service**:
    - Create a new **Web Service** on Render.
    - Connect your GitHub repository.
    - **Root Directory**: `server`
    - **Build Command**: `npm install && npm run build`
    - **Start Command**: `npm run start`
    - **Environment Variables**:
      - `DATABASE_URL`: (Your Render Postgres URL)
      - `QDRANT_URL`: (Use [Qdrant Cloud](https://cloud.qdrant.io/) for a managed free tier)
      - `QDRANT_API_KEY`: (From Qdrant Cloud)
      - `OPENROUTER_API_KEY`: (Your Key)
      - `ALLOWED_ORIGIN`: `https://your-frontend.vercel.app`
    - **Note**: If using Render's **Free Tier**, the service will "spin down" after 15 minutes of inactivity, causing a delay on the first request. Use a paid instance for production availability.

### 2. Frontend (Vercel)
Vercel is the best home for Next.js.

1.  **Import Project**: Create a new project on Vercel and connect your GitHub repo.
2.  **Framework Preset**: Select **Next.js**.
3.  **Root Directory**: `web`
4.  **Environment Variables**:
    - `NEXT_PUBLIC_API_URL`: `https://your-backend.onrender.com` (The URL Render gives you)
5.  **Deploy**: Vercel will build and host your frontend globally.

---

## 🔍 Health Checks
- **API Status**: `GET /` (should return 200)
- **Database Check**: `GET /news/categories` (should return valid category list)
- **AI Check**: Send a test message in the chat to verify OpenRouter connectivity.
