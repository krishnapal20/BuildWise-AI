# BuildWise AI — Multimodal Construction Intelligence Platform

An AI-powered, full-stack decision-support system for construction professionals. The platform uses **multimodal AI** (Meta LLaMA via Groq) to analyze text, images, and structured project data — delivering actionable, structured insights for construction planning, safety, and operations.

## Architecture

```
React + Vite (Frontend :5173)
       │
       ▼ Axios → /api/*
FastAPI (Backend :8000)
       │
       ├── Groq API (LLaMA 3.2 Vision + LLaMA 3.3 Text)
       ├── Open-Meteo (Weather Data)
       └── Pollinations (Image Generation)
```

## Features

| # | Module | Type | Description |
|---|--------|------|-------------|
| 1 | **Safety Analysis** | Image + Text → AI | Analyzes construction site images for hazards, PPE compliance, risk levels |
| 2 | **Crack Diagnosis** | Image + Text → AI | Detects and classifies structural cracks with severity and repair recommendations |
| 3 | **Project Planner** | Text → AI | Generates material estimates, cost breakdown (₹ INR), and task schedules |
| 4 | **Property Valuation** | Text → AI | Real estate valuation with market comparison, ROI, rental potential (₹ INR) |
| 5 | **Daily Assistant** | Text → AI | Daily site execution plans with priorities, safety checks, workforce allocation |
| 6 | **Weather Advisory** | Text + API → AI | GO/NO-GO recommendations based on real weather data + AI risk assessment |
| 7 | **Knowledge Hub** | Text → AI | Construction knowledge Q&A with references and related topics |
| 8 | **AI Chat** | Text → AI | Conversational assistant with Ask, Recommend, and Report modes |

## Prerequisites

- **Python 3.9+** — [python.org](https://www.python.org)
- **Node.js 18+** — [nodejs.org](https://nodejs.org)
- **Groq API Key** — [console.groq.com](https://console.groq.com)

## Quick Start

### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Configure API key
copy .env.example .env
# Edit .env and add your GROQ_API_KEY

# Start backend server
python main.py
# Server runs at http://localhost:8000
```

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
# App runs at http://localhost:5173
```

### 3. Open the App

Navigate to **http://localhost:5173** in your browser.

## API Endpoints

| Method | Endpoint | Input | Description |
|--------|----------|-------|-------------|
| `GET` | `/health` | — | Health check |
| `POST` | `/api/safety/analyze` | Image + text (multipart) | Safety image analysis |
| `POST` | `/api/crack/detect` | Image + text (multipart) | Crack detection |
| `POST` | `/api/planning/generate` | JSON body | Project planning |
| `POST` | `/api/valuation/estimate` | JSON body | Property valuation |
| `POST` | `/api/assistant/daily` | JSON body | Daily site assistant |
| `POST` | `/api/weather/advisory` | JSON body | Weather advisory |
| `POST` | `/api/knowledge/ask` | JSON body | Knowledge Q&A |
| `POST` | `/api/chat/message` | JSON body | Construction chatbot |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite 5, React Router 6, Axios |
| Backend | FastAPI, Pydantic, Uvicorn, Python 3.9+ |
| AI Models | Meta LLaMA 3.2 90B Vision, LLaMA 3.3 70B (via Groq) |
| Image Gen | Pollinations AI |
| Weather | Open-Meteo API (free, no key required) |

## Project Structure

```
├── backend/
│   ├── main.py                # FastAPI entry point
│   ├── requirements.txt       # Python dependencies
│   ├── .env.example           # API key template
│   ├── services/
│   │   ├── groq_client.py     # Centralized AI service (vision + text)
│   │   ├── weather_service.py # Open-Meteo weather client
│   │   └── image_service.py   # Pollinations image generation
│   ├── schemas/               # Pydantic request/response models
│   │   ├── safety.py, crack.py, planning.py, valuation.py
│   │   ├── assistant.py, weather.py, knowledge.py, chat.py
│   └── routers/               # API route handlers
│       ├── safety.py, crack.py, planning.py, valuation.py
│       ├── assistant.py, weather.py, knowledge.py, chat.py
├── frontend/
│   ├── package.json
│   ├── vite.config.js         # Dev proxy to backend :8000
│   ├── src/
│   │   ├── App.jsx            # Router + layout
│   │   ├── App.css            # Global design system
│   │   ├── api/axios.js       # Axios instance
│   │   ├── components/        # Sidebar, ImageUpload, LoadingSpinner, ResultCard
│   │   └── pages/             # 9 pages (Dashboard + 8 features)
└── README.md
```

## Key Design Decisions

1. **Centralized AI Layer** — Single `groq_client.py` handles all AI calls with feature-aware context routing
2. **Strict JSON Schemas** — Pydantic models with defaults on every field prevent frontend crashes
3. **JSON Extraction Fallback** — Direct parse → regex extraction → safe defaults
4. **Real Weather Data** — Open-Meteo provides actual weather; AI interprets it for construction context
5. **All costs in ₹ INR** — Consistent Indian Rupee formatting across all features

## Known Limitations

- No user authentication (open-access prototype)
- No persistent database (stateless API)
- AI responses may vary in quality depending on input clarity
- Weather data limited to Open-Meteo coverage
- No rate limiting on API endpoints
- Image analysis quality depends on image resolution and clarity

## Future Enhancements

- User authentication and project management
- Database integration for project history
- PDF report generation and export
- Real-time collaboration features
- Mobile-responsive progressive web app
- Integration with BIM (Building Information Modeling) tools
