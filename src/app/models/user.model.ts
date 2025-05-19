export interface User {
  id?: number; 
  fullName: string;
  email: string;
  phone?: string;
  city?: string;
  aboutMe?: string;
  interests?: string[];
  profileImage?: string;
  password: string; 
  eventIds: number[]; 
  role: 'volunteer' | 'organization' | 'both'; 
  agreeTerms: boolean;
  agreeNewsletter?: boolean;
  
}