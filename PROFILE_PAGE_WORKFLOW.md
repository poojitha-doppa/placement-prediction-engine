# 📋 Profile Page Complete Workflow

## Overview
The Profile Page is the central hub where students manage their information, upload resumes, and the system automatically extracts and merges data.

---

## 🎯 Main Features

### 1. Manual Profile Entry
- Basic Info: Name, College, Branch, Year, CGPA
- Skills: Add/remove technical skills manually
- Coding Profiles: GitHub, LeetCode URLs and problem count
- Target Information: Companies, Roles, Min Package (LPA)

### 2. Resume Upload & Auto-Parsing
- Upload PDF/DOCX resume (max 5MB)
- Automatic text extraction
- AI-powered data parsing
- Auto-merge with existing profile

---

## 📊 Complete User Workflow

### Step 1: User Visits Profile Page
```
User navigates to: http://localhost:5174/profile
```

**What Happens:**
1. Frontend checks authentication (JWT token)
2. If not logged in → Redirect to Login Page
3. If logged in → Fetch profile data from backend

**API Call:**
```
GET /api/profile
Authorization: Bearer <token>
```

**Backend Response:**
```json
{
  "id": "profile-id",
  "name": "Poojitha Doppa",
  "email": "poojithadoppa8@gmail.com",
  "college": "VIT",
  "branch": "CSE",
  "year": 2026,
  "cgpa": 8.75,
  "skills": ["JavaScript", "React", "Node.js"],
  "targetCompanies": ["Google", "Microsoft"],
  "targetRoles": ["SDE"],
  "leetcodeSolved": 425,
  "minPackageLPA": 18.5,
  "resumeUrl": null,
  "parsedResume": null,
  "combinedSkills": []
}
```

**UI Display:**
- Form fields populated with existing data
- Empty fields shown if no data
- Resume upload section shown

---

### Step 2: User Fills/Updates Profile Information

**User Actions:**
- Updates CGPA to 9.0
- Adds new skill "TypeScript"
- Updates LeetCode problems solved to 500
- Sets min package target to 20 LPA
- Adds target company "Amazon"

**What Happens:**
- All changes stored in React state (formData)
- No API call yet (waiting for Save)
- UI updates in real-time

---

### Step 3: User Uploads Resume

#### 3.1 User Clicks "Upload Resume"
```
User selects: resume.pdf (2.5 MB)
```

**Frontend Validation:**
- ✅ File size < 5MB
- ✅ File type is PDF or DOCX
- ❌ If validation fails → Show error message

#### 3.2 Frontend Sends Resume
**API Call:**
```
POST /api/profile/resume
Authorization: Bearer <token>
Content-Type: multipart/form-data

Body:
  resume: [File Binary Data]
```

**User Sees:**
- Loading spinner: "Uploading resume..."
- "Extracting text from resume..."
- "Parsing resume data..."

---

### Step 4: Backend Processes Resume (3-Step Pipeline)

#### 4.1 File Upload & Save
```
📤 Resume upload request received
📁 File uploaded: 1709394567890-123456789.pdf
📏 File size: 2.5 MB
💾 Saved to: uploads/resumes/1709394567890-123456789.pdf
```

**What Happens:**
- Multer middleware intercepts file
- Generates unique filename (timestamp + random)
- Saves to `backend/uploads/resumes/`
- File path stored for processing

#### 4.2 Text Extraction
```
🔍 Step 1: Extracting text from resume...
📄 Extracting text from PDF: ...path/resume.pdf
✅ Extracted 3500 characters from PDF
```

**Process:**
1. **PDF Files:**
   - Uses `pdf-parse` library
   - Reads binary data
   - Extracts all text content
   - Validates minimum content (100 chars)

2. **DOCX Files:**
   - Uses `mammoth` library
   - Parses document structure
   - Extracts plain text
   - Handles tables and formatting

**Error Handling:**
- If extraction fails → File saved, skip parsing
- User gets: "Resume uploaded (parsing failed)"
- Can retry later

#### 4.3 LLM-Based Parsing
```
🤖 Step 2: Parsing resume with LLM...
🌐 Sending request to OpenRouter (deepseek/deepseek-r1:free)...
✅ Received response from OpenRouter
✅ Successfully parsed resume with LLM
📊 Extracted: 15 skills, 5 projects
```

