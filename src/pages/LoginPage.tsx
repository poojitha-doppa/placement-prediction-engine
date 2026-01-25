import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Tab,
  Tabs,
  InputAdornment,
  IconButton,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Visibility, VisibilityOff, School } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/api';

const LoginPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetLink, setResetLink] = useState('');

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (tabValue === 0) {
        // Login
        await login(email, password);
      } else {
        // Register
        await register(name, email, password);
      }
      navigate('/profile'); // Redirect to profile page to complete setup
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!resetEmail) {
      return;
    }

    setResetLoading(true);
    try {
      const response = await authApi.forgotPassword(resetEmail);
      console.log('Password reset response:', response);
      setResetSuccess(true);
      // Store the reset link for demo purposes (in production, this would only be sent via email)
      if (response.resetLink) {
        setResetLink(response.resetLink);
      } else if (response.resetToken) {
        // Build the link from token
        setResetLink(`http://localhost:5173/reset-password?token=${response.resetToken}`);
      }
    } catch (error: any) {
      console.error('Password reset error:', error);
      // Still show success to prevent email enumeration
      setResetSuccess(true);
    } finally {
      setResetLoading(false);
    }
  };

  const handleCloseForgotPassword = () => {
    setForgotPasswordOpen(false);
    setResetEmail('');
    setResetSuccess(false);
    setResetLink('');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: 2,
      }}
    >
      <Card
        sx={{
          maxWidth: 450,
          width: '100%',
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
        }}
      >
        <CardContent sx={{ p: 4 }}>
          {/* Logo and Title */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                mb: 2,
              }}
            >
              <School sx={{ fontSize: 32, color: 'white' }} />
            </Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Placement Prep
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Your AI-powered placement preparation assistant
            </Typography>
          </Box>

          {/* Tabs */}
          <Tabs
            value={tabValue}
            onChange={(_, newValue) => {
              setTabValue(newValue);
              setError('');
            }}
            centered
            sx={{ mb: 3 }}
          >
            <Tab label="Login" />
            <Tab label="Sign Up" />
          </Tabs>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {tabValue === 1 && (
              <TextField
                fullWidth
                label="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                margin="normal"
                required
                autoFocus={tabValue === 1}
              />
            )}

            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
              autoFocus={tabValue === 0}
            />

            <TextField
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {/* Forgot Password Link - Only show on Login tab */}
            {tabValue === 0 && (
              <Box sx={{ textAlign: 'right', mb: 2 }}>
                <Link
                  component="button"
                  type="button"
                  variant="body2"
                  onClick={(e) => {
                    e.preventDefault();
                    setForgotPasswordOpen(true);
                  }}
                  sx={{ cursor: 'pointer', textDecoration: 'none' }}
                >
                  Forgot Password?
                </Link>
              </Box>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                mt: tabValue === 0 ? 1 : 3,
                mb: 2,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)',
                },
              }}
            >
              {loading ? 'Please wait...' : tabValue === 0 ? 'Login' : 'Sign Up'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Forgot Password Dialog */}
      <Dialog open={forgotPasswordOpen} onClose={handleCloseForgotPassword} maxWidth="xs" fullWidth>
        <DialogTitle>Reset Password</DialogTitle>
        <DialogContent>
          {resetSuccess ? (
            <>
              <Alert severity="success" sx={{ mt: 2, mb: 2 }}>
                Password reset link has been sent to your email!
              </Alert>
              {resetLink && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2" fontWeight="bold" gutterBottom>
                    Demo Mode: Click the button below to set your new password
                  </Typography>
                  <Button
                    variant="contained"
                    size="medium"
                    fullWidth
                    onClick={() => {
                      const urlParams = new URLSearchParams(resetLink.split('?')[1]);
                      const token = urlParams.get('token');
                      handleCloseForgotPassword();
                      navigate(`/reset-password?token=${token}`);
                    }}
                    sx={{ 
                      mt: 1,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)',
                      },
                    }}
                  >
                    Set New Password
                  </Button>
                  <Typography variant="caption" display="block" sx={{ mt: 1, textAlign: 'center' }}>
                    In production, this link would only be sent to your email.
                  </Typography>
                </Alert>
              )}
            </>
          ) : (
            <>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, mt: 1 }}>
                Enter your email address and we'll send you a link to reset your password.
              </Typography>
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                autoFocus
                margin="normal"
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseForgotPassword}>
            {resetSuccess ? 'Close' : 'Cancel'}
          </Button>
          {!resetSuccess && (
            <Button
              onClick={handleForgotPassword}
              variant="contained"
              disabled={!resetEmail || resetLoading}
            >
              {resetLoading ? 'Sending...' : 'Send Reset Link'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LoginPage;

