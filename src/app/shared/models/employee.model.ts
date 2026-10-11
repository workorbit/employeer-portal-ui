export interface Employee {
  id: string;
  name: string;
  email: string;
  department?: string;
  designation?: string;
  joiningDate: string;
  salary: number;
  payType: 'hourly' | 'fixed';
  reportingManagerId?: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface CreateEmployeePayload {
  name: string;
  email: string;
  department?: string;
  designation?: string;
  joiningDate: string;
  salary: number;
  payType?: 'hourly' | 'fixed';
  reportingManagerId?: string;
  initialPassword?: string;
}
