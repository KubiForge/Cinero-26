export type RegistrationCategory = 'Inter-University' | 'Inter-School';

export interface CrewRegistration {
  registrationId: string;
  category: RegistrationCategory;
  categoryLabel: string;
  teamName: string;
  teamSize: number | null;
  institution: string;
  registrationDate: string;
  registrationDay: string;
}

export interface CrewDashboardData {
  stats: {
    totalTeams: number;
    interUniversity: number;
    interSchool: number;
    totalParticipants: number | null;
  };
  trends: Array<{ date: string; count: number }>;
  records: CrewRegistration[];
  lastUpdated: string;
}
