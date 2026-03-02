# Profile Database Fields - Complete Reference

## ✅ What I Fixed

### Issue 1: Empty Profiles (All NULL values)
**Why**: Profiles were created automatically with default empty values during user registration  
**When to fill**: User must go to Profile Page and fill in their details manually  
**How to fix**: Login → Go to Profile → Fill all fields → Click Save

### Issue 2: 401 Authentication Error
**Why**: Auth middleware was still using SQL syntax with MongoDB  
**Fixed**: Changed `prisma.$queryRaw\`SELECT 1\`` to MongoDB-compatible operations  
**Status**: ✅ Fixed - Refresh your browser page now!

---

## 📋 Profile Collection - All Fields

Your MongoDB database has the following fields in the **Profile** collection:

### **Basic Information Fields**

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| **id** | ObjectId | Auto | Unique profile identifier | `69a450a934c67f42279de8ed` |
| **userId** | ObjectId | Yes | Links to User.id | `69a4512334c67f42279de8ef` |
| **college** | String | No | College/University name | `"Vellore Institute of Technology"` |
| **branch** | String | No | Department/Branch | `"Computer Science and Engineering"` |
| **year** | Integer | No | Expected graduation year | `2026` |
| **cgpa** | Float | No | Current CGPA (0-10 scale) | `8.5` |

### **Skills & Learning Fields**

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| **skills** | Array[String] | No | List of technical skills | `["React", "Python", "Node.js"]` |
| **availableHoursPerWeek** | Integer | Yes | Hours for prep per week | `20` (default: 10) |

### **Career Target Fields**

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| **targetCompanies** | Array[String] | No | Companies you're targeting | `["Google", "Microsoft", "Amazon"]` |
| **targetRoles** | Array[String] | No | Job roles you want | `["Software Engineer", "Full Stack"]` |
| **minPackageLPA** | Float | No | Minimum salary expectation (LPA) | `12.5` |

### **External Platform Fields**

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| **githubUsername** | String | No | GitHub username | `"john-doe"` |
| **leetcodeUsername** | String | No | LeetCode username | `"john_coder"` |
| **codeforcesUsername** | String | No | Codeforces username | `"john_cf"` |
| **leetcodeSolved** | Integer | No | LeetCode problems count | `150` (default: 0) |

### **Resume Field**

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| **resumeUrl** | String | No | Path to uploaded resume | `"/uploads/resumes/xyz.pdf"` |

### **System Fields**

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| **updatedAt** | DateTime | Auto | Last update timestamp | `2026-03-01T10:30:00Z` |

---

## 🎯 Why Profiles Show NULL

When you create an account:

1. ✅ **User created** with email, password, name
2. ✅ **Profile auto-created** with default empty values
3. ⚠️ **All optional fields are NULL** until you fill them
4. ✅ **Arrays are empty** `[]` for skills, companies, roles

**This is normal!** The profile exists but is empty until you fill it.

---

## 📝 How to Fill Your Profile

### Step 1: Login to Your Account
1. Go to http://localhost:5173/
2. **Login** with your registered email and password
3. If you see "Failed to load profile", **refresh the page** (F5)

### Step 2: Navigate to Profile
1. Click **"Profile"** in left sidebar
2. Profile page should now load successfully

### Step 3: Fill All Fields

#### Personal Information Section:
- **Name**: Auto-filled from registration
- **Email**: Auto-filled from registration  
- **College**: e.g., `"Vellore Institute of Technology"`
- **Branch**: e.g., `"Computer Science"`
- **Graduation Year**: e.g., `2026`
- **CGPA**: e.g., `8.5`

#### Skills Section:
1. Type a skill: e.g., `"React"`
2. Press **Enter** or click **+** button
3. Add more: `"Python"`, `"Node.js"`, `"Java"`, etc.
4. Remove skills by clicking **X** on any chip

#### Target Companies Section:
1. Type company name: e.g., `"Google"`
2. Press **Enter** or click **+**
3. Add more: `"Microsoft"`, `"Amazon"`, `"Meta"`

#### Target Roles Section:
1. Type role: e.g., `"Software Engineer"`
2. Press **Enter** or click **+**
3. Add more: `"Full Stack Developer"`, `"Backend Engineer"`

#### Career Goals:
- **Min Package (LPA)**: e.g., `12`
- **Available Hours/Week**: e.g., `20`

