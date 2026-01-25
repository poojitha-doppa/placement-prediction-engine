import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Avatar,
  Box,
  Badge,
  Menu,
  MenuItem,
  Divider,
  useTheme,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  AccountCircle,
  Logout,
} from '@mui/icons-material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { DRAWER_WIDTH } from './Sidebar';

interface TopNavbarProps {
  onMobileMenuToggle: () => void;
  studentName?: string;
}

export default function TopNavbar({
  onMobileMenuToggle,
  studentName = 'Student',
}: TopNavbarProps) {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notifAnchor, setNotifAnchor] = useState<null | HTMLElement>(null);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotifMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotifAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setNotifAnchor(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleMenuClose();
  };

  const handleProfile = () => {
    navigate('/profile');
    handleMenuClose();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const displayName = user?.name || studentName;

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
        ml: { md: `${DRAWER_WIDTH}px` },
        backgroundColor: 'background.paper',
        color: 'text.primary',
        borderBottom: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Toolbar>
        {/* Mobile menu toggle */}
        <IconButton
          color="inherit"
          edge="start"
          onClick={onMobileMenuToggle}
          sx={{ mr: 2, display: { md: 'none' } }}
        >
          <MenuIcon />
        </IconButton>

        {/* Page title - can be dynamic based on route */}
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Welcome back, {displayName.split(' ')[0]}!
        </Typography>

        {/* Right side actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Notifications */}
          <IconButton color="inherit" onClick={handleNotifMenuOpen}>
            <Badge badgeContent={3} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          {/* Settings */}
          <IconButton color="inherit">
            <SettingsIcon />
          </IconButton>

          {/* Profile */}
          <IconButton
            onClick={handleProfileMenuOpen}
            sx={{ ml: 1 }}
            edge="end"
          >
            <Avatar
              sx={{
                width: 36,
                height: 36,
                bgcolor: theme.palette.primary.main,
              }}
            >
              {getInitials(displayName)}
            </Avatar>
          </IconButton>
        </Box>
      </Toolbar>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        onClick={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          sx: { mt: 1.5, minWidth: 200 },
        }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle2">{displayName}</Typography>
          <Typography variant="caption" color="text.secondary">
            {user?.email || 'student@college.edu'}
          </Typography>
        </Box>
        <Divider />
        <MenuItem onClick={handleProfile}>
          <ListItemIcon>
            <AccountCircle fontSize="small" />
          </ListItemIcon>
          <ListItemText>My Profile</ListItemText>
        </MenuItem>
        <MenuItem>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Settings</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          <ListItemText>Logout</ListItemText>
        </MenuItem>
      </Menu>

      {/* Notifications Menu */}
      <Menu
        anchorEl={notifAnchor}
        open={Boolean(notifAnchor)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          sx: { mt: 1.5, minWidth: 320, maxHeight: 400 },
        }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle2" fontWeight="bold">
            Notifications
          </Typography>
        </Box>
        <Divider />
        <MenuItem>
          <Box>
            <Typography variant="body2">New roadmap generated</Typography>
            <Typography variant="caption" color="text.secondary">
              2 hours ago
            </Typography>
          </Box>
        </MenuItem>
        <MenuItem>
          <Box>
            <Typography variant="body2">Profile sync completed</Typography>
            <Typography variant="caption" color="text.secondary">
              5 hours ago
            </Typography>
          </Box>
        </MenuItem>
        <MenuItem>
          <Box>
            <Typography variant="body2">Weekly goal achieved!</Typography>
            <Typography variant="caption" color="text.secondary">
              1 day ago
            </Typography>
          </Box>
        </MenuItem>
      </Menu>
    </AppBar>
  );
}
