# 🚀 Setup & Deployment Checklist

## ✅ Development Setup

### Prerequisites Check
- [ ] Node.js 18+ installed (`node --version`)
- [ ] npm or yarn installed (`npm --version`)
- [ ] Git installed (optional, for version control)
- [ ] VS Code or preferred IDE
- [ ] Modern web browser (Chrome, Firefox, Edge)

### Installation Steps
```bash
# 1. Navigate to project directory
cd "c:\Users\LUCKY\OneDrive\Desktop\project\Placement Prediction"

# 2. Install dependencies (first time only)
npm install

# 3. Start development server
npm run dev

# 4. Open browser
# Navigate to http://localhost:5173
```

### Verify Installation
- [ ] Dev server starts without errors
- [ ] Browser opens automatically
- [ ] No console errors in browser DevTools
- [ ] Dashboard page loads correctly
- [ ] Navigation works (click through all 5 pages)
- [ ] Charts render properly

---

## 🎨 Customization Checklist

### Branding
- [ ] Update app title in `index.html` (line 7)
- [ ] Change logo/brand name in `src/components/layout/Sidebar.tsx` (line 47-52)
- [ ] Update favicon in `public/` folder
- [ ] Customize theme colors in `src/theme.ts`
- [ ] Update footer copyright in `Sidebar.tsx` (line 90)

### Content
- [ ] Replace student name in `src/App.tsx` (line 28)
- [ ] Update mock data in `src/api/mockApi.ts`
- [ ] Customize KPI card titles in `src/pages/DashboardPage.tsx`
- [ ] Modify roadmap weeks in `mockRoadmap` data
- [ ] Update company list in `mockCompanyMatches`

### Styling
```tsx
// In src/theme.ts, update:
palette: {
  primary: {
    main: '#YOUR_COLOR',  // Change primary color
  },
  // ... other colors
}

typography: {
  fontFamily: 'Your Font Family',
}
```

### Features
- [ ] Configure PDF export filename format in `src/utils/pdfExport.ts`
- [ ] Adjust React Query cache time in `src/App.tsx` (line 16)
- [ ] Set API timeout values
- [ ] Configure number of items per page in tables

---

## 🔌 Backend Integration Checklist

### API Configuration
1. **Create environment file**
```bash
# Copy template
cp .env.example .env

# Edit .env file
VITE_API_BASE_URL=https://your-api.com/api
```

2. **Update API service** (`src/api/mockApi.ts`)
```tsx
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
  async getStudentProfile() {
    const response = await axiosInstance.get('/student/profile');
    return response.data;
  },
  // ... update all methods
};
```

### API Endpoints to Implement
- [ ] `GET /api/student/profile` - Student profile
- [ ] `PUT /api/student/profile` - Update profile
- [ ] `GET /api/student/placement-summary` - Placement summary
- [ ] `GET /api/student/roadmap` - Roadmap data
- [ ] `PUT /api/student/roadmap/week/:id` - Update week progress
- [ ] `POST /api/student/roadmap/regenerate` - Regenerate roadmap
- [ ] `GET /api/student/skill-analytics` - Skill data
- [ ] `GET /api/student/company-matches` - Company matches
- [ ] `GET /api/student/optimization-insights` - Optimization data

### Authentication Setup (Optional)
```tsx
// Add auth context in src/contexts/AuthContext.tsx
// Update API service to include auth headers
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

---

## 🧪 Testing Checklist

### Manual Testing
- [ ] Test all navigation links
- [ ] Verify all forms submit correctly
- [ ] Test skill add/remove functionality
- [ ] Check week progress slider updates
- [ ] Test company details dialog
- [ ] Verify charts render with data
- [ ] Test PDF export functionality
- [ ] Check responsive design on mobile
- [ ] Test tablet view (iPad)
- [ ] Verify desktop layout

### Browser Compatibility
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (if available)
- [ ] Mobile browsers (Chrome Mobile, Safari iOS)

### Performance
- [ ] Initial load time < 3 seconds
- [ ] Navigation is instant
- [ ] Charts render smoothly
- [ ] No memory leaks (check DevTools)
- [ ] Lighthouse score > 90

---

## 📦 Build & Deployment

### Production Build
```bash
# 1. Build the project
npm run build

# 2. Test production build locally
npm run preview

# 3. Check build output
# dist/ folder should be created
```

### Build Verification
- [ ] No TypeScript errors
- [ ] No console warnings
- [ ] All assets bundled correctly
- [ ] Environment variables replaced
- [ ] Build size is reasonable (< 2MB)

### Deployment Options

#### Option 1: Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Follow prompts
```
- [ ] Connect GitHub repo
- [ ] Configure environment variables
- [ ] Set build command: `npm run build`
- [ ] Set output directory: `dist`
- [ ] Deploy
- [ ] Verify deployment URL

