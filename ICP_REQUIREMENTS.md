# 📋 ICP Form-Filling Agent - Required Fields

## ✅ **Required Fields (All Must Be Present)**

### **1. Persona (with Details)**
- **person_titles**: Job titles to target
  - Examples: "CEO", "CTO", "VP of Sales", "Director of Engineering"
  - Agent extracts: `title_regex` patterns
  
- **person_seniorities**: Seniority levels
  - Examples: "Executive", "Senior", "Director", "Manager"
  - Agent validates: `seniority` field in persona object

**What agent checks:**
```python
has_persona = (
    personas.length > 0 AND
    persona.title_regex exists AND
    persona.seniority exists
)
```

---

### **2. Technologies**
- **Required**: Specific technologies the company uses
- **Examples**: 
  - "Python, React, AWS"
  - "Salesforce, HubSpot"
  - "Java, Spring Boot, Kubernetes"
  
**What agent checks:**
```python
has_technologies = (
    company_filters.technologies exists AND
    len(technologies) > 0
)
```

---

### **3. Company Size**
- **Accepts both formats:**
  
  **A) Numeric Range:**
  - "10-50 employees"
  - "50-200 employees"
  - "200+ employees"
  - Stored in: `employee_count: {min: 50, max: 200}`
  
  **B) Text-Based:**
  - "small companies" → `company_size: "small"`
  - "medium businesses" → `company_size: "medium"`
  - "large enterprises" → `company_size: "large"`
  - "startups" → `company_size: "startup"`

**What agent checks:**
```python
has_company_size = (
    (employee_count.min OR employee_count.max) OR
    company_size text field exists
)
```

---

### **4. Revenue Range**
- **Required**: Annual Recurring Revenue (ARR) in USD
- **Examples**:
  - "$1M-5M ARR"
  - "$10M-50M revenue"
  - "Between $5M and $20M"
  
**What agent checks:**
```python
has_revenue = (
    arr_usd.min is not None OR
    arr_usd.max is not None
)
```

---

## 🌎 **Auto-Filled Field (Not Asked)**

### **5. Location**
- **Always defaults to**: `"United States of America"`
- **Agent will NOT ask** for location
- **Auto-filled** in PARSE node

```python
# Automatically added:
company_filters.countries = ["United States of America"]
```

---

## 📊 **Coverage Calculation**

```python
Total Max Weight: 13.5

Weights:
  Persona:       3.0  (required)
  Technologies:  2.5  (required)
  Company Size:  2.5  (required)
  Revenue Range: 2.0  (required)
  Location:      2.0  (auto-filled, always 100%)
  ────────────────────
  REQUIRED TOTAL: 12.0 / 13.5 = 89%
  
  Industry:      1.0  (recommended)
  Funding Stage: 1.0  (recommended)
  Founded Year:  0.5  (optional)
```

**Completion Formula:**
```python
required_ok = (
    has_persona AND 
    has_technologies AND 
    has_company_size AND 
    has_revenue
)

coverage_score = weighted_sum / 13.5

is_complete = required_ok AND coverage >= 0.8
```

---

## 🎯 **Conversation Examples**

### **Example 1: Minimal Input**

```
User: "CEOs at tech companies"

Agent extracts:
  ✅ Persona: CEO (has title "CEO" and seniority "Executive")
  ✅ Location: USA (auto-filled)
  ❌ Technologies: Not specified
  ❌ Company Size: Not specified
  ❌ Revenue Range: Not specified

Coverage: 5.0 / 13.5 = 37%
Required OK: ❌ False

Agent asks:
"Please specify:
• Technologies the companies use
• Company size (employee count or small/medium/large)
• Revenue range (ARR in USD)"
```

---

### **Example 2: Partial Input**

```
User: "CTOs at SaaS companies using Python and AWS, small startups"

Agent extracts:
  ✅ Persona: CTO (title + seniority)
  ✅ Technologies: Python, AWS
  ✅ Company Size: small
  ✅ Location: USA (auto-filled)
  ✅ Industry: SaaS (bonus)
  ❌ Revenue Range: Not specified

Coverage: 10.5 / 13.5 = 78%
Required OK: ❌ False (missing revenue)

Agent asks:
"What revenue range are you targeting? (e.g., $1M-10M ARR)"
```

---

### **Example 3: Complete Input**