**Process:**
1. Send extracted text to OpenRouter API
2. Model: `deepseek/deepseek-r1:free`
3. Prompt requests structured JSON extraction
4. Response cleaned and parsed
5. Validates all fields

**Extracted Data Structure:**
```json
{
  "full_name": "Poojitha Doppa",
  "email": "poojitha@example.com",
  "phone": "+91-1234567890",
  "skills": [
    "JavaScript", "TypeScript", "React", "Node.js", 
    "MongoDB", "Express", "Git", "Docker"
  ],
  "programming_languages": [
    "Python", "Java", "C++"
  ],
  "projects": [
    "E-commerce Platform - Full-stack MERN application",
    "AI Chatbot - NLP-based customer service bot",
    "Task Manager - Real-time collaboration tool"
  ],
  "education": [
    "B.Tech Computer Science - VIT (2022-2026)"
  ],
  "certifications": [
    "AWS Certified Developer Associate",
    "MongoDB Certified Developer"
  ],
  "internships": [
    "Software Engineer Intern at XYZ Corp (Summer 2024)"
  ]
}
```

**Fallback (if OpenRouter fails):**
```
⚠️  Falling back to basic parsing...
🔄 Using fallback regex-based parsing...
✅ Fallback parsing completed
📊 Extracted: 8 skills (basic extraction)
```

- Regex patterns extract email, phone
- Common tech skills detected from text
- Basic but reliable backup method

#### 4.4 Skills Merging
```
🔗 Merged skills: 3 + 8 + 3 = 12 unique skills
```

**Process:**
1. Get existing profile skills: `["JavaScript", "React", "Node.js"]`
2. Get parsed skills: `["JavaScript", "TypeScript", "MongoDB", "Express", "Git", "Docker", "Python", "Java"]`
3. Get programming languages: `["Python", "Java", "C++"]`
4. Combine all three
5. Normalize to lowercase
6. Remove duplicates
7. Result: `["javascript", "react", "node.js", "typescript", "mongodb", "express", "git", "docker", "python", "java", "c++"]`

#### 4.5 Database Update
```
💾 Step 3: Saving to database...
✅ Database is available and connected
💾 Updating in database mode
✅ Profile saved to database successfully
```

**MongoDB Update:**
```javascript
await prisma.profile.update({
  where: { userId: user.id },
  data: {
    resumeUrl: "/uploads/resumes/1709394567890-123456789.pdf",
    parsedResume: {
      full_name: "Poojitha Doppa",
      email: "poojitha@example.com",
      // ... all extracted fields
    },
    combinedSkills: [
      "javascript", "react", "typescript", "mongodb", 
      // ... all merged skills
    ]
  }
})
```

**Database Structure:**
```
Profile Collection:
├── userId: "69a5980f2124508af48ec36f"
├── college: "VIT"
├── cgpa: 8.75
├── skills: ["JavaScript", "React", "Node.js"]
├── resumeUrl: "/uploads/resumes/1709394567890-123456789.pdf"
├── parsedResume: { full_name: "...", skills: [...], ... }
└── combinedSkills: ["javascript", "react", "typescript", ...]
```

---

### Step 5: Frontend Receives Response

**Success Response:**
```json
{
  "message": "Resume uploaded and parsed successfully",
  "resumeUrl": "/uploads/resumes/1709394567890-123456789.pdf",
  "parsedData": {
    "full_name": "Poojitha Doppa",
    "email": "poojitha@example.com",
    "phone": "+91-1234567890",
    "skills_count": 8,
    "projects_count": 3,
    "education_count": 1,
    "combined_skills_count": 12
  }
}
```

**What User Sees:**
- ✅ Success message: "Resume uploaded successfully!"
- Green notification appears
- Resume filename displayed
- Parsed data summary shown (optional)

**UI Updates:**
- Resume section shows filename
- "Resume uploaded" badge appears
- Can preview or re-upload

---

### Step 6: User Clicks "Save Profile"

**Frontend Action:**
```javascript
const dataToSend = {
  name: "Poojitha Doppa",
  college: "VIT",
  branch: "CSE",
  year: 2026,
  cgpa: 9.0,  // Updated
  skills: ["JavaScript", "React", "Node.js", "TypeScript"],  // Added TypeScript
  targetCompanies: ["Google", "Microsoft", "Amazon"],  // Added Amazon
  targetRoles: ["SDE"],
  leetcodeSolved: 500,  // Updated
  minPackageLPA: 20,  // Updated
  availableHoursPerWeek: 25,
  githubUsername: "poojitha-dev",
  leetcodeUsername: "poojitha_coder"
}
```

