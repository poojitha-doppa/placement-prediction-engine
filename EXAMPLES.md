# Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Step 1: Install Dependencies
```bash
cd "c:\Users\LUCKY\OneDrive\Desktop\project\Placement Prediction"
npm install
```

### Step 2: Start Development Server
```bash
npm run dev
```

The app will open at `http://localhost:5173`

### Step 3: Explore the Dashboard
Navigate through the 5 main pages:
1. **Dashboard** - Overview and KPIs
2. **Profile** - Update your information
3. **Roadmap** - 16-week learning plan
4. **Companies** - Job opportunities
5. **Analytics** - Optimization insights

---

## 🎯 Common Use Cases & Examples

### Example 1: Adding a New KPI Card to Dashboard

```tsx
// In DashboardPage.tsx

import KpiCard from '@/components/ui/KpiCard';
import { Code } from '@mui/icons-material';

// Add to Grid container
<Grid item xs={12} sm={6} md={3}>
  <KpiCard
    title="Code Quality Score"
    value="A+"
    subtitle="Based on recent commits"
    trend={{ value: 15, direction: 'up' }}
    icon={<Code />}
    color="info"
  />
</Grid>
```

### Example 2: Creating a Custom Chart Component

```tsx
// src/components/ui/CustomBarChart.tsx

import { Card, CardContent, Typography } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

interface CustomBarChartProps {
  data: Array<{ name: string; value: number }>;
  title: string;
}

export default function CustomBarChart({ data, title }: CustomBarChartProps) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6">{title}</Typography>
        <BarChart width={400} height={300} data={data}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" fill="#2563eb" />
        </BarChart>
      </CardContent>
    </Card>
  );
}
```

### Example 3: Adding a New API Endpoint

```tsx
// In src/api/mockApi.ts

// 1. Define the type
interface CodeQualityMetrics {
  score: string;
  linesOfCode: number;
  codeSmells: number;
  testCoverage: number;
}

// 2. Create mock data
export const mockCodeQuality: CodeQualityMetrics = {
  score: 'A+',
  linesOfCode: 15420,
  codeSmells: 3,
  testCoverage: 92,
};

// 3. Add API function
export const api = {
  // ... existing methods
  
  async getCodeQuality(): Promise<ApiResponse<CodeQualityMetrics>> {
    await delay(500);
    return {
      success: true,
      data: mockCodeQuality,
      timestamp: new Date().toISOString(),
    };
  },
};
```

### Example 4: Using the API in a Page

```tsx
// In any page component

import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/mockApi';

export default function MyPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['codeQuality'],
    queryFn: () => api.getCodeQuality(),
  });

  if (isLoading) return <CircularProgress />;
  if (error) return <Alert severity="error">Failed to load</Alert>;

  const metrics = data?.data;

  return (
    <Box>
      <Typography variant="h4">Code Quality: {metrics?.score}</Typography>
      <Typography>Lines of Code: {metrics?.linesOfCode}</Typography>
      <Typography>Test Coverage: {metrics?.testCoverage}%</Typography>
    </Box>
  );
}
```

### Example 5: Creating a New Page

```tsx
// src/pages/MyNewPage.tsx

import { Box, Typography, Paper } from '@mui/material';

export default function MyNewPage() {
  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        My New Feature
      </Typography>
      
      <Paper sx={{ p: 3 }}>
        <Typography>Content goes here</Typography>
      </Paper>
    </Box>
  );
}

// Add route in App.tsx
import MyNewPage from './pages/MyNewPage';

<Routes>
  {/* ... existing routes */}
  <Route path="/my-new-page" element={<MyNewPage />} />
</Routes>

// Add navigation in Sidebar.tsx
const navItems: NavItem[] = [
  // ... existing items
  { title: 'My Feature', path: '/my-new-page', icon: <MyIcon /> },
];
```

### Example 6: Updating Profile with Form

```tsx
// Simplified example from ProfilePage.tsx

const [formData, setFormData] = useState<Partial<StudentProfile>>({});

const updateMutation = useMutation({
  mutationFn: (data: Partial<StudentProfile>) => 
    api.updateStudentProfile(data),
  onSuccess: () => {
    alert('Profile updated!');
  },
});

const handleSave = () => {
  updateMutation.mutate(formData);
};

return (
  <Box>
    <TextField
      label="Name"
      value={formData.name || ''}
      onChange={(e) => 
        setFormData(prev => ({ ...prev, name: e.target.value }))
      }
    />
    <Button onClick={handleSave}>Save</Button>
  </Box>
);
```