```
User: "VPs of Engineering at AI companies using Python and Kubernetes, 
      50-200 employees, making $10M-50M ARR"

Agent extracts:
  ✅ Persona: VP Engineering (title + seniority)
  ✅ Technologies: Python, Kubernetes
  ✅ Company Size: 50-200 employees
  ✅ Revenue: $10M-50M ARR
  ✅ Location: USA (auto-filled)
  ✅ Industry: AI (bonus)

Coverage: 12.5 / 13.5 = 93%
Required OK: ✅ True

Result: ✅ COMPLETE - No questions needed!
"Your input is complete. ICP configuration created successfully."
```

---

## 🚫 **NOT Required (Won't Ask Unless for Coverage)**

- ❌ **Funding Stage** (Seed, Series A, etc.) - Recommended only
- ❌ **Founded Year** - Optional
- ❌ **Specific Industries** - Recommended but not required

---

## 📝 **Field Mapping**

When user says → Agent extracts:

| User Input | Extracted Field |
|------------|-----------------|
| "CEO", "Chief Executive Officer" | `persona.name = "CEO"`, `seniority = ["Executive"]` |
| "CTO", "VP Engineering" | `persona.name = "CTO/VP"`, `seniority = ["Executive"]` |
| "Python, AWS, Kubernetes" | `technologies = ["Python", "AWS", "Kubernetes"]` |
| "small companies" | `company_size = "small"` |
| "50-200 employees" | `employee_count = {min: 50, max: 200}` |
| "$10M-50M ARR" | `arr_usd = {min: 10, max: 50}` |
| (any input) | `countries = ["United States of America"]` ← Auto |

---

## ⚡ **Agent Behavior**

### **Priority 1: Ask for Required Fields**
```python
if missing: person_titles OR person_seniorities:
    ask: "What job titles and seniority levels are you targeting?"

if missing: technologies:
    ask: "What technologies or tech stack do the companies use?"

if missing: company_size:
    ask: "What company size? (employee count or small/medium/large)"

if missing: revenue_range:
    ask: "What revenue range are you targeting? (ARR in USD)"
```

### **Priority 2: Ask for Recommended (If Coverage < 80%)**
```python
if required_ok AND coverage < 80%:
    ask: "What industries or funding stages are you focusing on?"
```

### **Never Asked:**
- Location (always USA)

---

## 🧪 **Testing Your Setup**

### **Test 1: Incomplete**
```bash
Input: "CEOs at tech companies"

Expected:
  Agent asks: "Please specify:
              • Technologies the companies use
              • Company size
              • Revenue range"
```

### **Test 2: Partial**
```bash
Input: "CTOs using React and Node.js, medium-sized companies"

Expected:
  Agent asks: "What revenue range are you targeting?"
```

### **Test 3: Complete**
```bash
Input: "VPs of Sales at companies using Salesforce and HubSpot, 
        100-500 employees, making $20M-100M ARR"

Expected:
  Agent says: "Your input is complete. ICP configuration created successfully."
```

---

## 📊 **Summary**

| Field | Status | Weight | Example |
|-------|--------|--------|---------|
| **Persona** | Required | 3.0 | CEO, CTO with seniority |
| **Technologies** | Required | 2.5 | Python, AWS, React |
| **Company Size** | Required | 2.5 | 50-200 or "small" |
| **Revenue Range** | Required | 2.0 | $10M-50M ARR |
| **Location** | Auto-filled | 2.0 | USA (always) |
| Industry | Recommended | 1.0 | SaaS, FinTech |
| Funding Stage | Recommended | 1.0 | Series A, B |
| Founded Year | Optional | 0.5 | 2020+ |

**Required Total:** 12.0 / 13.5 = 89%  
**Minimum to Complete:** 80%

**Since required fields = 89%, agent will ALWAYS complete if all 4 required fields are provided!**

---

## ✅ **Key Changes Made**

1. ✅ **Location auto-filled to USA** (never asked)
2. ✅ **Technologies now required** (must specify)
3. ✅ **Revenue range now required** (must specify ARR)
4. ✅ **Company size still required** (handles text + numbers)
5. ✅ **Persona requires seniority** (not just titles)
6. ❌ **Industry no longer required** (recommended only)
7. ❌ **Funding stage NOT required** (recommended only)

---

**Your agent is now configured to collect these exact 4 fields + auto-fill USA location!** 🚀

