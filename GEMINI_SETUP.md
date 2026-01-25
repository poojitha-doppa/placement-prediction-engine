# 🤖 Google Gemini AI Integration Setup

The roadmap generation feature now uses **Google Gemini AI** to create personalized, AI-powered placement preparation roadmaps based on your profile, skills, and goals.

## 🚀 Quick Setup (5 minutes)

### Step 1: Get Your Free Gemini API Key

1. **Visit Google AI Studio**: https://makersuite.google.com/app/apikey
2. **Sign in** with your Google account
3. **Click "Get API Key"** or "Create API Key"
4. **Copy** your API key (starts with `AIza...`)

### Step 2: Add API Key to Your Project

1. **Navigate to the backend folder**:
   ```bash
   cd backend
   ```

2. **Create a `.env` file** (if it doesn't exist):
   ```bash
   # On Windows PowerShell
   New-Item -Path .env -ItemType File
   
   # On Mac/Linux
   touch .env
   ```

3. **Add your Gemini API key** to the `.env` file:
   ```env
   GEMINI_API_KEY=AIzaSy...your-actual-api-key-here...
   ```

4. **Save the file**

### Step 3: Restart the Backend Server

```bash
npm run dev
```

You should see: `✅ Gemini AI initialized for roadmap generation`

## ✨ Features Powered by Gemini AI

### 1. **Personalized Roadmap Generation**
- Analyzes your profile (skills, target companies, CGPA, etc.)
- Creates a customized 16-week study plan
- Adapts based on your available time
- Focuses on your weak areas

### 2. **Smart Weekly Planning**
- Breaks down preparation into manageable phases
- Provides specific, measurable targets
- Includes reasoning for each week's focus
- Estimates realistic time commitment

### 3. **Dynamic Adjustments**
- Can regenerate roadmap as you progress
- Takes into account your progress data
- Aligns with your target companies' requirements

## 📋 How to Use

1. **Complete Your Profile** (required)
   - Go to Profile page
   - Fill in your skills, target companies, and preferences
   - Save your profile

2. **Generate Your Roadmap**
   - Navigate to the Roadmap page
   - Click "Generate AI Roadmap" button
   - Wait 10-30 seconds for Gemini to create your plan
   - Review your personalized 16-week roadmap!

3. **Track Your Progress**
   - Mark tasks as complete
   - Update weekly progress
   - Regenerate roadmap if needed

## 🆓 Gemini API Pricing

**Good news!** Google Gemini offers a generous free tier:

- **Free Tier**: 60 requests per minute
- **No credit card required**
- Perfect for personal projects
- More than enough for roadmap generation

[View current pricing](https://ai.google.dev/pricing)

## 🔒 Security Best Practices

1. **Never commit your `.env` file** to Git (already in .gitignore)
2. **Keep your API key private**
3. **Don't share your API key** in screenshots or public forums
4. **Regenerate your key** if accidentally exposed

## 🐛 Troubleshooting

### "Gemini API key not configured" Error

**Solution**: Make sure you added `GEMINI_API_KEY` to your `.env` file in the `backend` folder

### "Failed to generate roadmap" Error

**Possible causes**:
1. Invalid API key
2. API quota exceeded (free tier limit)
3. Network connectivity issues

**Solutions**:
- Verify your API key is correct
- Check your API quota at: https://makersuite.google.com/app/apikey
- Try again in a few minutes

### Mock Roadmap Displayed Instead of AI Roadmap

**This means**: Gemini API is not configured

**Solution**: Follow Step 1-3 above to add your API key

## 🔄 Without API Key (Fallback)

If you don't set up Gemini, the app will:
- Still work normally
- Use mock roadmap data
- Show a warning: "⚠️ Gemini API key not found"
- You can add the API key anytime later

## 📚 Additional Resources

- [Google AI Studio](https://makersuite.google.com/)
- [Gemini API Documentation](https://ai.google.dev/docs)
- [Get Started Guide](https://ai.google.dev/tutorials/get_started_web)

## 🎯 Example Roadmap Output

With Gemini AI, you'll get:

```json
{
  "durationWeeks": 16,
  "weeklyPlan": [
    {
      "week": 1,
      "phase": "Foundation",
      "focusAreas": ["Arrays and Strings", "Basic Recursion"],
      "targets": [
        "Solve 15 easy array problems on LeetCode",
        "Master two-pointer technique",
        "Understand string manipulation"
      ],
      "expectedOutcomes": [
        "Comfortable with basic array operations",
        "Can solve 2-pointer problems efficiently"
      ],
      "reasoning": "Arrays and strings are fundamental...",
      "priorityScore": 0.95,
      "estimatedHours": 12
    }
    // ... 15 more weeks
  ],
  "globalNotes": [
    "Practice daily for consistency",
    "Focus on understanding patterns",
    "Review and revise regularly"
  ]
}
```

## 💡 Pro Tips

1. **Be detailed in your profile** - More information = Better roadmap
2. **Update your skills** as you learn
3. **Regenerate periodically** to adapt the plan
4. **Track your progress** for better insights

---

**Need help?** Check the console logs for detailed error messages or create an issue on GitHub.