**API Call:**
```
PUT /api/profile
Authorization: Bearer <token>
Content-Type: application/json

Body: { ...dataToSend }
```

**Backend Processing:**
```
📝 Update profile request received
✅ Validation passed
✅ Database is available and connected
💾 Updating in database mode
✅ Profile saved to database successfully
```

**User Sees:**
- ✅ "Profile updated successfully!"
- Green success notification
- All changes persisted

---

## 🔄 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      USER PROFILE PAGE                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ├──────────────────────────┐
                              │                          │
                       ┌──────▼──────┐          ┌────────▼────────┐
                       │   MANUAL    │          │  RESUME UPLOAD  │
                       │   EDITING   │          │   (PDF/DOCX)    │
                       └──────┬──────┘          └────────┬────────┘
                              │                          │
                              │                          │
                       ┌──────▼──────────────────────────▼────────┐
                       │         SAVE CHANGES BUTTON                │
                       └──────┬────────────────────────────────────┘
                              │
                ┌─────────────┴─────────────┐
                │                           │
        ┌───────▼────────┐          ┌──────▼──────────┐
        │  PUT /profile  │          │ POST /resume    │
        └───────┬────────┘          └──────┬──────────┘
                │                           │
                │                     ┌─────▼──────┐
                │                     │  Save File │
                │                     └─────┬──────┘
                │                           │
                │                     ┌─────▼──────┐
                │                     │Extract Text│
                │                     └─────┬──────┘
                │                           │
                │                     ┌─────▼──────┐
                │                     │ LLM Parse  │
                │                     └─────┬──────┘
                │                           │
                │                     ┌─────▼──────┐
                │                     │Merge Skills│
                │                     └─────┬──────┘
                │                           │
                └──────────┬────────────────┘
                           │
                    ┌──────▼──────┐
                    │   MongoDB   │
                    │   UPDATE    │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │  Response   │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │ UI Updated  │
                    │ ✅ Success  │
                    └─────────────┘
```

---

## 📱 User Interface Sections

### 1. Basic Information Card
```
┌─────────────────────────────────────┐
│  📋 Basic Information               │
├─────────────────────────────────────┤
│  Name:        [Poojitha Doppa     ] │
│  College:     [VIT                ] │
│  Branch:      [CSE                ] │
│  Year:        [2026               ] │
│  CGPA:        [9.0                ] │
└─────────────────────────────────────┘
```

### 2. Skills Section
```
┌─────────────────────────────────────┐
│  💻 Skills & Technologies           │
├─────────────────────────────────────┤
│  Add: [___________] [+ Add]         │
│                                     │
│  🏷️ JavaScript   ✖️                  │
│  🏷️ TypeScript   ✖️                  │
│  🏷️ React        ✖️                  │
│  🏷️ Node.js      ✖️                  │
└─────────────────────────────────────┘
```

### 3. Coding Profiles
```
┌─────────────────────────────────────┐
│  💻 Coding Profiles                 │
├─────────────────────────────────────┤
│  LeetCode Problems: [500          ] │
│  GitHub URL:  [github.com/user    ] │
│  LeetCode URL: [leetcode.com/user ] │
└─────────────────────────────────────┘
```

### 4. Resume Upload Section
```
┌─────────────────────────────────────┐
│  📄 Resume                          │
├─────────────────────────────────────┤
│  ┌─────────────────────────────┐   │
│  │  ☁️  Drop resume here or     │   │
│  │     click to browse         │   │
│  │  PDF, DOCX (Max 5MB)        │   │
│  └─────────────────────────────┘   │
│                                     │
│  ✅ resume-poojitha.pdf             │
└─────────────────────────────────────┘
```

### 5. Target Section
```
┌─────────────────────────────────────┐
│  🎯 Target Companies                │
├─────────────────────────────────────┤
│  Add: [___________] [+ Add]         │
│                                     │
│  🏢 Google      ✖️                   │
│  🏢 Microsoft   ✖️                   │
│  🏢 Amazon      ✖️                   │
│                                     │
│  Min Package (LPA): [20           ] │
└─────────────────────────────────────┘
```

### 6. Action Buttons
```
┌─────────────────────────────────────┐
│  [Cancel]  [💾 Save Changes]        │
└─────────────────────────────────────┘
```

---

## 🔐 Authentication Flow

```
Page Load
    ↓
