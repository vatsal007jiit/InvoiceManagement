

export const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

export function sanitizeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

export function formatCurrency(amount: number, currency: string = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

export function generateInvoiceNumber(): string {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substr(2, 5);
  return `INV-${timestamp}-${random}`.toUpperCase();
}

export function calculateInvoiceStatus(dueDate: string): 'paid' | 'pending' | 'overdue' {
  const today = new Date();
  const due = new Date(dueDate);
  
  if (due < today) {
    return 'overdue';
  }
  
  return 'pending';
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateAmount(amount: number): boolean {
  return amount > 0 && amount <= 1000000; // Max 1M
}

export function validateDate(date: string): boolean {
  const inputDate = new Date(date);
  return !isNaN(inputDate.getTime());
}
