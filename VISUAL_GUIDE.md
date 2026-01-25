# Visual Project Guide

## 🗺️ Application Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         APPLICATION START                        │
│                          (index.html)                            │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                        main.tsx (Entry Point)                    │
│  • React.StrictMode wrapper                                      │
│  • Mounts App component to #root                                 │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                          App.tsx                                 │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ QueryClientProvider (React Query)                          │ │
│  │  └─ ThemeProvider (Material UI)                            │ │
│  │      └─ BrowserRouter (React Router)                       │ │
│  │          └─ MainLayout                                     │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                        MainLayout                                │
│  ┌──────────────┐  ┌──────────────────────────────────────┐    │
│  │   Sidebar    │  │         TopNavbar                    │    │
│  │  (Desktop:   │  │  • Hamburger (Mobile)                │    │
│  │   Visible    │  │  • Welcome Message                   │    │
│  │   Mobile:    │  │  • Notifications                     │    │
│  │   Drawer)    │  │  • Profile Menu                      │    │
│  └──────────────┘  └──────────────────────────────────────┘    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Content Area (Routes)                       │  │
│  │  • DashboardPage    (/)                                  │  │
│  │  • ProfilePage      (/profile)                           │  │
│  │  • RoadmapPage      (/roadmap)                           │  │
│  │  • CompaniesPage    (/companies)                         │  │
│  │  • AnalyticsPage    (/analytics)                         │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 Dashboard Page Structure

```
┌────────────────────────────────────────────────────────────────┐
│                       DASHBOARD PAGE                            │
├────────────────────────────────────────────────────────────────┤
│  Header: "Dashboard Overview" + [Update Profile] [Refresh]     │
├────────────────────────────────────────────────────────────────┤
│  KPI Cards Row (4 cards)                                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │ Overall  │  │  20+ LPA │  │ Problems │  │  Streak  │      │
│  │   82%    │  │   68%    │  │   485    │  │ 12 days  │      │
│  │   ⬆ 8%  │  │  ⬆ 12%  │  │   ⬆ 5%  │  │  ⬆ 3%   │      │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘      │
├────────────────────────────────────────────────────────────────┤
│  Charts Row                                                     │
│  ┌─────────────────┐  ┌──────────────────────────────────┐    │
│  │   Gauge Chart   │  │    Line Chart (Skills)           │    │
│  │   (Placement    │  │    • DSA Line                    │    │
│  │   Readiness)    │  │    • CS Fundamentals Line        │    │
│  │      82%        │  │    • System Design Line          │    │
│  │                 │  │    • Language Line               │    │
│  │    ◐◑◒◓◔      │  │    • Behavioral Line             │    │
│  └─────────────────┘  └──────────────────────────────────┘    │
├────────────────────────────────────────────────────────────────┤
│  Top 3 Companies                                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │  Amazon     │  │  Microsoft  │  │   Google    │          │
│  │  Fit: 85%   │  │  Fit: 78%   │  │  Fit: 72%   │          │
│  │  Success:   │  │  Success:   │  │  Success:   │          │
│  │    82%      │  │    75%      │  │    68%      │          │
│  │  Gaps: SD,  │  │  Gaps: C#,  │  │  Gaps: Adv  │          │
│  │  Leadership │  │  Azure      │  │  Algo, Dist │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
├────────────────────────────────────────────────────────────────┤
│  [View Full Roadmap]  [Detailed Analytics]                     │
└────────────────────────────────────────────────────────────────┘
```

---

## 👤 Profile Page Layout

```
┌────────────────────────────────────────────────────────────────┐
│                       PROFILE PAGE                              │
├────────────────────────────────────────────────────────────────┤
│  Header: "Student Profile"                                      │
├─────────────────────────────────┬──────────────────────────────┤
│  LEFT COLUMN (66%)              │  RIGHT COLUMN (33%)          │
│                                 │                              │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐│
│  │ Basic Information       │   │  │ Resume Upload           ││
│  │ • Name (TextField)      │   │  │  ┌─────────────────┐   ││
│  │ • College (TextField)   │   │  │  │  Drop/Click     │   ││
│  │ • Branch (TextField)    │   │  │  │  PDF/DOCX       │   ││
│  │ • Year (TextField)      │   │  │  └─────────────────┘   ││
│  │ • CGPA (TextField)      │   │  │  [✓ uploaded]           ││
│  └─────────────────────────┘   │  └─────────────────────────┘│
│                                 │                              │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐│
│  │ Skills & Technologies   │   │  │ Target Companies        ││
│  │ [Add Skill Input] [+]   │   │  │ [Google] [Microsoft]    ││
│  │ [JavaScript] [React]    │   │  │ [Amazon] [Meta]         ││
│  │ [Node.js] [Python] ...  │   │  │ [Apple]                 ││
│  └─────────────────────────┘   │  └─────────────────────────┘│
│                                 │                              │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐│
│  │ Coding Profiles         │   │  │ Target Roles            ││
│  │ [GitHub] github.com/... │   │  │ [Software Engineer]     ││
│  │         [✓ connected]   │   │  │ [Backend Developer]     ││
│  │ [LeetCode] leetcode/... │   │  │ [Full Stack Dev]        ││
│  │         [✓ connected]   │   │  │ Min Package: ₹20 LPA+   ││
│  └─────────────────────────┘   │  └─────────────────────────┘│
├─────────────────────────────────┴──────────────────────────────┤
│                 [Cancel]  [Save Changes]                        │
└────────────────────────────────────────────────────────────────┘
```

