# 🎓 College Chatbot

A full-stack AI-powered college assistant that answers questions about academic programs, admissions, fees, and campus life. It supports two modes: **PDF Mode** (RAG over uploaded documents) and **Web Mode** (live web search via Tavily). Built with a Next.js frontend and a Fastify backend, using Qdrant for vector storage and OpenRouter for LLM access.

---

## ✨ Features

- **Dual-Mode Chat**
  - 📄 **PDF Mode** — Upload a PDF (brochure, program guide, etc.) and ask questions about its content using a Retrieval-Augmented Generation (RAG) pipeline.
  - 🌐 **Web Mode** — Ask college-related questions and get answers backed by live web search results from Tavily.
- **Hybrid Retrieval (PDF Mode)**
  - Vector similarity search (dense embeddings via `text-embedding-3-small`)
  - Full-text keyword search (Qdrant text index)
  - Merged candidate pool → re-ranked by LLM for precision
- **Source Citations** — Every factual claim is linked to a source chunk or web URL.
- **Security Guardrails**
  - Input: Prompt injection detection, PII scrubbing (email, phone, Aadhaar, SSN), domain enforcement, repetition blocking
  - Output: Profanity filter, hallucination detection, low-confidence annotation
  - Rate limiting: 20 requests / 60 seconds per IP (in-memory sliding window)
- **OCR Fallback Pipeline** — Scanned PDFs are processed with `pdfjs-dist` → `pdf-parse` → Tesseract.js
- **Streaming Responses** — LLM output is streamed to the frontend via Server-Sent Events (SSE)
- **Premium UI** — Sparkle particle background, dark charcoal theme, Framer Motion animations
- **155 Test Cases** — Full Vitest suite covering every module

---

## 🗂 Project Structure

```
college-chatbot/
├── server/                     # Fastify backend (Node.js + TypeScript)
│   ├── src/
│   │   ├── guardrails/
│   │   │   ├── inputGuardrails.ts     # Input validation & PII scrubbing
│   │   │   ├── outputGuardrails.ts    # Response quality checks
│   │   │   ├── rateLimiter.ts         # Sliding-window IP rate limiter
│   │   │   └── index.ts               # Barrel export
│   │   ├── lib/
│   │   │   ├── db.ts                  # PostgreSQL client (stats tracking)
│   │   │   ├── qdrant.ts              # Qdrant vector DB client
│   │   │   └── search.ts              # Tavily web search wrapper
│   │   ├── llm/
│   │   │   ├── openai.ts              # OpenRouter LLM calls (stream + search query)
│   │   │   ├── embedding.ts           # Text embedding via OpenRouter
│   │   │   ├── queryEnricher.ts       # PDF-aware search query generator
│   │   │   └── reranker.ts            # LLM-based chunk re-ranker
│   │   ├── routes/
│   │   │   ├── chat.ts                # /chat SSE endpoint
│   │   │   └── upload.ts              # /upload and /extract-text endpoints
│   │   ├── types/
│   │   │   └── chat.ts                # ChatMessage type
│   │   ├── utils/
│   │   │   └── ocr.ts                 # Multi-tier PDF text extraction
│   │   └── tests/
│   │       ├── guardrails/
│   │       │   ├── inputGuardrails.test.ts
│   │       │   ├── outputGuardrails.test.ts
│   │       │   └── rateLimiter.test.ts
│   │       ├── llm/
│   │       │   ├── embedding.test.ts
│   │       │   ├── openai.test.ts
│   │       │   ├── queryEnricher.test.ts
│   │       │   └── reranker.test.ts
│   │       └── lib/
│   │           └── search.test.ts
│   ├── uploads/                       # Uploaded PDFs (served statically)
│   ├── vitest.config.ts
│   └── package.json
│
└── web/                        # Next.js 16 frontend (React + TypeScript)
    ├── app/
    │   ├── page.tsx                   # Landing / hero page
    │   ├── chat/                      # Chat interface page
    │   ├── layout.tsx
    │   └── globals.css
    ├── components/
    │   └── SparkleParticles.tsx       # Animated particle background
    └── package.json
```

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js Frontend                      │
│  Landing Page → Chat Interface → PDF Upload → Mode Switch│
└───────────────────────────┬─────────────────────────────┘
                            │ HTTP / SSE
