# Resume Parsing - Quick Test Guide

## ✅ Implementation Complete!

All resume parsing functionality has been successfully implemented in your Node.js/Express backend.

---

## 🎯 What Was Built

### 1. **Resume Text Extraction** 
- Extracts text from PDF files  
- Extracts text from DOCX files
- Handles various encodings and formats

### 2. **LLM-Based Parsing**
- Uses OpenRouter's DeepSeek R1 Free model
- Extracts structured data (name, email, skills, projects, etc.)
- Falls back to regex parsing if LLM unavailable

### 3. **Database Integration**
- Stores parsed resume data in MongoDB
- Merges skills with existing profile
- Auto-updates user information

### 4. **Production-Ready Features**
- Comprehensive error handling
- Graceful degradation
- Detailed logging
- File validation (size, type)

---

## 📡 API Endpoint

```
POST http://localhost:3000/api/profile/resume
```

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: multipart/form-data
```

**Body:**
```
resume: [File] (PDF or DOCX, max 5MB)
```

---

## 🧪 How to Test

### Step 1: Get Authentication Token

Login first to get your JWT token:

```powershell
$loginBody = @{
    email = "poojithadoppa8@gmail.com"
    password = "Poojitha@2006"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/auth/login" `
    -Method Post `
    -Body $loginBody `
    -ContentType "application/json"

$token = $loginResponse.token
Write-Host "Token: $token"
```

### Step 2: Upload Resume (PowerShell)

```powershell
# Path to your resume file
$resumePath = "C:\path\to\your\resume.pdf"

# Create form data
$form = @{
    resume = Get-Item -Path $resumePath
}

# Upload resume
$response = Invoke-RestMethod -Uri "http://localhost:3000/api/profile/resume" `
    -Method Post `
    -Headers @{
        "Authorization" = "Bearer $token"
    } `
    -Form $form

# View response
$response | ConvertTo-Json -Depth 5
```

### Step 3: Check Parsed Data

```powershell
# Get profile with parsed resume
$profile = Invoke-RestMethod -Uri "http://localhost:3000/api/profile" `
    -Method Get `
    -Headers @{
        "Authorization" = "Bearer $token"
    }

# View parsed resume data
Write-Host "Parsed Resume:"
$profile.parsedResume | ConvertTo-Json -Depth 5

Write-Host "`nCombined Skills:"
$profile.combinedSkills
```

---

## 🔑 OpenRouter API Key Setup

To enable LLM parsing, you need an OpenRouter API key:

### 1. Get Free API Key
- Visit: https://openrouter.ai/keys
- Sign up (free)
- Create a new API key

### 2. Add to Environment
Edit `backend/.env`:

```env
OPENROUTER_API_KEY=sk-or-v1-YOUR-KEY-HERE
```

### 3. Restart Backend
```powershell
# Backend will automatically use the key
npm run dev
```

**Note:** Without the API key, the system will still work using fallback regex parsing (basic extraction).

---

## 📊 Example Response

### Success Response:
```json
{
  "message": "Resume uploaded and parsed successfully",
  "resumeUrl": "/uploads/resumes/1709394567890-123456789.pdf",
  "parsedData": {
    "full_name": "John Doe",
    "email": "john.doe@example.com",
    "phone": "+1-234-567-8900",
    "skills_count": 18,
    "projects_count": 5,
    "education_count": 2,
    "combined_skills_count": 25
  }
}
```

### Parsed Resume Data Structure:
```json
{
  "full_name": "John Doe",
  "email": "john.doe@example.com",
  "phone": "+1-234-567-8900",
  "skills": [
    "JavaScript", "React", "Node.js", "MongoDB", "AWS"
  ],
  "programming_languages": [
    "Python", "Java", "TypeScript"
  ],
  "projects": [
    "E-commerce Platform - Built full-stack application",
    "AI Chatbot - Developed NLP-based chatbot"
  ],
  "education": [
    "B.Tech Computer Science - XYZ University (2020-2024)"
  ],
  "certifications": [
    "AWS Certified Developer"
  ],
  "internships": [
    "Software Engineer Intern at ABC Corp (Summer 2023)"
  ]
}
```

---

## 🛠️ Troubleshooting

### Issue: "No file uploaded"
**Solution:** Make sure the form field name is exactly `resume`

### Issue: "Only PDF and DOC files are allowed"
**Solution:** Convert your resume to PDF or DOCX format

### Issue: "File size exceeds 5MB"
**Solution:** Compress your PDF or remove large images

### Issue: "Could not extract text from resume"
**Cause:** Image-based PDF (scanned resume)
**Solution:** The file is saved but not parsed. Convert to text-based PDF

### Issue: "LLM parsing failed"
**Cause:** OpenRouter API key not set or API error
**Solution:** System automatically uses fallback regex parsing

---

## 📁 Files Created

### New Services:
1. `backend/src/services/resumeExtractor.service.ts` - Text extraction
2. `backend/src/services/resumeParser.service.ts` - LLM parsing

### Modified Files:
1. `backend/src/controllers/profile.controller.ts` - Enhanced uploadResume
2. `backend/prisma/schema.prisma` - Added parsedResume, combinedSkills
3. `backend/.env` - Added OPENROUTER_API_KEY

---

## ✅ Features Included

- ✅ PDF text extraction
- ✅ DOCX text extraction
- ✅ LLM-based parsing (OpenRouter DeepSeek R1)
- ✅ Fallback regex parsing
- ✅ Automatic skills merging
- ✅ Database storage (MongoDB)
- ✅ Error handling at every step
- ✅ File validation (type, size)
- ✅ Detailed logging
- ✅ Production-ready code

---

## 🎉 Next Steps

1. **Get OpenRouter API Key** (for best results)
2. **Test with your own resume**
3. **Check Prisma Studio** (http://localhost:5555) to see parsed data
4. **Integrate with frontend** (upload button already works!)
5. **Monitor logs** to see parsing in action

---

## 📝 Backend Status

✅ **Backend Server Running:** http://localhost:3000  
✅ **Resume Upload Endpoint:** /api/profile/resume  
✅ **Frontend Running:** http://localhost:5174 (or 5173)  
✅ **Prisma Studio:** http://localhost:5555  
✅ **MongoDB:** Connected and operational  

**All systems ready for resume parsing!** 🚀
