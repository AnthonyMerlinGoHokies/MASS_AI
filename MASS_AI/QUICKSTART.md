# 🚀 SIOS Quick Start Guide

This guide will help you run the backend API and frontend to test the conversational ICP form-filling agent.

---

## 📋 Prerequisites

- Python 3.11+ installed
- Node.js 16+ installed
- Supabase account with database set up
- API keys for: Mistral AI, Apollo, CoreSignal (optional)

---

## 🔧 Setup

### 1. Install Backend Dependencies

```bash
# From project root
pip install -r requirements.txt
```

### 2. Create `.env` File in Backend

Create `backend/.env` with your credentials:

```env
# Supabase
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key

# AI & APIs
MISTRAL_API_KEY=your_mistral_api_key
APOLLO_API_KEY=your_apollo_api_key
CORESIGNAL_API_KEY=your_coresignal_api_key

# Optional APIs
HUNTER_IO_API_KEY=your_hunter_io_key
SERPER_API_KEY=your_serper_key
ENRICH_LAYER=your_enrichlayer_key
```

### 3. Verify Database Schema

Make sure your Supabase database has the `icp_conversations` table with this schema:

```sql
CREATE TABLE IF NOT EXISTS icp_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id TEXT UNIQUE NOT NULL,
    session_id TEXT NOT NULL,
    initial_input TEXT NOT NULL,
    
    -- Conversation configuration
    conversation_mode TEXT NOT NULL DEFAULT 'auto',
    max_turns INTEGER NOT NULL DEFAULT 5,
    
    -- Conversation state
    current_state JSONB NOT NULL DEFAULT '{
        "known_fields": {},
        "missing_fields": [],
        "invalid_fields": [],
        "turn_count": 0,
        "confidence_score": 0.0,
        "progress_percentage": 0.0
    }'::jsonb,
    
    -- Message history
    messages JSONB NOT NULL DEFAULT '[]'::jsonb,
    
    -- Completion status
    is_complete BOOLEAN DEFAULT false,
    final_icp_config JSONB,
    
    -- Timestamps
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITHOUT TIME ZONE,
    
    -- Foreign key to icp_searches
    CONSTRAINT fk_icp_conversations_session_id
        FOREIGN KEY (session_id)
        REFERENCES icp_searches(session_id)
        ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_icp_conversations_conversation_id ON icp_conversations(conversation_id);
CREATE INDEX IF NOT EXISTS idx_icp_conversations_session_id ON icp_conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_icp_conversations_is_complete ON icp_conversations(is_complete);
CREATE INDEX IF NOT EXISTS idx_icp_conversations_current_state ON icp_conversations USING GIN (current_state);
CREATE INDEX IF NOT EXISTS idx_icp_conversations_messages ON icp_conversations USING GIN (messages);

-- Auto-update trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_icp_conversations_updated_at
    BEFORE UPDATE ON icp_conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

---

## ▶️ Running the Application

### Option 1: Run Backend and Frontend Separately

**Terminal 1 - Start Backend:**
```bash
cd backend
python main.py
```

The backend will start at: **http://localhost:8000**

**Terminal 2 - Start Frontend:**
```bash
cd frontend
npm install  # First time only
npm run dev
```

The frontend will start at: **http://localhost:5173**

### Option 2: Alternative Backend Start

If you prefer uvicorn directly:
```bash
cd backend
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

---

## 🧪 Testing the Conversational ICP Agent

### 1. Via API (Direct Testing)

**Start a conversation:**
```bash
curl -X POST http://localhost:8000/icp/conversation/start \
  -H "Content-Type: application/json" \
  -d '{
    "initial_text": "I need CEOs at Series A SaaS companies",
    "mode": "auto",
    "max_turns": 5
  }'
```

**Response:**
```json
{
  "conversation_id": "abc123de",
  "session_id": "xyz789ab",
  "needs_conversation": true,
  "message": "What industries or sectors are you targeting?",
  "current_state": {
    "known_fields": {...},
    "missing_fields": ["industries", "locations"],
    "turn_count": 0,
    "max_turns": 5
  }
}
```

**Continue the conversation:**
```bash
curl -X POST http://localhost:8000/icp/conversation/abc123de/respond \
  -H "Content-Type: application/json" \
  -d '{
    "answer": "B2B software companies in California and New York"
  }'
```

### 2. Via Frontend

1. Open **http://localhost:5173** in your browser
2. The frontend will connect to your backend automatically
3. Use the UI to interact with the conversational ICP agent

---

## 📡 API Endpoints

### Health Check
- `GET /health` - Check API status and environment

### Conversational ICP (Form-Filling Agent)
- `POST /icp/conversation/start` - Start new conversation
- `POST /icp/conversation/{id}/respond` - Answer agent's question
- `GET /icp/conversation/{id}/status` - Get conversation status
- `POST /icp/conversation/{id}/finalize` - Force complete conversation

### Traditional ICP
- `POST /normalize-icp` - One-shot ICP normalization

### Companies & Leads
- `POST /companies` - Search and enrich companies
- `POST /leads` - Generate leads from companies

### Documentation
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

---

## 🐛 Troubleshooting

### Backend won't start

**Error: `ModuleNotFoundError: No module named 'uvicorn'`**
```bash
pip install -r requirements.txt
```

**Error: `Missing SUPABASE_URL or SUPABASE_KEY`**
- Check `backend/.env` file exists
- Verify environment variables are set correctly

### Frontend won't connect to backend

**Error: Network error or CORS issues**
- Make sure backend is running on port 8000
- Check CORS settings in `backend/app/core/config.py`

### Database errors

**Error: Foreign key constraint violation**
- Make sure `icp_searches` table exists in your Supabase database
- The agent creates this automatically when starting a conversation

---

## 🎯 What to Test

### 1. Complete Input (No Conversation Needed)
```json
{
  "initial_text": "CTOs at Series B AI/ML companies with 50-200 employees in San Francisco, California making $10M-50M ARR"
}
```
**Expected:** Returns ICP config immediately, `needs_conversation: false`

### 2. Incomplete Input (Triggers Conversation)
```json
{
  "initial_text": "CEOs at tech startups"
}
```
**Expected:** Agent asks for missing details like location, company size, funding stage

### 3. Multi-Turn Conversation
- Start with minimal info
- Agent asks questions
- You provide answers
- Agent fills in the ICP form incrementally
- Conversation completes when enough info is gathered

---

## 📊 Monitoring

Watch the backend console for:
- `[Session] Started ICP session {id}` - New session created
- `[Parse Node]` - AI parsing user input
- `[Evaluate Node]` - Checking if complete
- `[Ask Node]` - Generating questions
- `[Finalize Node]` - Creating final ICP config

Check your Supabase database:
- `icp_conversations` - Conversation state and history
- `icp_searches` - Completed ICP configs
- `messages` JSONB field - Full conversation transcript

---

## ✅ Success Checklist

- [ ] Backend starts without errors on port 8000
- [ ] Frontend starts without errors on port 5173
- [ ] `/health` endpoint returns 200 OK
- [ ] Can start a conversation via API
- [ ] Agent responds with intelligent questions
- [ ] Conversation state saves to database
- [ ] Frontend connects to backend successfully
- [ ] Complete ICP config generated after conversation

---

**Need help?** Check the logs in `backend/logs/` for detailed session information.

**SIOS** - Smart Intelligent Orchestration System 🚀