┌───────────────────────────▼─────────────────────────────┐
│                   Fastify Backend (:4000)                 │
│                                                           │
│  ┌─────────────────┐    ┌──────────────────────────────┐ │
│  │  Input Guardrail│    │        /upload endpoint       │ │
│  │  - Injection    │    │  pdfjs → pdf-parse → Tesseract│ │
│  │  - PII Scrub    │    │  → chunk → embed → Qdrant     │ │
│  │  - Domain Check │    └──────────────────────────────┘ │
│  │  - Rate Limit   │                                      │
│  └────────┬────────┘                                      │
│           │                                               │
│  ┌────────▼──────────────────────────────────────────┐   │
│  │              /chat SSE Endpoint                    │   │
│  │                                                    │   │
│  │  1. Query Optimization (OpenRouter gpt-4o-mini)   │   │
│  │  2a. PDF Mode: Hybrid Search (vector + keyword)   │   │
│  │       → Re-rank candidates (LLM scoring)          │   │
│  │       → Top 8 chunks as context                   │   │
│  │  2b. Web Mode: Tavily live search                  │   │
│  │  3. Build context + system prompt                 │   │
│  │  4. Stream response (OpenRouter gpt-4o-mini)      │   │
│  │  5. Output Guardrails                             │   │
│  │  6. Append source citations                       │   │
│  └────────────────────────────────────────────────────┘  │
│                                                           │
│  Services: Qdrant (vector DB) · PostgreSQL · OpenRouter  │
└─────────────────────────────────────────────────────────┘
```

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 16, React 19, TypeScript, TailwindCSS 4 |
| **UI Libraries** | Framer Motion, tsParticles, Lucide Icons, react-markdown |
| **Backend** | Fastify 5, Node.js, TypeScript, tsx |
| **LLM Provider** | OpenRouter (`openai/gpt-4o-mini`) |
| **Embeddings** | OpenRouter (`openai/text-embedding-3-small`, 1536 dims) |
| **Vector DB** | Qdrant (local Docker or cloud) |
| **Relational DB** | PostgreSQL |
| **Web Search** | Tavily API |
| **PDF Parsing** | pdfjs-dist → pdf-parse → Tesseract.js (3-tier fallback) |
| **Testing** | Vitest + @vitest/coverage-v8 |

---

## ⚡ Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9
- **Docker** (for Qdrant and PostgreSQL, recommended)
- **OpenRouter account** — [openrouter.ai](https://openrouter.ai)
- **Tavily account** — [tavily.com](https://tavily.com) (for Web Mode)

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/college-chatbot.git
cd college-chatbot
```

### 2. Start Qdrant (Docker)

```bash
docker run -d -p 6333:6333 qdrant/qdrant
```

### 3. Start PostgreSQL (Docker)

```bash
docker run -d \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=college_chatbot \
  -p 5432:5432 \
  postgres:15
```

### 4. Configure environment variables

```bash
# Copy the example env file
cp example.env server/.env

# Edit with your actual values
nano server/.env
```

**`server/.env`:**
```env
PORT=4000
ALLOWED_ORIGIN=*

DATABASE_URL=postgresql://postgres:postgres@localhost:5432/college_chatbot

QDRANT_URL=http://localhost:6333
QDRANT_API_KEY=

OPENROUTER_API_KEY=sk-or-v1-your-key-here
TAVILY_API_KEY=tvly-your-key-here
```

**`web/.env.local`:**
```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:4000
```

### 5. Install dependencies

```bash
# Backend
cd server && npm install

# Frontend
cd ../web && npm install
```

### 6. Start the development servers

