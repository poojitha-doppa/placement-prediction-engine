import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  Box,
  Typography,
  LinearProgress,
  useTheme,
} from '@mui/material';
import { Visibility } from '@mui/icons-material';
import { CompanyTableProps } from '@/types';

export default function CompanyTable({
  companies,
  onViewDetails,
}: CompanyTableProps) {
  const theme = useTheme();

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  // Helper to get company name (handle both 'company' and 'name' properties)
  const getCompanyName = (company: any) => company.name || company.company || 'Unknown';
  
  // Helper to get success probability (handle both properties)
  const getSuccessProb = (company: any) => 
    company.successProbability ?? ((company.estimatedSuccessProb ?? 0) * 100);
  
  // Helper to get skill gaps (handle both properties)
  const getSkillGaps = (company: any) => company.skillGaps || company.keyGaps || [];

  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{ border: `1px solid ${theme.palette.divider}` }}
    >
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: theme.palette.grey[50] }}>
            <TableCell>
              <Typography variant="subtitle2" fontWeight="bold">
                Company
              </Typography>
            </TableCell>
            <TableCell>
              <Typography variant="subtitle2" fontWeight="bold">
                Why It Matches
              </Typography>
            </TableCell>
            <TableCell>
              <Typography variant="subtitle2" fontWeight="bold">
                Hiring Status
              </Typography>
            </TableCell>
            <TableCell>
              <Typography variant="subtitle2" fontWeight="bold">
                Fit Score
              </Typography>
            </TableCell>
            <TableCell>
              <Typography variant="subtitle2" fontWeight="bold">
                Success Probability
              </Typography>
            </TableCell>
            <TableCell>
              <Typography variant="subtitle2" fontWeight="bold">
                Package (LPA)
              </Typography>
            </TableCell>
            <TableCell>
              <Typography variant="subtitle2" fontWeight="bold">
                Key Gaps
              </Typography>
            </TableCell>
            <TableCell align="center">
              <Typography variant="subtitle2" fontWeight="bold">
                Action
              </Typography>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {companies.map((company, index) => (
            <TableRow
              key={index}
              sx={{
                '&:hover': { backgroundColor: theme.palette.action.hover },
              }}
            >
              <TableCell>
                <Typography variant="body2" fontWeight={500}>
                  {getCompanyName(company)}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2" color="text.secondary">
                  {company.explanation || (company.reasons && company.reasons[0]) || 'Based on your saved profile and skills'}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">{company.hiringStatus || 'Active'}</Typography>
              </TableCell>
              <TableCell>
                <Box sx={{ minWidth: 100 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      mb: 0.5,
                    }}
                  >
                    <Typography variant="body2" fontWeight={500}>
                      {(company.fitScore * (company.fitScore <= 1 ? 100 : 1)).toFixed(0)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={(company.fitScore || 0) * (company.fitScore && company.fitScore <= 1 ? 100 : 1)}
                    color={getScoreColor((company.fitScore || 0) * (company.fitScore && company.fitScore <= 1 ? 100 : 1))}
                    sx={{ height: 6, borderRadius: 1 }}
                  />
                </Box>
              </TableCell>
              <TableCell>
                <Chip
                  label={`${getSuccessProb(company).toFixed(0)}%`}
                  size="small"
                  color={getScoreColor(getSuccessProb(company))}
                  variant="outlined"
                />
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  ₹{company.packageRange?.min || 0}-{company.packageRange?.max || 0}
                </Typography>
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {getSkillGaps(company).slice(0, 2).map((gap: string, idx: number) => (
                    <Chip
                      key={idx}
                      label={gap}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: '0.7rem' }}
                    />
                  ))}
                  {getSkillGaps(company).length > 2 && (
                    <Chip
                      label={`+${getSkillGaps(company).length - 2}`}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: '0.7rem' }}
                    />
                  )}
                </Box>
              </TableCell>
              <TableCell align="center">
                <Button
                  size="small"
                  startIcon={<Visibility />}
                  onClick={() => onViewDetails(company)}
                  variant="outlined"
                >
                  View
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