#### External Platforms (Optional):
- **GitHub Username**: e.g., `"john-doe"` (just username, not URL)
- **LeetCode Username**: e.g., `"john_coder"`
- **LeetCode Problems Solved**: e.g., `150`

#### Resume (Optional):
- Click **"Upload Resume"**
- Select PDF file (max 5MB)
- Wait for upload confirmation

### Step 4: Save Profile
1. Scroll to bottom
2. Click **"Save Profile"** button (blue button)
3. Wait for **success message**
4. ✅ Done!

---

## 🔍 Verify Data Saved

### Option 1: Refresh Profile Page
1. Refresh the profile page (F5)
2. All your data should still be there
3. If fields are empty, data wasn't saved

### Option 2: Check Prisma Studio
1. Open http://localhost:5555 (or run `cd backend; npm run prisma:studio`)
2. Click **"Profile"** collection
3. Click on your profile row
4. You should see all your data in each field

### Option 3: Check MongoDB Atlas
1. Go to https://cloud.mongodb.com/
2. Login to your account
3. Click your cluster
4. Click **"Browse Collections"**
5. Select **placement_prediction** database
6. View **Profile** collection
7. Find your profile by userId

---

## 📊 What the Fields Look Like in Database

### Example Profile Data:

```json
{
  "_id": "69a450a934c67f42279de8ed",
  "userId": "69a4512334c67f42279de8ef",
  "college": "Vellore Institute of Technology",
  "branch": "Computer Science and Engineering",
  "year": 2026,
  "cgpa": 8.5,
  "skills": ["React", "Python", "Node.js", "Java", "SQL"],
  "targetCompanies": ["Google", "Microsoft", "Amazon", "Meta"],
  "targetRoles": ["Software Engineer", "Full Stack Developer"],
  "availableHoursPerWeek": 20,
  "minPackageLPA": 12.5,
  "githubUsername": "john-doe",
  "leetcodeUsername": "john_coder",
  "codeforcesUsername": null,
  "leetcodeSolved": 150,
  "resumeUrl": "/uploads/resumes/1709311234567-resume.pdf",
  "updatedAt": "2026-03-01T14:30:00.000Z"
}
```

### Empty Profile (After Registration):

```json
{
  "_id": "69a450a934c67f42279de8ed",
  "userId": "69a4512334c67f42279de8ef",
  "college": null,
  "branch": null,
  "year": null,
  "cgpa": null,
  "skills": [],
  "targetCompanies": [],
  "targetRoles": [],
  "availableHoursPerWeek": 10,
  "minPackageLPA": null,
  "githubUsername": null,
  "leetcodeUsername": null,
  "codeforcesUsername": null,
  "leetcodeSolved": 0,
  "resumeUrl": null,
  "updatedAt": "2026-03-01T10:00:00.000Z"
}
```

**This is what you're seeing now** - empty profile waiting to be filled!

---

## 🐛 Troubleshooting

### Problem: "Failed to load profile. Please try again. Error: 401"

**Solution**: ✅ **Fixed!** Refresh your browser (F5)

If still showing:
1. Clear localStorage: Open browser console (F12) → Application tab → Local Storage → Clear
2. Login again
3. Go to Profile page

### Problem: Can't save profile / No success message

**Check:**
1. Are all required fields filled?
2. Check browser console (F12) for errors
3. Check backend terminal for error messages
4. Try logout and login again

### Problem: Data not appearing in Prisma Studio

**Steps:**
1. Click **refresh icon** in Prisma Studio
2. Make sure you clicked **"Save Profile"** button
3. Check if you see success message after saving
4. Try saving again

### Problem: Skills/Companies not adding

**Fix:**
1. Type the value in the input field
2. Press **Enter key** OR click **+ button**
3. Don't just type and click save - must press Enter first

---

## ✅ Current Status

- ✅ Database connected to MongoDB Atlas
- ✅ 2 Users created successfully
- ✅ 2 Profiles created (empty, waiting for data)
- ✅ Authentication fixed (401 error resolved)
- ✅ Both servers running
- ✅ Ready to fill profiles

---

## 🚀 Action Items

1. **Refresh your browser** at http://localhost:5173/profile
2. **Profile page should load** (no more 401 error)
3. **Fill in all your details** as described above
4. **Click Save Profile**
5. **Verify in Prisma Studio** that fields are no longer NULL

Your platform is fully operational! The NULL values are just empty fields waiting for you to fill them. 🎉