#### Option 2: Netlify
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod

# Or use Netlify UI (drag & drop dist folder)
```
- [ ] Connect GitHub repo
- [ ] Build command: `npm run build`
- [ ] Publish directory: `dist`
- [ ] Add environment variables
- [ ] Deploy

#### Option 3: GitHub Pages
```bash
# Install gh-pages
npm install -g gh-pages

# Add to package.json
"homepage": "https://yourusername.github.io/placement-dashboard",
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d dist"
}

# Deploy
npm run deploy
```

#### Option 4: Docker
```dockerfile
# Use provided Dockerfile
docker build -t placement-dashboard .
docker run -p 3000:5173 placement-dashboard

# Or use docker-compose
docker-compose up
```

---

## 🔒 Security Checklist

- [ ] Remove console.log statements from production
- [ ] Validate all user inputs
- [ ] Sanitize data before displaying
- [ ] Use HTTPS for API calls
- [ ] Implement rate limiting on API
- [ ] Add CORS configuration
- [ ] Use environment variables for secrets
- [ ] Implement authentication/authorization
- [ ] Add CSRF protection
- [ ] Regular dependency updates

---

## 📊 Analytics Setup (Optional)

### Google Analytics
```tsx
// In index.html, add before </head>
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### Tracking Events
```tsx
// Track page views
useEffect(() => {
  if (window.gtag) {
    window.gtag('event', 'page_view', {
      page_path: location.pathname,
    });
  }
}, [location]);

// Track button clicks
const handleExport = () => {
  window.gtag?.('event', 'pdf_export', {
    event_category: 'engagement',
    event_label: 'dashboard',
  });
  // ... export logic
};
```

---

## 🚀 Performance Optimization

- [ ] Enable code splitting
- [ ] Lazy load routes
```tsx
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
// Wrap routes in <Suspense>
```
- [ ] Optimize images (use WebP)
- [ ] Implement virtual scrolling for long lists
- [ ] Add service worker for caching
- [ ] Minimize bundle size
- [ ] Use production React build
- [ ] Enable gzip compression on server
- [ ] Use CDN for static assets

---

## 📝 Documentation Updates

- [ ] Update README with your branding
- [ ] Document custom features
- [ ] Add API documentation
- [ ] Create user guide
- [ ] Write deployment guide
- [ ] Document environment variables
- [ ] Add troubleshooting section
- [ ] Include screenshots

---

## 🎯 Post-Deployment Checklist

- [ ] Verify all pages load correctly
- [ ] Test all API endpoints
- [ ] Check mobile responsiveness
- [ ] Verify PDF export works
- [ ] Test form submissions
- [ ] Check analytics tracking
- [ ] Verify custom domain (if any)
- [ ] Test SSL certificate
- [ ] Check error pages (404, 500)
- [ ] Monitor error logs
- [ ] Set up uptime monitoring
- [ ] Create backup strategy

---

## 🔄 Maintenance Schedule

### Weekly
- [ ] Check error logs
- [ ] Monitor performance metrics
- [ ] Review user feedback

### Monthly
- [ ] Update dependencies (`npm update`)
- [ ] Review and optimize code
- [ ] Check for security vulnerabilities (`npm audit`)
- [ ] Backup data

### Quarterly
- [ ] Major dependency updates
- [ ] Performance audit
- [ ] Security review
- [ ] Feature enhancements

---

## 📞 Support & Resources

### Getting Help
- Check component documentation in code comments
- Review example files (EXAMPLES.md)
- Check architecture documentation (ARCHITECTURE.md)
- Inspect mock data structure (src/api/mockApi.ts)

### Useful Links
- [React Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Material UI](https://mui.com)
- [React Query](https://tanstack.com/query)
- [Vite Guide](https://vitejs.dev/guide/)

---

## ✨ Quick Commands Reference

```bash
# Development
npm run dev          # Start dev server
npm run build        # Production build
npm run preview      # Preview production build
npm run lint         # Lint code

# Deployment
vercel               # Deploy to Vercel
netlify deploy       # Deploy to Netlify
npm run deploy       # Deploy to GitHub Pages (after setup)

# Maintenance
npm update           # Update dependencies
npm audit            # Check for vulnerabilities
npm audit fix        # Fix vulnerabilities
```

---

## 🎉 Final Checklist

Before going live:
- [ ] All features tested
- [ ] Mobile responsive verified
- [ ] API integrated and working
- [ ] Environment variables configured
- [ ] Build succeeds without errors
- [ ] Production deployment tested
- [ ] Analytics configured
- [ ] Documentation updated
- [ ] Error handling implemented
- [ ] Performance optimized
- [ ] Security measures in place
- [ ] Backup strategy defined

**You're ready to launch! 🚀**

---

**Remember:** This is a living checklist. Update it as your project evolves!