---

## 🗺️ Roadmap Page Structure

```
┌────────────────────────────────────────────────────────────────┐
│                       ROADMAP PAGE                              │
├────────────────────────────────────────────────────────────────┤
│  Header: "16-Week Roadmap" + [Regenerate Roadmap]              │
├────────────────────────────────────────────────────────────────┤
│  Overall Progress: ████████░░░░░░░░  45%                       │
│  Generated on: Dec 15, 2025                                     │
├────────────────────────────────────────────────────────────────┤
│  [Phase 1] [Phase 2] [Phase 3] [Phase 4] ← Tabs               │
├────────────────────────────────────────────────────────────────┤
│  Week Cards (expandable)                                        │
│                                                                 │
│  ┌──────────────────────────────────────────────────────┐     │
│  │ [1] Week 1  [Arrays] [Strings]        █████ 100%     │     │
│  │ ▼ Expanded                                            │     │
│  │   Targets:                                            │     │
│  │   ☑ Solve 15 easy array problems                     │     │
│  │   ☑ Master two-pointer technique                     │     │
│  │   ☑ Complete string manipulation                     │     │
│  │   Expected Outcomes:                                  │     │
│  │   • Strong foundation in basic data structures        │     │
│  │   Progress: [━━━━━━━━━━] 100%                        │     │
│  │   Estimated: 20 hours                                 │     │
│  └──────────────────────────────────────────────────────┘     │
│                                                                 │
│  ┌──────────────────────────────────────────────────────┐     │
│  │ [2] Week 2  [Linked Lists] [Stacks]  ██████░ 85%     │     │
│  │ ▶ Click to expand...                                  │     │
│  └──────────────────────────────────────────────────────┘     │
│                                                                 │
│  [More weeks...]                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## 🏢 Companies Page Visualization

```
┌────────────────────────────────────────────────────────────────┐
│                     COMPANIES & OPPORTUNITIES                   │
├────────────────────────────────────────────────────────────────┤
│  Summary Stats                                                  │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐                      │
│  │  8   │  │  3   │  │  2   │  │ ₹65L │                      │
│  │Total │  │High  │  │Medium│  │ Max  │                      │
│  └──────┘  └──────┘  └──────┘  └──────┘                      │
├────────────────────────────────────────────────────────────────┤
│  Top 5 Companies Chart (Horizontal Bars)                        │
│  Amazon     ████████████████░░░  85%                          │
│  Microsoft  ██████████████░░░░░  78%                          │
│  Google     ████████████░░░░░░░  72%                          │
│  Meta       ███████████░░░░░░░░  65%                          │
│  Atlassian  ████████████░░░░░░░  70%                          │
├────────────────────────────────────────────────────────────────┤
│  Companies Table                                                │
│  ┌────────┬─────────┬─────┬────────┬─────────┬──────┬─────┐  │
│  │Company │ Role    │ Fit │Success │ Package │ Gaps │View │  │
│  ├────────┼─────────┼─────┼────────┼─────────┼──────┼─────┤  │
│  │Amazon  │SDE      │ 85% │  82%   │42-58 L  │SD,LP │[👁] │  │
│  │MS      │SWE      │ 78% │  75%   │38-52 L  │C#,Az │[👁] │  │
│  │Google  │SWE      │ 72% │  68%   │45-65 L  │Algo  │[👁] │  │
│  └────────┴─────────┴─────┴────────┴─────────┴──────┴─────┘  │
└────────────────────────────────────────────────────────────────┘
```

---

## 📈 Analytics Page Layout

```
┌────────────────────────────────────────────────────────────────┐
│                   ANALYTICS & OPTIMIZATION                      │
├────────────────────────────────────────────────────────────────┤
│  Key Metrics                                                    │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐                        │
│  │   22%   │  │  12.8   │  │    5    │                        │
│  │Time Save│  │ Weeks   │  │ Topics  │                        │
│  └─────────┘  └─────────┘  └─────────┘                        │
├────────────────────────────────────────────────────────────────┤
│  🎯 Suggested Focus for This Week                              │
│  [Dynamic Programming] [System Design Basics]                  │
│  Focus on DP this week as it has the highest impact...         │
│  Estimated Impact: +12% on placement probability               │
├────────────────────────────────────────────────────────────────┤
│  ┌───────────────────────┐  ┌───────────────────────────┐    │
│  │  Radar: Skill Gaps    │  │  Monte Carlo Distribution  │    │
│  │       DSA             │  │        ▁▂▅█▆▃▁            │    │
│  │        /\             │  │  Probability of reaching   │    │
│  │       /  \            │  │  target in X weeks         │    │
│  │      /    \           │  │  Peak at 13 weeks (28%)    │    │
│  │  Behav──Lang          │  │                            │    │
│  │      \    /           │  │                            │    │
│  │       \  /            │  │                            │    │
│  │        \/             │  │                            │    │
│  │     SysDes            │  │                            │    │
│  │  [Current] [Target]   │  │                            │    │
│  └───────────────────────┘  └───────────────────────────┘    │
├────────────────────────────────────────────────────────────────┤
│  Topic Priority Table (Ranked)                                 │
│  ┌────┬─────────────────┬────────┬──────┬──────┬───────────┐ │
│  │ #  │ Topic           │Priority│ Gap  │Hours │ Reason    │ │
│  ├────┼─────────────────┼────────┼──────┼──────┼───────────┤ │
│  │ 1  │ Dynamic Prog    │ 95/100 │60→90 │ 40h  │High impact│ │
│  │ 2  │ Dist Systems    │ 88/100 │55→85 │ 35h  │Critical   │ │
│  │ 3  │ Graph Algos     │ 82/100 │65→88 │ 30h  │Common     │ │
│  └────┴─────────────────┴────────┴──────┴──────┴───────────┘ │
└────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Component Reusability Map

