# ICP Normalizer API - Clean FastAPI Architecture

A professional FastAPI application for Ideal Customer Profile (ICP) normalization using Apollo, CoreSignal, and Mistral AI.

## 🏗️ Project Structure

```
backend/
├── app/                        # Main application package
│   ├── core/                   # Core configuration
│   │   ├── __init__.py
│   │   └── config.py          # Settings and environment variables
│   │
│   ├── schemas/                # Pydantic models (request/response)
│   │   ├── __init__.py
│   │   ├── icp.py             # ICP-related schemas
│   │   ├── company.py         # Company-related schemas
│   │   └── lead.py            # Lead-related schemas
│   │
│   ├── clients/                # External API clients
│   │   ├── __init__.py
│   │   ├── mistral.py         # Mistral AI client
│   │   ├── apollo.py          # Apollo API client
│   │   └── coresignal.py      # CoreSignal API client
│   │
│   ├── services/               # Business logic layer
│   │   ├── __init__.py
│   │   ├── icp_service.py     # ICP normalization service
│   │   ├── company_service.py # Company search & enrichment service
│   │   └── lead_service.py    # Lead generation service
│   │
│   ├── mappers/                # Data transformation utilities
│   │   ├── __init__.py
│   │   ├── company_mapper.py  # Company data mapping
│   │   └── lead_mapper.py     # Lead data mapping
│   │
│   ├── routes/                 # API route handlers
│   │   ├── __init__.py
│   │   ├── health.py          # Health check endpoints
│   │   ├── icp.py             # ICP normalization endpoints
│   │   ├── company.py         # Company search endpoints
│   │   └── lead.py            # Lead generation endpoints
│   │
│   ├── __init__.py
│   └── main.py                # FastAPI app factory
│
├── main.py                     # Application entry point
├── app_old.py                  # Old monolithic app (backup)
└── requirements.txt
```

## 🚀 Getting Started

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Environment Variables

Create a `.env` file with your API keys:

```env
MISTRAL_API_KEY=your_mistral_key_here
APOLLO_API_KEY=your_apollo_key_here
CORESIGNAL_API_KEY=your_coresignal_key_here
```

### 3. Run the Application

```bash
# Using the main entry point
python main.py

# Or directly with uvicorn
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 4. API Documentation

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/health

## 📋 API Endpoints

### Health & Status
- `GET /` - Basic health check
- `GET /health` - Detailed health with API key status

### ICP Normalization
- `POST /normalize-icp` - Convert natural language ICP to structured data

### Company Operations
- `POST /companies` - Search companies via Apollo + enrich with CoreSignal
- `POST /enrich-company` - Enrich single company via CoreSignal

### Lead Generation
- `POST /leads` - Generate leads from companies using Apollo People API

## 🏛️ Architecture Overview

### **Layered Architecture**

1. **Routes Layer** (`routes/`) - HTTP request handling and validation
2. **Services Layer** (`services/`) - Business logic and orchestration
3. **Clients Layer** (`clients/`) - External API communication
4. **Schemas Layer** (`schemas/`) - Data models and validation
5. **Mappers Layer** (`mappers/`) - Data transformation utilities

### **Key Components**

#### **Core Configuration** (`core/config.py`)
- Centralized settings management
- Environment variable loading
- API URLs and timeouts
- CORS configuration

#### **API Clients** (`clients/`)
- **MistralClient**: AI-powered ICP normalization
- **ApolloClient**: Company and people search
- **CoreSignalClient**: Company data enrichment

#### **Business Services** (`services/`)
- **ICPService**: Handles ICP normalization with fallback logic
- **CompanyService**: Orchestrates company search and enrichment
- **LeadService**: Manages lead generation and deduplication

#### **Data Mappers** (`mappers/`)
- **CompanyMapper**: Transforms Apollo/CoreSignal data to internal models
- **LeadMapper**: Converts Apollo people data to lead records

## 🔄 Data Flow

```
1. Request → Routes → Services → Clients → External APIs
                ↓
2. Response ← Routes ← Services ← Mappers ← Raw API Data
```

### Example: Company Search Flow

```
POST /companies
    ↓
CompanyService.search_companies()
    ↓
ApolloClient.search_companies() → Apollo API
    ↓
CompanyMapper.map_apollo_to_company()
    ↓
CoreSignalClient.enrich_by_domain() → CoreSignal API
    ↓
CompanyMapper.apply_coresignal_enrichment()
    ↓
Return enriched companies
```

## 🎯 Benefits of This Structure

### **1. Separation of Concerns**
- Routes handle HTTP logic only
- Services contain business logic
- Clients manage API communication
- Mappers handle data transformation

### **2. Easy Testing**
- Mock individual components
- Unit test business logic separately
- Integration test API endpoints

### **3. Maintainability**
- Clear file organization
- Single responsibility principle
- Easy to locate and modify code

### **4. Scalability**
- Add new endpoints easily
- Extend services without affecting routes
- Swap API clients independently

### **5. Reusability**
- Services can be used by multiple routes
- Clients can be shared across services
- Mappers are pure functions

## 🔧 Development Guide

### Adding a New Endpoint

1. **Define Schema** (`schemas/`)
2. **Create Route** (`routes/`)
3. **Implement Service** (`services/`)
4. **Add Client Method** (`clients/`) if needed
5. **Create Mapper** (`mappers/`) if needed
6. **Register Route** in `main.py`

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MISTRAL_API_KEY` | Mistral AI API key for ICP normalization | Yes |
| `APOLLO_API_KEY` | Apollo API key for company/people search | Yes |
| `CORESIGNAL_API_KEY` | CoreSignal API key for company enrichment | Optional |

## 🚀 Features Preserved

All original functionality has been preserved:

- ✅ ICP normalization with Mistral AI
- ✅ Company search via Apollo API  
- ✅ Company enrichment via CoreSignal API
- ✅ Domain enrichment (LinkedIn URL → Domain)
- ✅ Lead generation via Apollo People API
- ✅ Error handling and fallback logic
- ✅ Rate limiting and timeouts
- ✅ CORS configuration for frontend
- ✅ Comprehensive logging

## 🎯 Frontend Compatibility

The restructured API maintains **100% compatibility** with the existing React frontend. All endpoints, request/response formats, and error handling remain identical.

## 🧪 Testing

```bash
# Test application imports
python -c "from app.main import app; print('✅ App imports successfully')"

# Test health endpoint
python -c "
import asyncio
from app.routes.health import health_check
async def test(): 
    result = await health_check()
    print('✅ Health check:', result)
asyncio.run(test())
"
```

This clean architecture makes the codebase more maintainable, testable, and scalable while preserving all existing functionality.
