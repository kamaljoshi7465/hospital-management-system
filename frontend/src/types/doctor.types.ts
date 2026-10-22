
export interface Doctor {
  id: number;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  qualification: string;
  experienceYears: number;
  consultationFee: number;
  rating: number;
  totalReviews: number;
  bio: string;
  image: string;
  available: boolean;
  workingDays: string[];
  workingHours: {
    start: string;
    end: string;
  };
  slotDurationMinutes: number;
}