### Example 7: Exporting to PDF

```tsx
// Add to any page

import { Button } from '@mui/material';
import { Download } from '@mui/icons-material';
import { exportDashboardToPdf } from '@/utils/pdfExport';

export default function DashboardPage() {
  const handleExport = async () => {
    try {
      await exportDashboardToPdf();
      alert('PDF exported successfully!');
    } catch (error) {
      alert('Export failed');
    }
  };

  return (
    <Box id="dashboard-content">
      <Button
        variant="contained"
        startIcon={<Download />}
        onClick={handleExport}
      >
        Export to PDF
      </Button>
      {/* Dashboard content */}
    </Box>
  );
}
```

### Example 8: Responsive Grid Layout

```tsx
import { Grid, Paper, Typography } from '@mui/material';

export default function ResponsiveExample() {
  return (
    <Grid container spacing={3}>
      {/* Full width on mobile, half on tablet, quarter on desktop */}
      <Grid item xs={12} sm={6} md={3}>
        <Paper sx={{ p: 2 }}>
          <Typography>Card 1</Typography>
        </Paper>
      </Grid>
      
      <Grid item xs={12} sm={6} md={3}>
        <Paper sx={{ p: 2 }}>
          <Typography>Card 2</Typography>
        </Paper>
      </Grid>
      
      {/* Add more grid items */}
    </Grid>
  );
}
```

### Example 9: Custom Hook for Data Fetching

```tsx
// src/hooks/usePlacementData.ts

import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/mockApi';

export function usePlacementData() {
  const summary = useQuery({
    queryKey: ['placementSummary'],
    queryFn: () => api.getPlacementSummary(),
  });

  const skills = useQuery({
    queryKey: ['skillAnalytics'],
    queryFn: () => api.getSkillAnalytics(),
  });

  return {
    summary: summary.data?.data,
    skills: skills.data?.data,
    isLoading: summary.isLoading || skills.isLoading,
    error: summary.error || skills.error,
  };
}

// Usage in component
import { usePlacementData } from '@/hooks/usePlacementData';

export default function MyComponent() {
  const { summary, skills, isLoading } = usePlacementData();
  
  if (isLoading) return <CircularProgress />;
  
  return <Box>{/* Use summary and skills */}</Box>;
}
```

### Example 10: Theme Customization

```tsx
// In src/theme.ts

// Change primary color
palette: {
  primary: {
    main: '#8b5cf6',  // Purple instead of blue
    light: '#c4b5fd',
    dark: '#6d28d9',
  },
}

// Change font
typography: {
  fontFamily: '"Inter", "Roboto", sans-serif',
}

// Change border radius
shape: {
  borderRadius: 12,  // More rounded corners
}
```

---

## 🔧 Customization Checklist

- [ ] Update mock data in `src/api/mockApi.ts`
- [ ] Customize theme colors in `src/theme.ts`
- [ ] Add your logo to `src/components/layout/Sidebar.tsx`
- [ ] Replace placeholder student name in `src/App.tsx`
- [ ] Configure API endpoints for production
- [ ] Add authentication if needed
- [ ] Customize page titles and descriptions
- [ ] Add your own charts and visualizations
- [ ] Configure PDF export settings

---

## 🐛 Troubleshooting

### Issue: Port already in use
```bash
# Change port in vite.config.ts
export default defineConfig({
  server: {
    port: 3000  // Change from default 5173
  }
});
```

### Issue: Module not found
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue: TypeScript errors
```bash
# Check tsconfig.json and ensure paths are correct
# Restart VS Code TypeScript server: Ctrl+Shift+P -> "Restart TS Server"
```

### Issue: Charts not displaying
```bash
# Ensure Recharts is installed
npm install recharts
# Check browser console for errors
```

---

## 📚 Next Steps

1. **Integrate Real API**: Replace mock data with actual backend calls
2. **Add Authentication**: Implement login/signup flows
3. **Add More Features**: Mock interviews, study materials, peer comparison
4. **Deploy**: Host on Vercel, Netlify, or your preferred platform
5. **Testing**: Add unit tests with Jest and React Testing Library
6. **Analytics**: Integrate Google Analytics or similar
7. **PWA**: Add service worker for offline support

---

## 🎓 Learning Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Material UI Docs](https://mui.com/material-ui/getting-started/)
- [React Query Guide](https://tanstack.com/query/latest)
- [Recharts Examples](https://recharts.org/en-US/examples)

---

**Happy Coding! 🚀**
