# Profile Page - Complete Field Reference & Testing Guide

## ✅ Changes Made

1. **Removed demo credentials** from Login Page
2. **Database connected** to MongoDB Atlas
3. **Ready for testing** with real user registration

---

## 📋 Profile Database Schema

### **Profile Collection Fields**

| Field Name | Type | Description | Required | Example |
|------------|------|-------------|----------|---------|
| **id** | String (ObjectId) | Unique profile identifier | Auto | `507f1f77bcf86cd799439011` |
| **userId** | String (ObjectId) | Reference to User collection | Yes | Links to User.id |
| **college** | String | College/University name | No | `"Vellore Institute of Technology"` |
| **branch** | String | Branch/Department | No | `"Computer Science and Engineering"` |
| **year** | Integer | Expected graduation year | No | `2026` |
| **cgpa** | Float | Current CGPA (0-10) | No | `8.75` |
| **skills** | String[] | Array of skills | No | `["JavaScript", "React", "Python"]` |
| **targetCompanies** | String[] | Companies interested in | No | `["Google", "Microsoft", "Amazon"]` |
| **targetRoles** | String[] | Job roles interested in | No | `["Software Engineer", "Full Stack"]` |
| **availableHoursPerWeek** | Integer | Hours available per week | Yes (default: 10) | `25` |
| **resumeUrl** | String | URL to uploaded resume | No | `"/uploads/resumes/xyz.pdf"` |
| **githubUsername** | String | GitHub username | No | `"john-doe"` |
| **leetcodeUsername** | String | LeetCode username | No | `"john_coder"` |
| **codeforcesUsername** | String | Codeforces username | No | `"john_cf"` |
| **leetcodeSolved** | Integer | Number of LeetCode problems solved | Yes (default: 0) | `287` |
| **minPackageLPA** | Float | Minimum expected package in LPA | No | `12.5` |
| **updatedAt** | DateTime | Last updated timestamp | Auto | `2026-03-01T10:30:00Z` |

### **User Collection Fields** (Linked to Profile)

| Field Name | Type | Description | Required | Example |
|------------|------|-------------|----------|---------|
| **id** | String (ObjectId) | Unique user identifier | Auto | `507f1f77bcf86cd799439011` |
| **email** | String | User email (unique) | Yes | `"student@vit.edu"` |
| **password** | String | Hashed password | Yes | `(bcrypt hash)` |
| **name** | String | User's full name | No | `"John Doe"` |
| **createdAt** | DateTime | Account creation date | Auto | `2026-03-01T10:00:00Z` |
| **updatedAt** | DateTime | Last updated | Auto | `2026-03-01T10:30:00Z` |

---

## 🧪 Testing Steps

### **Step 1: Register a New User**

1. Open the application: http://localhost:5173/
2. Click on the **"Sign Up"** tab
3. Fill in the registration form:
   - **Name**: `Your Name`
   - **Email**: `yourmail@example.com`
   - **Password**: `SecurePass@123` (minimum 8 characters)
4. Click **"Sign Up"**
5. You will be automatically redirected to the Profile page

### **Step 2: Complete Your Profile**

Fill in the following sections on the Profile page:

#### **Personal Information**
- Name (pre-filled from registration)
- Email (pre-filled from registration)
- College: e.g., `"Vellore Institute of Technology"`
- Branch: e.g., `"Computer Science"`
- Graduation Year: e.g., `2026`
- CGPA: e.g., `8.5`

#### **Skills**
- Type a skill (e.g., `"React"`)
- Click **"+"** button or press Enter
- Add multiple skills (e.g., `"JavaScript"`, `"Python"`, `"Node.js"`)

#### **Target Companies**
- Type a company name (e.g., `"Google"`)
- Click **"+"** button
- Add more companies (e.g., `"Microsoft"`, `"Amazon"`)

#### **Target Roles**
- Type a role (e.g., `"Software Engineer"`)
- Click **"+"** button
- Add more roles (e.g., `"Full Stack Developer"`)

#### **Package Expectation**
- Minimum Package (LPA): e.g., `12`

#### **External Platform Integration** (Optional)
- GitHub Username: e.g., `"john-doe"`
- LeetCode Username: e.g., `"john_coder"`
- LeetCode Problems Solved: e.g., `150`

#### **Resume Upload** (Optional)
- Click **"Upload Resume"**
- Select a PDF file
- Wait for upload confirmation

### **Step 3: Save Profile**

1. Click the **"Save Profile"** button at the bottom
2. Wait for success message
3. Profile data should be saved to MongoDB

---

## 🔍 Verify Database Update

### **Method 1: Using Prisma Studio (Recommended)**

```powershell
# Navigate to backend directory
cd backend

# Open Prisma Studio
npm run prisma:studio
```

This will open a GUI at **http://localhost:5555**

**What to check:**
1. Click on **"User"** collection
   - Verify your new user exists
   - Check email, name, createdAt
   - Copy the user's ID

