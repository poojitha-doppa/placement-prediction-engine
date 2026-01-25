# Component Tree & Architecture Documentation

## 🌳 Complete Component Tree

```
App
├── QueryClientProvider (React Query)
├── ThemeProvider (Material UI)
└── BrowserRouter
    └── MainLayout
        ├── Sidebar
        │   ├── Brand/Logo
        │   ├── Navigation List
        │   │   ├── Dashboard Link
        │   │   ├── Profile Link
        │   │   ├── Roadmap Link
        │   │   ├── Companies Link
        │   │   └── Analytics Link
        │   └── Footer
        ├── TopNavbar
        │   ├── Mobile Menu Toggle
        │   ├── Welcome Message
        │   ├── Notifications Menu
        │   ├── Settings Button
        │   └── Profile Menu
        │       ├── User Info
        │       ├── Profile Link
        │       ├── Settings Link
        │       └── Logout
        └── Routes
            ├── DashboardPage (/)
            │   ├── Header Section
            │   ├── KPI Cards Grid (4 cards)
            │   │   ├── KpiCard (Overall Placement Probability)
            │   │   ├── KpiCard (20+ LPA Probability)
            │   │   ├── KpiCard (Problems Solved)
            │   │   └── KpiCard (Current Streak)
            │   ├── Charts Section
            │   │   ├── GaugeChart (Placement Readiness)
            │   │   └── LineChartSkills (Skill Progression)
            │   ├── Top Companies Section
            │   │   └── Company Cards (Top 3)
            │   └── Quick Actions
            │
            ├── ProfilePage (/profile)
            │   ├── Header Section
            │   ├── Main Content (Left Column)
            │   │   ├── Basic Information Form
            │   │   │   ├── Name TextField
            │   │   │   ├── College TextField
            │   │   │   ├── Branch TextField
            │   │   │   ├── Graduation Year TextField
            │   │   │   └── CGPA TextField
            │   │   ├── Skills Section
            │   │   │   ├── Add Skill Input
            │   │   │   └── Skills Chips (with delete)
            │   │   └── Coding Profiles Section
            │   │       ├── GitHub URL Input + Status Chip
            │   │       └── LeetCode URL Input + Status Chip
            │   ├── Sidebar (Right Column)
            │   │   ├── Resume Upload Section
            │   │   ├── Target Companies Section
            │   │   └── Target Roles Section
            │   └── Save/Cancel Buttons
            │
            ├── RoadmapPage (/roadmap)
            │   ├── Header Section
            │   ├── Overall Progress Section
            │   │   └── ProgressBar
            │   ├── Phase Tabs
            │   │   ├── Phase 1: Foundations (Weeks 1-4)
            │   │   ├── Phase 2: Advanced DSA (Weeks 5-8)
            │   │   ├── Phase 3: System Design (Weeks 9-12)
            │   │   └── Phase 4: Interview Prep (Weeks 13-16)
            │   ├── Week Cards (per phase)
            │   │   └── WeekCard (x4 per phase)
            │   │       ├── Week Header
            │   │       ├── Focus Areas Chips
            │   │       ├── Progress Indicator
            │   │       ├── Targets List (expandable)
            │   │       ├── Expected Outcomes List
            │   │       └── Progress Slider
            │   ├── All Weeks Overview Section
            │   │   └── WeekCard (x16)
            │   └── Regenerate Dialog
            │
            ├── CompaniesPage (/companies)
            │   ├── Header Section
            │   ├── Summary Stats Grid (4 cards)
            │   │   ├── Total Matches Card
            │   │   ├── High Fit Card
            │   │   ├── Medium Fit Card
            │   │   └── Max Package Card
            │   ├── Top Companies Chart
            │   │   └── BarChart (Horizontal)
            │   ├── Companies Table
            │   │   └── CompanyTable
            │   │       └── Table Rows (with View button)
            │   └── Company Details Dialog
            │       ├── Company Name & Fit Score
            │       ├── Role
            │       ├── Package Range
            │       ├── Success Probability
            │       ├── Required Skills (Chips)
            │       └── Key Gaps (Chips)
            │
            └── AnalyticsPage (/analytics)
                ├── Header Section
                ├── Key Metrics Grid (3 cards)
                │   ├── Time Reduction Card
                │   ├── Expected Weeks Card
                │   └── Priority Topics Card
                ├── Weekly Focus Recommendation
                │   ├── Topic Chips
                │   └── Explanation
                ├── Charts Section
                │   ├── RadarSkillGapChart (Current vs Target)
                │   └── Monte Carlo Distribution
                │       └── AreaChart
                └── Topic Priority Table
                    └── Priority Rows (ranked)
```

## 🏗️ Architecture Patterns

### 1. Layout Pattern
- **MainLayout**: Wrapper component providing consistent structure
- **Sidebar**: Persistent navigation (collapsible on mobile)
- **TopNavbar**: Global actions and user info
- **Content Area**: Dynamic page content

### 2. Data Fetching Pattern
```tsx
// Using React Query
const { data, isLoading, error } = useQuery({
  queryKey: ['keyName'],
  queryFn: () => api.fetchData(),
});

// Mutations for updates
const mutation = useMutation({
  mutationFn: (data) => api.updateData(data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['keyName'] });
  },
});
```

### 3. Component Composition Pattern
```tsx
// Page Level (Container)
<DashboardPage>
  {/* Business logic, data fetching */}
  
  // UI Components (Presentational)
  <KpiCard {...props} />
  <GaugeChart {...props} />
</DashboardPage>
```