```
                        ┌──────────────┐
                        │  KpiCard     │
                        └──────┬───────┘
                               │ Used in:
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
   DashboardPage          ProfilePage          CompaniesPage
   (4 instances)          (stats)              (summary)


                        ┌──────────────┐
                        │  WeekCard    │
                        └──────┬───────┘
                               │ Used in:
                        ┌──────┴──────┐
                        │             │
                   RoadmapPage    (16 instances)


              ┌──────────────────────────────┐
              │  Charts (Recharts-based)     │
              └──────────┬───────────────────┘
                         │ Used in:
        ┌────────────────┼────────────────┬──────────────┐
        │                │                │              │
   GaugeChart      LineChartSkills   RadarChart    BarChart
   (Dashboard)     (Dashboard)       (Analytics)   (Companies)
```

---

## 💾 Data Flow: Profile Update Example

```
User fills form
      │
      ▼
[Save Changes] clicked
      │
      ▼
useState updates formData
      │
      ▼
useMutation triggered
      │
      ▼
api.updateStudentProfile(formData)
      │
      ▼
Mock API (500ms delay)
      │
      ▼
Success response
      │
      ▼
queryClient.invalidateQueries(['studentProfile'])
      │
      ▼
useQuery refetches automatically
      │
      ▼
Component re-renders with new data
      │
      ▼
Success snackbar shown
```

---

## 📱 Responsive Breakpoint Behavior

```
Mobile (< 600px)          Tablet (600-900px)       Desktop (> 900px)
┌──────────────┐          ┌──────────────────┐     ┌─────────────────────────┐
│ [☰] Header   │          │ [☰] Header       │     │[Sidebar]│   Header      │
├──────────────┤          ├──────────────────┤     ├─────────┼───────────────┤
│              │          │                  │     │  Nav    │               │
│   KPI Card   │          │ [Card1] [Card2]  │     │ Items   │ [C1][C2][C3]  │
│   (Full)     │          │ [Card3] [Card4]  │     │         │ [C4]          │
│              │          │                  │     │         │               │
│   KPI Card   │          │      Chart       │     │         │   Charts      │
│   (Full)     │          │     (Full)       │     │         │  [Chart1]     │
│              │          │                  │     │         │  [Chart2]     │
│    Chart     │          │      Table       │     │         │               │
│   (Stacked)  │          │     (Cards)      │     │         │     Table     │
└──────────────┘          └──────────────────┘     └─────────┴───────────────┘

Sidebar: Drawer            Sidebar: Drawer          Sidebar: Persistent
Charts: Vertical           Charts: 1-2 col          Charts: Multi-column
Tables: Cards              Tables: Responsive       Tables: Full width
```

---

## 🎨 Theme Structure

```
theme.ts
├── palette
│   ├── primary (#2563eb - Blue)
│   ├── secondary (#7c3aed - Purple)
│   ├── success (#10b981 - Green)
│   ├── warning (#f59e0b - Amber)
│   ├── error (#ef4444 - Red)
│   ├── info (#06b6d4 - Cyan)
│   ├── background
│   │   ├── default (#f8fafc)
│   │   └── paper (#ffffff)
│   └── text
│       ├── primary (#0f172a)
│       └── secondary (#64748b)
├── typography
│   ├── fontFamily (System fonts)
│   ├── h1-h6 (weights, sizes)
│   └── button (textTransform: none)
├── shape
│   └── borderRadius (8px)
└── components
    ├── MuiButton (custom styles)
    ├── MuiCard (border radius 12px)
    └── MuiTextField (outlined default)
```

---

**This visual guide provides a clear understanding of the application structure, layout, and component relationships!**
