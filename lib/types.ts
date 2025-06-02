export interface Lead {
  id: string
  lead_owner: string
  first_name: string
  last_name: string
  title: string
  email: string
  mobile: string
  lead_source: string
  lead_status: string
  street: string
  city: string
  state: string
  zipcode: string
  country: string
  descri: string
}

export class User {
  id: number;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
  token: string = "";
  tokenType: string = "";
  reporting_to: string = "";

  constructor(data: Partial<User> = {}) {
    this.id = data.id ?? 0;
    this.name = data.name ?? "";
    this.email = data.email ?? "";
    this.role = data.role ?? "user";
    this.is_active = data.is_active ?? true;
    this.created_at = data.created_at ?? new Date().toISOString();
    this.token = data.token ?? "";
    this.tokenType = data.tokenType ?? "";
    this.reporting_to = data.reporting_to ?? "";
  }
}



export interface LoginSession {
  id: string
  userId: string
  loginTime: string
  logoutTime: string | null
  duration: number | null // Duration in minutes
  isCompleted: boolean
  isMinimumHoursMet: boolean // Did the user complete minimum 9 hours
}

export interface AttendanceSummary {
  totalSessions: number
  completedSessions: number
  totalHours: number
  averageHoursPerDay: number
  minimumHoursMetCount: number
  minimumHoursPercentage: number
}