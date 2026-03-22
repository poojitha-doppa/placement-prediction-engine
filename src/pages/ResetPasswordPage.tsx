import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress,
} from '@mui/material';
import { Visibility, VisibilityOff, School, CheckCircle } from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authApi } from '../api/api';

const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      setError('Invalid reset link. Please request a new password reset.');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!newPassword || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!token) {
      setError('Invalid reset token');
      return;
    }

    setLoading(true);

    try {
      await authApi.resetPassword(token, newPassword);
      setSuccess(true);
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
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
                background: success 
                  ? 'linear-gradient(135deg, #56ab2f 0%, #a8e063 100%)'
                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                mb: 2,
              }}
            >
              {success ? (
                <CheckCircle sx={{ fontSize: 32, color: 'white' }} />
              ) : (
                <School sx={{ fontSize: 32, color: 'white' }} />
              )}
            </Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              {success ? 'Password Reset!' : 'Set New Password'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {success 
                ? 'Your password has been successfully reset'
                : 'Enter your new password below'
              }
            </Typography>
          </Box>

          {success ? (
            <>
              <Alert severity="success" sx={{ mb: 2 }}>
                Your password has been reset successfully!
              </Alert>
              <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 2 }}>
                Redirecting to login page...
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <CircularProgress size={24} />
              </Box>
            </>
          ) : (
            <>
              {/* Error Alert */}
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  label="New Password"
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  margin="normal"
                  required
                  autoFocus
                  helperText="Must be at least 8 characters"
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

                <TextField
                  fullWidth
                  label="Confirm New Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  margin="normal"
                  required
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading || !token}
                  sx={{
                    mt: 3,
                    mb: 2,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)',
                    },
                  }}
                >
                  {loading ? 'Resetting Password...' : 'Reset Password'}
                </Button>

                <Button
                  fullWidth
                  variant="text"
                  onClick={() => navigate('/login')}
                  sx={{ mt: 1 }}
                >
                  Back to Login
                </Button>
              </form>
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default ResetPasswordPage;
