import { redirect } from 'next/navigation';
import { getAuthUserFromHeaders } from '@/lib/server-utils';
import Dashboard from '@/components/Dashboard';
import { Invoice } from '@/types';
import { getInvoices } from '@/controllers/invoiceController';

interface DashboardPageProps {
  searchParams: Promise<{ page?: string; limit?: string }>;
}

// Enable ISR with 60-second revalidation
export const revalidate = 60;

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  // Check if user is authenticated
  const user = await getAuthUserFromHeaders();
  
  if (!user) {
    redirect('/login?redirect=/dashboard');
  }

  try {
    // Fetch initial data server-side directly from database
    const params = await searchParams;
    const page = parseInt(params.page || '1');
    const limit = parseInt(params.limit || '5');
    
    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
      throw new Error('Invalid pagination parameters');
    }

    const result = await getInvoices(user.id, page, limit);
    
    const invoices: Invoice[] = result.invoices.map(invoice => ({
      _id: invoice._id.toString(),
      invoiceNumber: invoice.invoiceNumber,
      clientName: invoice.clientName,
      clientEmail: invoice.clientEmail,
      amount: invoice.amount,
      currency: invoice.currency,
      status: invoice.status,
      dueDate: invoice.dueDate.toISOString(),
      issueDate: invoice.issueDate.toISOString(),
      lineItems: invoice.lineItems.map((item: { description: string; quantity: number; unitPrice: number; total: number }, index: number) => ({
        _id: `item-${invoice._id}-${index}`, // Generate stable ID for frontend
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.total
      })),
      notes: invoice.notes,
      userId: invoice.userId.toString(),
      createdAt: invoice.createdAt.toISOString(),
      updatedAt: invoice.updatedAt.toISOString()
    }));

    const totalInvoices: number = result.total;
    const totalPages: number = result.totalPages;

    return (
      <Dashboard
        initialInvoices={invoices}
        initialTotalInvoices={totalInvoices}
        initialTotalPages={totalPages}
      />
    );

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    
    // Return empty state on error
    return (
      <Dashboard
        initialInvoices={[]}
        initialTotalInvoices={0}
        initialTotalPages={0}
      />
    );
  }
}
