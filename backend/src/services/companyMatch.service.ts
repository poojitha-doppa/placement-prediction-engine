import prisma from '../config/db.js';
import { rankCompaniesForStudent } from './match.service.js';

interface CompanyCatalogEntry {
  name: string;
  role: string;
  requiredSkills: string[];
  minCGPA: number;
  minProjects: number;
  minInternships: number;
  packageMin: number;
  packageMax: number;
  hiringStatus: string;
}

const COMPANY_CATALOG: CompanyCatalogEntry[] = [
  { name: 'Google', role: 'Software Engineer', requiredSkills: ['Data Structures', 'Algorithms', 'System Design', 'JavaScript'], minCGPA: 8.0, minProjects: 3, minInternships: 1, packageMin: 20, packageMax: 35, hiringStatus: 'Active' },
  { name: 'Microsoft', role: 'Software Engineer', requiredSkills: ['Data Structures', 'Algorithms', 'C#', 'Azure'], minCGPA: 7.5, minProjects: 2, minInternships: 1, packageMin: 18, packageMax: 32, hiringStatus: 'Active' },
  { name: 'Amazon', role: 'Software Development Engineer', requiredSkills: ['Data Structures', 'Algorithms', 'AWS', 'Distributed Systems'], minCGPA: 7.0, minProjects: 2, minInternships: 0, packageMin: 16, packageMax: 30, hiringStatus: 'Active' },
  { name: 'Meta', role: 'Software Engineer', requiredSkills: ['React', 'JavaScript', 'System Design', 'GraphQL'], minCGPA: 7.5, minProjects: 3, minInternships: 1, packageMin: 19, packageMax: 34, hiringStatus: 'Upcoming' },
  { name: 'Apple', role: 'Software Engineer', requiredSkills: ['System Design', 'Swift', 'Algorithms', 'C++'], minCGPA: 7.5, minProjects: 3, minInternships: 1, packageMin: 17, packageMax: 31, hiringStatus: 'Upcoming' },
  { name: 'Netflix', role: 'Backend Engineer', requiredSkills: ['Java', 'Microservices', 'Distributed Systems', 'System Design'], minCGPA: 7.0, minProjects: 3, minInternships: 1, packageMin: 17, packageMax: 33, hiringStatus: 'Upcoming' },
  { name: 'Adobe', role: 'Full Stack Developer', requiredSkills: ['React', 'Node.js', 'JavaScript', 'SQL'], minCGPA: 7.0, minProjects: 2, minInternships: 0, packageMin: 15, packageMax: 28, hiringStatus: 'Active' },
  { name: 'Salesforce', role: 'Application Developer', requiredSkills: ['Java', 'Apex', 'SQL', 'Problem Solving'], minCGPA: 7.0, minProjects: 2, minInternships: 0, packageMin: 14, packageMax: 26, hiringStatus: 'Active' },
  { name: 'Oracle', role: 'Software Engineer', requiredSkills: ['Java', 'SQL', 'Cloud', 'Data Structures'], minCGPA: 7.0, minProjects: 2, minInternships: 0, packageMin: 12, packageMax: 24, hiringStatus: 'Active' },
  { name: 'Atlassian', role: 'Software Developer', requiredSkills: ['Java', 'Spring Boot', 'Microservices', 'System Design'], minCGPA: 7.0, minProjects: 2, minInternships: 1, packageMin: 14, packageMax: 26, hiringStatus: 'Active' },
  { name: 'Uber', role: 'Backend Engineer', requiredSkills: ['Go', 'Distributed Systems', 'Microservices', 'Algorithms'], minCGPA: 7.5, minProjects: 3, minInternships: 1, packageMin: 16, packageMax: 29, hiringStatus: 'Upcoming' },
  { name: 'Stripe', role: 'Software Engineer', requiredSkills: ['Ruby', 'Distributed Systems', 'APIs', 'Security'], minCGPA: 7.5, minProjects: 3, minInternships: 1, packageMin: 18, packageMax: 32, hiringStatus: 'Upcoming' }
];

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const normalizeText = (value: string) => value.toLowerCase().trim();

const inferProjectCount = (profile: any) => {
  if (Array.isArray(profile?.parsedResume?.projects)) {
    return profile.parsedResume.projects.length;
  }
  return Math.ceil((profile?.skills?.length || 0) / 4);
};

const inferInternshipCount = (profile: any) => {
  if (Array.isArray(profile?.parsedResume?.experience)) {
    return profile.parsedResume.experience.length;
  }
  return 0;
};

const pickCatalog = (profile: any) => {
  const targetCompanies = (profile?.targetCompanies || []).map(normalizeText);
  const targetRoles = (profile?.targetRoles || []).map(normalizeText);

  let filtered = COMPANY_CATALOG.filter((company) =>
    targetCompanies.length > 0 ? targetCompanies.includes(normalizeText(company.name)) : true
  );

  if (filtered.length === 0 && targetRoles.length > 0) {
    filtered = COMPANY_CATALOG.filter((company) =>
      targetRoles.some((role: string) => normalizeText(company.role).includes(role) || role.includes(normalizeText(company.role)))
    );
  }

  return filtered.length > 0 ? filtered : COMPANY_CATALOG;
};

export const recomputeCompanyMatchesForUser = async (userId: string, providedProfile?: any) => {
  const profile = providedProfile || await prisma.profile.findUnique({ where: { userId } });

  if (!profile) {
    await prisma.companyMatch.deleteMany({ where: { userId } });
    return [];
  }

  const catalog = pickCatalog(profile);
  const student = {
    skills: profile.skills || [],
    cgpa: profile.cgpa || 0,
    tenth: clamp(Math.round((profile.cgpa || 0) * 9.2), 50, 95),
    twelfth: clamp(Math.round((profile.cgpa || 0) * 9.4), 50, 96),
    projects: inferProjectCount(profile),
    internships: inferInternshipCount(profile)
  };

  const ranked = rankCompaniesForStudent(student, catalog)
    .map((match) => {
      const company = catalog.find((entry) => entry.name === match.companyName)!;
      const successProbability = clamp(
        Math.round((match.fitScore * 100) + (match.academicMatch ? 8 : 0) + (match.experienceMatch ? 6 : 0)),
        15,
        99
      );

      return {
        companyName: company.name,
        fitScore: Number((match.fitScore * 100).toFixed(1)),
        successProbability,
        packageMin: company.packageMin,
        packageMax: company.packageMax,
        requiredSkills: company.requiredSkills,
        matchedSkills: match.matchedSkills,
        skillGaps: match.missingSkills,
        minCGPA: company.minCGPA,
        hiringStatus: company.hiringStatus
      };
    })
    .sort((a, b) => b.fitScore - a.fitScore)
    .slice(0, 20);

  await prisma.companyMatch.deleteMany({ where: { userId } });

  if (ranked.length > 0) {
    await prisma.companyMatch.createMany({
      data: ranked.map((match) => ({
        userId,
        companyName: match.companyName,
        fitScore: match.fitScore,
        successProbability: match.successProbability,
        packageMin: match.packageMin,
        packageMax: match.packageMax,
        requiredSkills: match.requiredSkills,
        matchedSkills: match.matchedSkills,
        skillGaps: match.skillGaps,
        minCGPA: match.minCGPA,
        hiringStatus: match.hiringStatus
      }))
    });
  }

  return ranked;
};
