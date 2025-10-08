# ICP Normalizer

A modern web application that converts natural language Ideal Customer Profile (ICP) descriptions into structured JSON format using MISTRAL AI.

## Project Structure

```
my-app/
 ├─ backend/         # FastAPI backend
 │   └─ app.py
 ├─ frontend/        # React + Vite frontend
 │   └─ src/App.jsx
 ├─ .cursor/         # Cursor config
 │   └─ cursor.json
 ├─ requirements.txt # Python dependencies
 ├─ env.example      # Environment variables template
 └─ README.md        # This file
```

## 📋 Prerequisites

- Python 3.8 or higher
- Node.js 16 or higher
- MISTRAL AI API key
- Apollo API key (optional - for real company data)
- CoreSignal API key (optional - for company data enrichment)

## 🔧 Setup Instructions

### 1. Clone and Navigate
```bash
cd Tooba_Agent_Revised
```

### 2. Backend Setup

```bash
# Install Python dependencies
pip install -r requirements.txt

# Set up environment variables

# Edit .env and add your API keys
# MISTRAL_API_KEY=your_actual_key_here
# APOLLO_API_KEY=your_apollo_key_here (optional)
# CORESIGNAL_API_KEY=your_coresignal_key_here (optional)
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

### 4. Get API Keys

**MISTRAL AI (Required):**
1. Visit [Mistral AI Console](https://console.mistral.ai/)
2. Create an account or sign in
3. Navigate to API keys section
4. Create a new API key
5. Copy the key to your `.env` file

**Apollo API (Optional - for real company data):**
1. Visit [Apollo.io](https://app.apollo.io/)
2. Sign up for an account
3. Get your API key from settings
4. Add to your `.env` file

**CoreSignal API (Optional - for company enrichment):**
1. Visit [CoreSignal](https://coresignal.com/)
2. Sign up for an account
3. Get your API key from dashboard
4. Add to your `.env` file

## Running the Application

### Start Backend (Terminal 1)
```bash
cd backend
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

### Start Frontend (Terminal 2)
```bash
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs


### Example Input

```
We target small to medium-sized SaaS companies with 10-50 employees, 
ARR between $1M-$10M, focused on AI/ML or tech services. Looking for 
CEOs, CTOs, and Sales Managers who are tech-forward and growth-focused.
```

### Example Output Schema

```json
{
  "personas": [
    {
      "name": "string",
      "title_regex": ["string"],
      "seniority": ["string"],
      "functions": ["string"]
    }
  ],
  "company_filters": {
    "employee_count": { "min": 0, "max": 0 },
    "arr_usd": { "min": 0, "max": 0 },
    "industries": ["string"],

    "locations": ["string"],        // optional
    "cities": ["string"],           // optional
    "states": ["string"],           // optional
    "countries": ["string"],        // optional

    "founded_year_min": 0,          // optional
    "founded_year_max": 0,          // optional
    "company_types": ["string"],     // optional
    "technologies": ["string"],      // optional
    "funding_stage": ["string"],     // optional
    "total_funding_min": 0,          // optional
    "total_funding_max": 0,          // optional
    "company_size": ["string"],      // optional
    "keywords": ["string"],          // optional
    "exclude_keywords": ["string"]   // optional
  },
  "signals_required": ["string"],
  "negative_keywords": ["string"],
  "required_fields_for_qualify": ["string"],
  "contact_persona_targets": {
    "per_company_min": 0,
    "per_company_max": 0,
    "persona_order": ["string"]
  },
  "stage_overrides": {
    "budget_cap_per_lead_usd": 0.0,
    "finder_pct": 0,
    "research_pct": 0,
    "contacts_pct": 0,
    "verify_pct": 0,
    "synthesis_pct": 0,
    "intent_pct": 0
  }
}

```

## 🔗 API Endpoints

### `POST /normalize-icp`
Convert natural language ICP to structured format.

**Request Body:**
```json
{
  "icp_text": "Your ICP description here..."
}
```

**Response:**
```json
{
  "success": true,
  "icp_config": { /* normalized ICP object */ },
  "error": null
}
```

### `GET /health`
Check API health and configuration status.













--------------------------------------------------------------------------------
What I changed:

Added a .gitignore file – this tells Git to skip certain files when committing or pushing:

venv/ → my virtual environment (not uploaded)

__pycache__/ → Python cache files

*.pyc → compiled Python files

.env → environment variables (secrets)

*.log → log files

Added a README.md file from GitHub (created when I initialized the repo)

What I did not change:

All the code in experimental_ai_agent/ is untouched – every file is exactly as it was.

My local folder still includes everything, including the venv/.

I only removed the nested .git folder inside experimental_ai_agent/, which was causing the Git issues.
