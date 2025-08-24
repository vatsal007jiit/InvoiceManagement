export interface User {
  id: string;
  email: string;
  role: 'admin' | 'accountant';
  name: string;
}

export interface Invoice {
  _id: string;
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'overdue';
  dueDate: string;
  issueDate: string;
  lineItems: LineItem[];
  notes?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface LineItem {
  _id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface CreateInvoiceRequest {
  clientName: string;
  clientEmail: string;
  amount?: number; // Optional -calculated from line items
  currency: string;
  dueDate: string;
  lineItems: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
  }>;
  notes?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: Omit<User, 'password'>;
  token: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  checkAuthStatus: () => Promise<void>;
}
