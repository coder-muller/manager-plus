export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  valid: boolean;

  members: Member[];

  createdAt: string;
  updatedAt: string;
}

export type MemberStatus = 'ACTIVE' | 'INACTIVE';

export interface Member {
  id: string;
  userId: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  status: MemberStatus;
  createdAt: string; 
  payments: Payment[];
}

export type PaymentStatus = 'PAID' | 'PENDING';

export interface Payment {
  id: string;
  memberId: string;
  month: number;
  year: number;
  amount: number;
  paidAt?: string | null;
  status: PaymentStatus;
  createdAt: string;
  member: Member;
}