Open **two terminals**:

```bash
# Terminal 1 — Backend
cd server
npm run dev
# Server running on port 4000

# Terminal 2 — Frontend
cd web
npm run dev
# App running on http://localhost:3000
```

---

## 📡 API Reference

### `POST /chat`
Streaming SSE endpoint for chat responses.

**Request Body:**
```json
{
  "messages": [
    { "role": "user", "content": "What courses does this college offer?" }
  ],
  "mode": "pdf",
  "filters": { "page_number": 3 }
}
```

| Field | Type | Description |
|---|---|---|
| `messages` | `ChatMessage[]` | Conversation history (required) |
| `mode` | `"pdf" \| "web"` | Retrieval mode (default: `"pdf"`) |
| `pdfContext` | `string` | Extracted PDF text for web+PDF hybrid mode |
| `pdfFilename` | `string` | PDF filename as context hint |
| `filters` | `Record<string, any>` | Optional Qdrant metadata filters |

**Response:** `text/event-stream` (SSE) with OpenAI-compatible delta chunks.

---

### `POST /upload`
Upload and index a PDF into Qdrant. Returns SSE progress events.

```bash
curl -X POST http://localhost:4000/upload \
  -F "file=@/path/to/document.pdf"
```

**SSE Events:**
```json
{ "status": "started", "total": 42 }
{ "status": "embedding", "progress": 8, "total": 42 }
{ "status": "done", "chunksCount": 42, "fileUrl": "/uploads/document.pdf" }
```

---

### `POST /extract-text`
Lightweight text extraction (no indexing). Used in Web Mode to build context.

```bash
curl -X POST http://localhost:4000/extract-text \
  -F "file=@/path/to/document.pdf"
```

**Response:**
```json
{
  "text": "Extracted text content...",
  "filename": "document.pdf",
  "scanned": false,
  "empty": false
}
```

---

## 🔍 Retrieval Pipeline (PDF Mode)

```
User Query
    │
    ▼
Query Optimizer (gpt-4o-mini) → Enriched Query
    │
    ├──► Vector Search (Qdrant cosine similarity) → 25 candidates
    │
    └──► Keyword Search (Qdrant full-text index)  → 15 candidates
    │
    ▼
Merge & Deduplicate → up to 40 unique candidates
    │
    ▼
Re-ranker (gpt-4o-mini scores each chunk 0-10)
    │
    ▼
Top 8 Chunks → LLM Context Window → Streamed Response
```

---

## 🛡 Guardrails

### Input Guardrails (Pre-LLM)

| Check | Trigger | Action |
|---|---|---|
| **Length** | > 2000 chars | Block with `INPUT_TOO_LONG` |
| **Prompt Injection** | 15 injection patterns (jailbreak, system prompt reveal, etc.) | Block with `PROMPT_INJECTION` |
| **Domain Violation** | Off-topic keywords (recipes, crypto, gambling, etc.) | Block with `DOMAIN_VIOLATION` |
| **Repetition** | Same message sent ≥ 3 times | Block with `REPETITION_DETECTED` |
| **PII Scrubbing** | Email, Indian phone, US phone, Aadhaar, SSN | Silently redact before LLM sees input |

### Output Guardrails (Post-LLM)

| Check | Trigger | Action |
|---|---|---|
| **Empty Response** | Response < 10 chars | Replace with fallback message |
| **Profanity** | Toxic words in response | Block and replace entirely |
| **Hallucination Signal** | Phrases like "I believe", "I'm not sure" | Append ⚠️ disclaimer |
| **Low Confidence** | 0 RAG chunks found | Append ℹ️ note |

### Rate Limiter

- **20 requests per 60 seconds** per IP address
- Sliding-window in-memory store (no Redis required)
- Returns `HTTP 429` with `Retry-After` header when exceeded

---

## 🧪 Testing

### Install test dependencies (first time only)

```bash
cd server
npm install --save-dev vitest @vitest/coverage-v8
```

### Run all tests

