/**
 * Company Matching Service
 * Compares student skills with company requirements and calculates fit scores
 */

interface StudentProfile {
  skills: string[];
  cgpa: number;
  tenth: number;
  twelfth: number;
  projects: number;
  internships: number;
}

interface CompanyRequirements {
  name: string;
  requiredSkills: string[];
  minCGPA: number;
  minProjects: number;
  minInternships: number;
}

interface MatchResult {
  companyName: string;
  fitScore: number; // 0 to 1
  matchedSkills: string[];
  missingSkills: string[];
  academicMatch: boolean;
  experienceMatch: boolean;
  reasons: string[];
}

/**
 * Calculate similarity between two skill strings (case-insensitive, partial matching)
 */
const skillSimilarity = (skill1: string, skill2: string): number => {
  const s1 = skill1.toLowerCase().trim();
  const s2 = skill2.toLowerCase().trim();

  // Exact match
  if (s1 === s2) return 1;

  // Check if one contains the other
  if (s1.includes(s2) || s2.includes(s1)) return 0.8;

  // Check for common words
  const words1 = s1.split(/[\s\-]+/);
  const words2 = s2.split(/[\s\-]+/);
  const commonWords = words1.filter((w) => words2.includes(w));

  if (commonWords.length > 0) {
    return 0.6;
  }

  // No similarity
  return 0;
};

/**
 * Find matched and missing skills
 */
const analyzeSkills = (
  studentSkills: string[],
  requiredSkills: string[],
  threshold: number = 0.6
): { matched: string[]; missing: string[] } => {
  const matched: string[] = [];
  const missing: string[] = [];

  requiredSkills.forEach((required) => {
    let bestMatch = 0;
    let bestMatchSkill = '';

    studentSkills.forEach((student) => {
      const similarity = skillSimilarity(student, required);
      if (similarity > bestMatch) {
        bestMatch = similarity;
        bestMatchSkill = student;
      }
    });

    if (bestMatch >= threshold) {
      matched.push(required);
    } else {
      missing.push(required);
    }
  });

  return { matched, missing };
};

/**
 * Calculate fit score based on skills, academics, and experience
 */
const calculateFitScore = (
  student: StudentProfile,
  company: CompanyRequirements,
  matched: string[],
  missing: string[]
): number => {
  // Skill match score (60% weight)
  const totalRequired = company.requiredSkills.length || 1;
  const skillScore = (matched.length / totalRequired) * 0.6;

  // Academic score (20% weight)
  const academicScore =
    student.cgpa >= company.minCGPA
      ? 0.2
      : Math.max(0, (student.cgpa / company.minCGPA) * 0.2 * 0.8); // 80% if not met

  // Experience score (20% weight)
  const projectScore =
    student.projects >= company.minProjects ? 0.1 : (student.projects / (company.minProjects || 1)) * 0.1;
  const internshipScore =
    student.internships >= company.minInternships
      ? 0.1
      : (student.internships / (company.minInternships || 1)) * 0.1;
  const experienceScore = projectScore + internshipScore;

  return Math.min(1, skillScore + academicScore + experienceScore);
};

/**
 * Match a student against a single company
 */
export const matchStudentToCompany = (
  student: StudentProfile,
  company: CompanyRequirements
): MatchResult => {
  const { matched, missing } = analyzeSkills(student.skills, company.requiredSkills);
  const fitScore = calculateFitScore(student, company, matched, missing);

  const reasons: string[] = [];
  const academicMatch = student.cgpa >= company.minCGPA;
  const experienceMatch =
    student.projects >= company.minProjects && student.internships >= company.minInternships;

  // Generate reasons
  if (matched.length > 0) {
    reasons.push(`✓ ${matched.length}/${company.requiredSkills.length} required skills matched`);
  }
  if (academicMatch) {
    reasons.push(`✓ CGPA ${student.cgpa} meets requirement (${company.minCGPA})`);
  } else {
    reasons.push(`⚠ CGPA ${student.cgpa} below requirement (${company.minCGPA})`);
  }
  if (experienceMatch) {
    reasons.push(`✓ Experience meets requirements`);
  } else {
    reasons.push(`⚠ More projects/internships needed`);
  }

  return {
    companyName: company.name,
    fitScore,
    matchedSkills: matched,
    missingSkills: missing,
    academicMatch,
    experienceMatch,
    reasons,
  };
};

/**
 * Match a student to multiple companies and rank them
 */
export const rankCompaniesForStudent = (
  student: StudentProfile,
  companies: CompanyRequirements[]
): MatchResult[] => {
  const results = companies.map((company) => matchStudentToCompany(student, company));

  // Sort by fit score (descending)
  return results.sort((a, b) => b.fitScore - a.fitScore);
};

/**
 * Get companies where student is highly likely to be placed
 */
export const getViableCompanies = (
  student: StudentProfile,
  companies: CompanyRequirements[],
  minFitScore: number = 0.7
): MatchResult[] => {
  const ranked = rankCompaniesForStudent(student, companies);
  return ranked.filter((result) => result.fitScore >= minFitScore);
};