Check JWT Token in localStorage
    ↓
    ├── Token Exists ──→ GET /api/profile
    │                         ↓
    │                    Show Profile Form
    │
    └── No Token ──→ Redirect to /login
```

---

## 📊 State Management

### React State (Frontend)
```javascript
const [formData, setFormData] = useState({
  name: '',
  college: '',
  branch: '',
  graduationYear: 2026,
  cgpa: 0,
  skills: [],
  leetcodeSolved: 0,
  githubUrl: '',
  leetcodeUrl: '',
  resumeUrl: '',
  targets: {
    companies: [],
    roles: [],
    minPackageLPA: 0
  }
});
```

### Backend State (MongoDB)
```javascript
Profile {
  userId: ObjectId,
  college: String,
  cgpa: Float,
  skills: [String],
  resumeUrl: String,
  parsedResume: JSON,      // ← New field
  combinedSkills: [String], // ← New field
  // ... other fields
}
```

---

## ⚡ Real-Time Updates

### Resume Upload Progress
```
User uploads resume
    ↓
[========>         ] 30% Uploading...
    ↓
[===============>  ] 80% Extracting text...
    ↓
[==================] 95% Parsing with AI...
    ↓
✅ Complete!
```

### Skills Auto-Population
```
Before Resume Upload:
Skills: [JavaScript, React]

After Resume Upload (Parsed):
Skills: [JavaScript, React, TypeScript, MongoDB, Express, Python, Docker]
                              ↑──────────────────────────────────────────↑
                              Auto-added from resume
```

---

## 🎯 Benefits of This Workflow

### For Students:
1. ✅ **Faster Profile Creation** - Just upload resume, data extracted automatically
2. ✅ **No Manual Typing** - Skills, projects, education parsed automatically
3. ✅ **Always Updated** - Easy to update by uploading new resume
4. ✅ **Complete Profile** - Combined manual + resume data

### For System:
1. ✅ **Rich Data** - More information for placement predictions
2. ✅ **Structured Format** - Consistent data structure
3. ✅ **Skills Database** - Build comprehensive skills inventory
4. ✅ **Better Matching** - Accurate company-student matching

---

## 🔄 Update Scenarios

### Scenario 1: First Time User
```
1. User creates account → Login
2. Profile is empty
3. User uploads resume
4. System extracts all data
5. Profile auto-populated
6. User reviews and saves
```

### Scenario 2: Existing User Updates Resume
```
1. User has existing profile
2. Uploads new resume
3. System extracts new data
4. Merges with existing data
5. Skills combined (no duplicates)
6. User reviews changes
7. Saves updated profile
```

### Scenario 3: Manual Update Only
```
1. User updates CGPA manually
2. Adds new skill manually
3. Updates target package
4. Clicks Save
5. Changes persisted
6. No resume upload needed
```

---

## 🛡️ Error Handling

### Upload Errors
| Error | User Sees | System Action |
|-------|-----------|---------------|
| File too large | "File exceeds 5MB" | Reject upload |
| Wrong format | "Only PDF/DOCX allowed" | Reject upload |
| Corrupt file | "Cannot extract text" | Save file, skip parsing |
| LLM fails | Success message + warning | Use fallback parsing |
| Network error | "Upload failed, retry" | Nothing saved |

### User Experience
- ❌ **Hard Failure**: File rejected, user must fix
- ⚠️ **Soft Failure**: File saved, partial data extracted
- ✅ **Graceful Degradation**: Always some data extracted

---

## 📈 Analytics Tracked

### Backend Logs
- Resume upload count
- Parsing success rate
- LLM vs fallback usage
- Average processing time
- Skills extraction accuracy

### User Actions
- Profile completion rate
- Resume upload rate
- Manual edit frequency
- Save button clicks

---

## 🎉 Summary

The Profile Page workflow is designed to be **intelligent, automatic, and user-friendly**:

1. **Smart Defaults** - System pre-fills as much as possible
2. **Dual Input** - Manual editing + resume upload
3. **Auto-Merge** - Intelligent combination of data sources
4. **Error Resilient** - Works even if parts fail
5. **Real-Time Feedback** - User always knows what's happening
6. **Production Ready** - Handles all edge cases

**Result:** Students get a complete, accurate profile with minimal effort! 🚀