### 4. Responsive Pattern
```tsx
// Material UI breakpoints
sx={{
  display: { xs: 'block', md: 'flex' },
  width: { xs: '100%', md: '50%' },
}}

// xs: < 600px (mobile)
// sm: 600px - 900px (tablet)
// md: 900px - 1200px (desktop)
// lg: 1200px - 1536px (large desktop)
// xl: > 1536px (extra large)
```

## 📦 State Management Strategy

### Server State (React Query)
- API data caching
- Background refetching
- Optimistic updates
- Loading/error states

**Managed by React Query:**
- Student profile
- Placement summary
- Roadmap data
- Skill analytics
- Company matches
- Optimization insights

### Local State (useState)
- Form inputs
- UI toggles (dialogs, menus)
- Temporary selections
- Component-specific state

### Example State Flow
```
User Action (e.g., Update Profile)
       ↓
   Form State (useState)
       ↓
   Submit Handler
       ↓
   Mutation (useMutation)
       ↓
   API Call (api.updateStudentProfile)
       ↓
   Cache Invalidation
       ↓
   Automatic Refetch (useQuery)
       ↓
   UI Update
```

## 🎯 Component Responsibility Matrix

| Component | Responsibility | State | Props |
|-----------|---------------|-------|-------|
| **MainLayout** | App structure, routing wrapper | Mobile menu toggle | children, studentName |
| **Sidebar** | Navigation links | None | mobileOpen, onMobileToggle |
| **TopNavbar** | User actions, notifications | Menu anchors | onMobileMenuToggle, studentName |
| **KpiCard** | Display metric with trend | None | title, value, subtitle, trend, icon, color |
| **GaugeChart** | Circular percentage display | None | value, label, color, size |
| **LineChartSkills** | Multi-line skill chart | None | data, height |
| **RadarSkillGapChart** | Skill comparison radar | None | current, target, height |
| **CompanyTable** | Companies data table | None | companies, onViewDetails |
| **WeekCard** | Roadmap week details | Local progress | week, onUpdateProgress |
| **ProgressBar** | Linear progress indicator | None | value, label, showPercentage, color |
| **DashboardPage** | Overview orchestration | Query state | None |
| **ProfilePage** | Profile CRUD operations | Form data, mutations | None |
| **RoadmapPage** | Roadmap display/update | Tab state, mutations | None |
| **CompaniesPage** | Company matching display | Dialog state | None |
| **AnalyticsPage** | Analytics visualization | Query state | None |

## 🔄 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│                     React Query Cache                    │
│  ┌───────────┐  ┌──────────┐  ┌─────────┐  ┌─────────┐ │
│  │  Profile  │  │ Roadmap  │  │ Skills  │  │Companies│ │
│  └─────┬─────┘  └────┬─────┘  └────┬────┘  └────┬────┘ │
└────────┼─────────────┼─────────────┼────────────┼──────┘
         │             │             │            │
         ├─────────────┼─────────────┼────────────┤
         │             │             │            │
         ▼             ▼             ▼            ▼
┌─────────────────────────────────────────────────────────┐
│                    Pages (Containers)                    │
│  ┌──────────┐  ┌──────────┐  ┌─────────┐  ┌──────────┐ │
│  │Dashboard │  │ Profile  │  │ Roadmap │  │Companies │ │
│  └────┬─────┘  └────┬─────┘  └────┬────┘  └────┬─────┘ │
└───────┼─────────────┼──────────────┼───────────┼────────┘
        │             │              │           │
        ├─────────────┴──────────────┴───────────┤
        │                                        │
        ▼                                        ▼
┌─────────────────────────────────────────────────────────┐
│              UI Components (Presentational)              │
│  ┌────────┐  ┌──────┐  ┌───────┐  ┌───────┐  ┌──────┐  │
│  │KpiCard │  │Gauge │  │ Line  │  │ Radar │  │Table │  │
│  └────────┘  └──────┘  └───────┘  └───────┘  └──────┘  │
└─────────────────────────────────────────────────────────┘
```

## 🚦 Loading & Error States Pattern

All pages implement consistent loading/error handling:

```tsx
// 1. Loading State
if (isLoading) {
  return <CircularProgress />;
}

// 2. Error State
if (error) {
  return <Alert severity="error">Error message</Alert>;
}

// 3. Success State
return <ComponentContent />;
```

## 🎨 Styling Approach

### Material UI sx prop
```tsx
<Box
  sx={{
    p: 3,                              // padding: 24px
    mb: 4,                             // margin-bottom: 32px
    border: `1px solid ${divider}`,    // theme-aware
    borderRadius: 2,                   // 16px (8px * 2)
    '&:hover': {                       // pseudo-selectors
      boxShadow: 4,
    },
  }}
>
```

### Theme Integration
- All colors from theme palette
- Consistent spacing units (8px grid)
- Responsive breakpoints
- Typography variants

## 🔐 Type Safety

Every component has TypeScript interfaces:

```tsx
// 1. Component Props
interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  // ...
}

// 2. Data Models
interface StudentProfile {
  id: string;
  name: string;
  // ...
}

// 3. API Responses
interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}
```

## 📱 Mobile-First Approach

1. **Layout**: Single column on mobile, multi-column on desktop
2. **Navigation**: Hamburger menu on mobile, persistent sidebar on desktop
3. **Tables**: Responsive cards on mobile, full tables on desktop
4. **Charts**: Adjusted heights and margins for mobile screens
5. **Dialogs**: Full-screen on mobile, centered modal on desktop

---

This architecture ensures:
- ✅ Scalability
- ✅ Maintainability
- ✅ Type safety
- ✅ Performance
- ✅ Reusability
- ✅ Testability
