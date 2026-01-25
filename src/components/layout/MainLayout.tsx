import { useState } from 'react';
import { Box, Toolbar } from '@mui/material';
import Sidebar, { DRAWER_WIDTH } from './Sidebar';
import TopNavbar from './TopNavbar';

interface MainLayoutProps {
  children: React.ReactNode;
  studentName?: string;
}

export default function MainLayout({
  children,
  studentName,
}: MainLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <Sidebar mobileOpen={mobileOpen} onMobileToggle={handleDrawerToggle} />

      {/* Top Navbar */}
      <TopNavbar
        onMobileMenuToggle={handleDrawerToggle}
        studentName={studentName}
      />

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          backgroundColor: 'background.default',
          minHeight: '100vh',
        }}
      >
        <Toolbar /> {/* Spacer for fixed AppBar */}
        {children}
      </Box>
    </Box>
  );
}