2. Click on **"Profile"** collection
   - Verify profile exists with correct userId
   - Check all fields: college, branch, year, cgpa
   - Verify skills array has your skills
   - Verify targetCompanies and targetRoles arrays
   - Check githubUsername, leetcodeUsername
   - Verify updatedAt timestamp

### **Method 2: Using MongoDB Atlas Dashboard**

1. Go to https://cloud.mongodb.com/
2. Sign in with your account
3. Click on your cluster
4. Click **"Browse Collections"**
5. Select **"placement_prediction"** database
6. View collections:
   - **User** - Check your registered user
   - **Profile** - Check your profile data

### **Method 3: Using MongoDB Compass** (If you have it installed)

```
Connection String:
mongodb+srv://poojitha_doppa:Pujitha_23341a1230@cluster0.xplqfsp.mongodb.net/placement_prediction
```

1. Open MongoDB Compass
2. Paste connection string
3. Connect
4. Browse **placement_prediction** database
5. View **User** and **Profile** collections

---

## 🎯 What Should Happen

### **Successful Registration Flow:**

1. ✅ User created in `User` collection with:
   - Unique email
   - Hashed password
   - Name
   - Timestamps

2. ✅ Profile created in `Profile` collection with:
   - Link to user via `userId`
   - All fields you filled in
   - Arrays for skills, companies, roles
   - Default values for optional fields

3. ✅ Relationship established:
   - Profile.userId → User.id

### **Expected Console Output (Backend):**

```
📝 Update profile request received
User ID: 507f1f77bcf86cd799439011
User Email: yourmail@example.com
Request body: { college: "...", branch: "...", ... }
✅ Validation passed
✅ Profile updated successfully
```

### **Expected UI Behavior:**

- Success message appears after saving
- Data persists on page reload
- Profile data available for analytics
- Roadmap generation can use your data

---

## 🧩 Profile Page UI Sections

### **1. Header Section**
- Page title: "My Profile"
- Save button (top right)

### **2. Personal Information Card**
- Name field
- Email field (read-only)
- College field
- Branch field
- Graduation Year (number field)
- CGPA (0-10 scale)

### **3. Skills Section**
- Input field + Add button
- Chip display of all skills
- Remove button (X) on each chip

### **4. Target Companies Section**
- Input field + Add button
- Chip display of companies
- Remove button on each chip

### **5. Target Roles Section**
- Input field + Add button
- Chip display of roles
- Remove button on each chip

### **6. Career Goals Section**
- Minimum Package (LPA) field
- Available Hours per Week field

### **7. External Platforms Section**
- GitHub username field
- LeetCode username field
- LeetCode problems solved field
- Codeforces username field

### **8. Resume Upload Section**
- Upload button
- Current resume display (if uploaded)
- Download button (if resume exists)

---

## 🐛 Troubleshooting

### **Profile not saving:**
- Check backend console for errors
- Verify MongoDB connection string in `.env`
- Ensure backend server is running
- Check browser console for API errors

### **Data not appearing in database:**
- Run `npm run prisma:generate` in backend
- Verify token is valid (check localStorage)
- Clear browser cache and login again
- Check if profile creation happens on first save

### **Resume upload failing:**
- Check if `backend/uploads/resumes/` directory exists
- Verify file size (< 5MB recommended)
- Ensure file is PDF format
- Check multer middleware configuration

---

## 📊 Related Collections (Created but not in Profile UI)

These collections are created but used by other features:

- **Roadmap** - Generated learning roadmaps
- **RoadmapWeek** - Weekly breakdown of roadmap
- **RoadmapTask** - Individual tasks
- **ProgressLog** - User progress tracking
- **SkillAnalytics** - Skill development metrics
- **CompanyMatch** - Company fit scores
- **OptimizationInsight** - AI recommendations
- **ExternalIntegration** - Platform connections
- **ExternalMetric** - External platform data
- **AgentLog** - AI agent interaction logs

---

## ✅ Testing Checklist

- [ ] Demo credentials removed from login page
- [ ] New user registration works
- [ ] Profile page loads after registration
- [ ] All profile fields can be edited
- [ ] Skills can be added/removed
- [ ] Target companies can be added/removed
- [ ] Target roles can be added/removed
- [ ] Profile saves successfully
- [ ] Success message appears after save
- [ ] Data persists after page reload
- [ ] User appears in MongoDB User collection
- [ ] Profile appears in MongoDB Profile collection
- [ ] Profile.userId correctly links to User.id
- [ ] All field values match what was entered

---

## 🚀 Next Steps After Verification

Once you confirm the database is updating:

1. Test other pages with your profile data
2. Generate a personalized roadmap
3. View analytics based on your profile
4. Test company matching
5. Upload resume and extract data
6. Connect external platforms

**Ready to test! Go to http://localhost:5173/ and create your account!** 🎉