```bash
npm test
```

### Run in watch mode (re-runs on save)

```bash
npm run test:watch
```

### Run with coverage report

```bash
npm run test:coverage
# Coverage HTML report: server/coverage/index.html
```

### Run a specific test file

```bash
npx vitest run src/tests/guardrails/inputGuardrails.test.ts
```

### Run a specific test suite by name

```bash
npx vitest run --reporter=verbose -t "PII Scrubbing"
```

### Test results summary

```
✓ tests/guardrails/inputGuardrails.test.ts   (~35 tests)
✓ tests/guardrails/outputGuardrails.test.ts  (~36 tests)
✓ tests/guardrails/rateLimiter.test.ts       (~12 tests)
✓ tests/llm/reranker.test.ts                 (~11 tests)
✓ tests/llm/embedding.test.ts                (~17 tests)
✓ tests/llm/openai.test.ts                   (~14 tests)
✓ tests/llm/queryEnricher.test.ts            (~15 tests)
✓ tests/lib/search.test.ts                   (~15 tests)

Test Files  8 passed
Tests       155 passed
```

> **Note:** All tests use mocked `fetch` — no real API keys or network access required.

---

## 📂 PDF Processing Pipeline

```
Uploaded PDF Buffer
    │
    ├─ Step 1: pdfjs-dist (high-fidelity, page-aware)
    │     → Success if extracted text > 200 chars
    │
    ├─ Step 2: pdf-parse (fast fallback)
    │     → Success if extracted text > 200 chars
    │
    └─ Step 3: Tesseract.js OCR (scanned PDF fallback)
          → pdf2pic converts pages to PNG images
          → Tesseract reads text from each image
          → Temp files cleaned up automatically
```

After extraction:
- Text is split into **3000-char chunks with 400-char overlap**
- Each chunk is embedded in **batches of 8** (parallelized)
- Chunks are bulk-upserted into Qdrant with metadata: `document`, `page_number`, `chunk_index`

---

## 🌐 Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `PORT` | No | Server port (default: `4000`) |
| `ALLOWED_ORIGIN` | No | CORS origin (`*` for development) |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `QDRANT_URL` | Yes | Qdrant server URL |
| `QDRANT_API_KEY` | No | Qdrant API key (empty for local) |
| `OPENROUTER_API_KEY` | Yes | OpenRouter API key for LLM + embeddings |
| `TAVILY_API_KEY` | No | Tavily API key (required for Web Mode) |
| `NEXT_PUBLIC_API_URL` | Yes (web) | Backend URL for the frontend |

---

## 🔧 Scripts Reference

### Backend (`/server`)

| Command | Description |
|---|---|
| `npm run dev` | Start with hot-reload (tsx watch) |
| `npm run build` | Compile TypeScript |
| `npm start` | Run compiled build |
| `npm test` | Run all Vitest tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |

### Frontend (`/web`)

| Command | Description |
|---|---|
| `npm run dev` | Start Next.js dev server (port 3000) |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |

---

## 🚧 Known Limitations

- **OpenRouter Credits** — The free tier has limited credits. If you get a `402` error, either top up credits or switch to a different free model on OpenRouter.
- **Rate Limiter is In-Memory** — Resets on server restart. For production, use Redis.
- **Scanned PDF OCR** — Tesseract OCR can be slow on large PDFs (uses 150 DPI rendering).
- **Qdrant is Ephemeral in Docker** — Add a volume mount for persistence: `-v $(pwd)/qdrant_storage:/qdrant/storage`.

---

## 📄 License

MIT — feel free to use, modify, and distribute.

---

## 🙏 Acknowledgements

- [OpenRouter](https://openrouter.ai) — LLM and embeddings gateway
- [Qdrant](https://qdrant.tech) — Vector database
- [Tavily](https://tavily.com) — Web search API for AI agents
- [Fastify](https://fastify.dev) — High-performance Node.js framework
- [Next.js](https://nextjs.org) — React framework
