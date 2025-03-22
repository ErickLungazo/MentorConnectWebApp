// Define interfaces
export interface Role {
  id: number;
  name: string;
}

export interface UserRole {
  id: string; // Matches auth.users UUID
  role: number; // Foreign key to roles.id
  roles?: Role; // Relation to roles table
}

export interface Education {
  institution: string;
  course: string;
  specialization: string;
  graduationYear: number;
}

export interface Mentor {
  id: string;
  name: string;
  occupations: string[];
  rating: number;
  companies: string[];
  profile: string;
  skills: string[];
  interests: string[];
  education: Education[];
}
