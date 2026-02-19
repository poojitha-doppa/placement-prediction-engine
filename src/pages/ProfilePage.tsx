import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  Chip,
  IconButton,
  Alert,
  Snackbar,
  CircularProgress,
  Divider,
  useTheme,
} from '@mui/material';
import {
  Add,
  CloudUpload,
  GitHub,
  Code,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { api } from '@/api/mockApi';
import { profileApi } from '@/api/api';
import { StudentProfile } from '@/types';

export default function ProfilePage() {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [newSkill, setNewSkill] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newRole, setNewRole] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<StudentProfile>>({
    name: '',
    email: '',
    college: '',
    branch: '',
    graduationYear: new Date().getFullYear() + 1,
    cgpa: 0,
    skills: [],
    leetcodeSolved: 0,
    githubUrl: '',
    leetcodeUrl: '',
    resumeUrl: '',
    targets: {
      companies: [],
      roles: [],
      minPackageLPA: 0,
    },
    integrationStatus: {
      github: 'not-connected',
      leetcode: 'not-connected',
      resume: 'not-uploaded',
    },
  });

  // Fetch profile data
  const {
    data: profileData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['studentProfile'],
    queryFn: () => profileApi.getProfile(),
  });

  // Set form data when profile loads
  useEffect(() => {
    console.log('Profile data received:', profileData);
    if (profileData) {
      // Transform backend data format to frontend format
      setFormData({
        id: profileData.id,
        name: profileData.name || user?.name || '',
        email: profileData.email || user?.email || '',
        college: profileData.college || '',
        branch: profileData.branch || '',
        graduationYear: profileData.year || new Date().getFullYear() + 1,
        cgpa: profileData.cgpa || 0,
        skills: profileData.skills || [],
        leetcodeSolved: profileData.leetcodeSolved || 0,
        githubUrl: profileData.githubUsername ? `https://github.com/${profileData.githubUsername}` : '',
        leetcodeUrl: profileData.leetcodeUsername ? `https://leetcode.com/${profileData.leetcodeUsername}` : '',
        resumeUrl: profileData.resumeUrl || '',
        targets: {
          companies: profileData.targetCompanies || [],
          roles: profileData.targetRoles || [],
          minPackageLPA: profileData.minPackageLPA || 0,
        },
        integrationStatus: {
          github: profileData.githubUsername ? 'connected' : 'not-connected',
          leetcode: profileData.leetcodeUsername ? 'connected' : 'not-connected',
          resume: profileData.resumeUrl ? 'uploaded' : 'not-uploaded',
        },
      });
      console.log('Form data set');
    } else if (user && !isLoading) {
      console.log('Setting default form data from user');
      setFormData((prev) => ({
        ...prev,
        name: user.name,
        email: user.email,
      }));
    }
  }, [profileData, user, isLoading]);

  const profile = profileData;

  const handleInputChange = (field: keyof StudentProfile, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && formData.skills) {
      const updatedSkills = [...formData.skills, newSkill.trim()];
      setFormData((prev) => ({ ...prev, skills: updatedSkills }));
      setNewSkill('');
    } else if (newSkill.trim()) {
      setFormData((prev) => ({ ...prev, skills: [newSkill.trim()] }));
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    if (formData.skills) {
      const updatedSkills = formData.skills.filter((s) => s !== skillToRemove);
      setFormData((prev) => ({ ...prev, skills: updatedSkills }));
    }
  };

  const handleAddCompany = () => {
    if (newCompany.trim()) {
      const companies = formData.targets?.companies || [];
      setFormData((prev) => ({
        ...prev,
        targets: {
          ...prev.targets,
          companies: [...companies, newCompany.trim()],
          roles: prev.targets?.roles || [],
          minPackageLPA: prev.targets?.minPackageLPA || 0,
        },
      }));
      setNewCompany('');
    }
  };

  const handleRemoveCompany = (companyToRemove: string) => {
    if (formData.targets?.companies) {
      const updatedCompanies = formData.targets.companies.filter((c) => c !== companyToRemove);
      setFormData((prev) => ({
        ...prev,
        targets: {
          ...prev.targets!,
          companies: updatedCompanies,
        },
      }));
    }
  };

  const handleAddRole = () => {
    if (newRole.trim()) {
      const roles = formData.targets?.roles || [];
      setFormData((prev) => ({
        ...prev,
        targets: {
          ...prev.targets,
          roles: [...roles, newRole.trim()],
          companies: prev.targets?.companies || [],
          minPackageLPA: prev.targets?.minPackageLPA || 0,
        },
      }));
      setNewRole('');
    }
  };

  const handleRemoveRole = (roleToRemove: string) => {
    if (formData.targets?.roles) {
      const updatedRoles = formData.targets.roles.filter((r) => r !== roleToRemove);
      setFormData((prev) => ({
        ...prev,
        targets: {
          ...prev.targets!,
          roles: updatedRoles,
        },
      }));
    }
  };

  // Resume upload mutation
  const resumeUploadMutation = useMutation({
    mutationFn: (file: File) => profileApi.uploadResume(file),
    onSuccess: (data) => {
      setFormData((prev) => ({ ...prev, resumeUrl: data.resumeUrl }));
      queryClient.invalidateQueries({ queryKey: ['studentProfile'] });
      alert(`Resume uploaded successfully!`);
    },
    onError: (error: any) => {
      console.error('Resume upload error:', error);
      const errorMsg = error.response?.data?.error || error.message || 'Unknown error';
      alert(`Failed to upload resume: ${errorMsg}. Please try logging in again.`);
    }
  });

  const handleResumeUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        alert('Please upload a PDF or DOC file');
        return;
      }
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      
      resumeUploadMutation.mutate(file);
    }
  };

  const handleSave = () => {
    if (!formData.name || !formData.college || !formData.branch) {
      alert('Please fill in all required fields (Name, College, Branch)');
      return;
    }
    
    setIsSaving(true);
    
    // Transform data to match backend API format
    const dataToSend = {
      name: formData.name,
      college: formData.college,
      branch: formData.branch,
      year: formData.graduationYear,
      cgpa: formData.cgpa,
      skills: formData.skills || [],
      targetCompanies: formData.targets?.companies || [],
      targetRoles: formData.targets?.roles || [],
      availableHoursPerWeek: 20, // default value
      githubUsername: formData.githubUrl?.split('/').pop() || null,
      leetcodeUsername: formData.leetcodeUrl?.split('/').pop() || null,
      codeforcesUsername: null
    };
    
    console.log('Sending profile update:', dataToSend);
    
    // Use profileApi instead of mockApi for real backend calls
    profileApi.updateProfile(dataToSend).then((response) => {
      console.log('Profile update successful:', response);
      queryClient.invalidateQueries({ queryKey: ['studentProfile'] });
      queryClient.invalidateQueries({ queryKey: ['placementSummary'] });
      queryClient.invalidateQueries({ queryKey: ['companyMatches'] });
      setShowSuccess(true);
      setIsSaving(false);
    }).catch((error) => {
      console.error('Update error:', error);
      console.error('Error response:', error.response?.data);
      const errorMsg = error.response?.data?.error || error.message || 'Unknown error';
      alert(`Failed to update profile: ${errorMsg}`);
      setIsSaving(false);
    });
  };

  const getStatusColor = (
    status: 'connected' | 'not-connected' | 'pending' | 'uploaded' | 'not-uploaded' | 'parsing'
  ) => {
    if (status === 'connected' || status === 'uploaded') return 'success';
    if (status === 'pending' || status === 'parsing') return 'warning';
    return 'default';
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
        }}
      >
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading profile...</Typography>
      </Box>
    );
  }

  if (error) {
    console.error('Profile error:', error);
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Failed to load profile. Please try again. Error: {String(error)}
      </Alert>
    );
  }
  
  console.log('Rendering profile with formData:', formData);

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Student Profile
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Keep your profile updated for accurate placement predictions
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Basic Information */}
        <Grid item xs={12} md={8}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              border: `1px solid ${theme.palette.divider}`,
              mb: 3,
            }}
          >
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Basic Information
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  value={formData.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="College"
                  value={formData.college || ''}
                  onChange={(e) => handleInputChange('college', e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Branch"
                  value={formData.branch || ''}
                  onChange={(e) => handleInputChange('branch', e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Graduation Year"
                  type="number"
                  value={formData.graduationYear || ''}
                  onChange={(e) =>
                    handleInputChange('graduationYear', parseInt(e.target.value))
                  }
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="CGPA"
                  type="number"
                  inputProps={{ min: 0, max: 10, step: 0.01 }}
                  value={formData.cgpa || ''}
                  onChange={(e) =>
                    handleInputChange('cgpa', parseFloat(e.target.value))
                  }
                  required
                  helperText="Enter CGPA on a scale of 10"
                />
              </Grid>
            </Grid>
          </Paper>

          {/* Skills Section */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              border: `1px solid ${theme.palette.divider}`,
              mb: 3,
            }}
          >
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Skills & Technologies
            </Typography>
            <Divider sx={{ mb: 3 }} />

            {/* Skill Input */}
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <TextField
                fullWidth
                size="small"
                label="Add a skill"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddSkill();
                  }
                }}
                placeholder="e.g., React, Python, DSA"
              />
              <IconButton
                color="primary"
                onClick={handleAddSkill}
                disabled={!newSkill.trim()}
              >
                <Add />
              </IconButton>
            </Box>

            {/* Skills Display */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {formData.skills?.map((skill, index) => (
                <Chip
                  key={index}
                  label={skill}
                  onDelete={() => handleRemoveSkill(skill)}
                  color="primary"
                  variant="outlined"
                />
              ))}
            </Box>
          </Paper>

          {/* Coding Profiles */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Coding Profiles & Stats
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="LeetCode Problems Solved"
                  type="number"
                  inputProps={{ min: 0 }}
                  value={formData.leetcodeSolved || 0}
                  onChange={(e) =>
                    handleInputChange('leetcodeSolved', parseInt(e.target.value) || 0)
                  }
                  helperText="Total LeetCode problems you've solved"
                />
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <GitHub />
                  <TextField
                    fullWidth
                    label="GitHub URL (Optional)"
                    value={formData.githubUrl || ''}
                    onChange={(e) =>
                      handleInputChange('githubUrl', e.target.value)
                    }
                    placeholder="https://github.com/username"
                  />
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Code />
                  <TextField
                    fullWidth
                    label="LeetCode URL (Optional)"
                    value={formData.leetcodeUrl || ''}
                    onChange={(e) =>
                      handleInputChange('leetcodeUrl', e.target.value)
                    }
                    placeholder="https://leetcode.com/username"
                  />
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Sidebar - Resume & Targets */}
        <Grid item xs={12} md={4}>
          {/* Resume Upload */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              border: `1px solid ${theme.palette.divider}`,
              mb: 3,
            }}
          >
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Resume
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <input
              type="file"
              accept=".pdf,.docx"
              style={{ display: 'none' }}
              id="resume-upload"
              onChange={handleResumeUpload}
            />
            <label htmlFor="resume-upload">
              <Box
                sx={{
                  border: `2px dashed ${theme.palette.divider}`,
                  borderRadius: 2,
                  p: 3,
                  textAlign: 'center',
                  cursor: 'pointer',
                  '&:hover': {
                    borderColor: theme.palette.primary.main,
                    backgroundColor: theme.palette.action.hover,
                  },
                }}
              >
                <CloudUpload sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Drop your resume here or click to browse
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Supports PDF, DOCX (Max 5MB)
                </Typography>
              </Box>
            </label>

            {formData.resumeUrl && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Uploaded: {formData.resumeUrl.split('/').pop()}
                </Typography>
              </Box>
            )}
          </Paper>

          {/* Target Companies */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              border: `1px solid ${theme.palette.divider}`,
              mb: 3,
            }}
          >
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Target Companies
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <TextField
                fullWidth
                size="small"
                label="Add company"
                value={newCompany}
                onChange={(e) => setNewCompany(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddCompany();
                  }
                }}
                placeholder="e.g., Google, Microsoft"
              />
              <IconButton
                color="primary"
                onClick={handleAddCompany}
                disabled={!newCompany.trim()}
              >
                <Add />
              </IconButton>
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {formData.targets?.companies?.map((company, index) => (
                <Chip
                  key={index}
                  label={company}
                  color="primary"
                  onDelete={() => handleRemoveCompany(company)}
                />
              ))}
            </Box>
          </Paper>

          {/* Target Roles */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              border: `1px solid ${theme.palette.divider}`,
              mb: 3,
            }}
          >
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Target Roles
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <TextField
                fullWidth
                size="small"
                label="Add role"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddRole();
                  }
                }}
                placeholder="e.g., Software Engineer"
              />
              <IconButton
                color="primary"
                onClick={handleAddRole}
                disabled={!newRole.trim()}
              >
                <Add />
              </IconButton>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
              {formData.targets?.roles?.map((role, index) => (
                <Chip
                  key={index}
                  label={role}
                  color="secondary"
                  onDelete={() => handleRemoveRole(role)}
                />
              ))}
            </Box>

            <TextField
              fullWidth
              label="Minimum Package Target (LPA)"
              type="number"
              inputProps={{ min: 0, step: 0.5 }}
              value={formData.targets?.minPackageLPA || ''}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  targets: {
                    ...prev.targets,
                    minPackageLPA: parseFloat(e.target.value) || 0,
                    companies: prev.targets?.companies || [],
                    roles: prev.targets?.roles || [],
                  },
                }))
              }
              helperText="Enter expected minimum package"
            />
          </Paper>
        </Grid>
      </Grid>

      {/* Save Button */}
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button variant="outlined" size="large">
          Cancel
        </Button>
        <Button
          variant="contained"
          size="large"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? <CircularProgress size={24} /> : 'Save Changes'}
        </Button>
      </Box>

      {/* Success Snackbar */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={3000}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="success" onClose={() => setShowSuccess(false)}>
          Profile updated successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
}
