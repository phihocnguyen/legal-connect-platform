// Lawyer Application entities
export interface LawyerApplication {
  id: number;
  user: {
    id: number;
    fullName: string;
    email: string;
    avatar?: string;
  };
  licenseNumber: string;
  lawSchool: string;
  graduationYear: number;
  specializations: string[];
  yearsOfExperience: number;
  currentFirm: string;
  bio: string;
  phoneNumber: string;
  officeAddress: string;
  documentUrls: string[];
  status: "PENDING" | "APPROVED" | "REJECTED";
  adminNotes?: string;
  reviewedBy?: number;
  reviewedAt?: string;
  createdAt: string;
}
