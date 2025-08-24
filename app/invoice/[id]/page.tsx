'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Invoice } from '@/types';
import Navigation from '@/components/Navigation';
import { formatCurrency } from '@/lib/utils';
import useSWR from 'swr';
import fetcher from '@/lib/fetcher';

interface InvoicePageProps {
  params: Promise<{ id: string }>;
}

export default function InvoicePage({ params }: InvoicePageProps) {

  const router = useRouter();

  // Get the invoice ID from params
  const [invoiceId, setInvoiceId] = useState<string | null>(null);

  useEffect(() => {
    const getInvoiceId = async () => {
      const { id } = await params;
      if (!id) {
        console.error('Invoice ID is undefined or empty');
        router.push('/dashboard');
        return;
      }
      setInvoiceId(id);
    };
    getInvoiceId();
  }, [params, router]);

  // Use SWR for data fetching
  const { data, error, isLoading } = useSWR(
    invoiceId ? `/api/invoices/${invoiceId}` : null,
    fetcher
  );

  const invoice = data?.data as Invoice | undefined;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="mb-6">
              <Link
                href="/dashboard"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                ← Back to Dashboard
              </Link>
            </div>
            <div className="bg-white shadow rounded-lg p-6 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading invoice</h3>
              <p className="text-gray-600">{error.message}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="mb-6">
              <Link
                href="/dashboard"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                ← Back to Dashboard
              </Link>
            </div>
            <div className="bg-white shadow rounded-lg p-6 text-center">
              <p className="text-gray-600">Invoice not found</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <Link
              href="/dashboard"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              ← Back to Dashboard
            </Link>
          </div>

          <div className="bg-white shadow rounded-lg overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  <div className="h-10 w-10 relative mr-3">
                    <Image
                      src="/logo.jpg"
                      alt="Invoice Manager Logo"
                      fill
                      className="rounded-lg object-cover"
                      priority
                    />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      Invoice {invoice.invoiceNumber}
                    </h1>
                    <p className="text-gray-600 mt-1">
                      Issued on {formatDate(invoice.issueDate)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                    {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>

            {/* Client Information */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Client Information</h3>
                  <p className="text-sm text-gray-600">
                    <strong>Name:</strong> {invoice.clientName}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Email:</strong> {invoice.clientEmail}
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Invoice Details</h3>
                  <p className="text-sm text-gray-600">
                    <strong>Due Date:</strong> {formatDate(invoice.dueDate)}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Currency:</strong> {invoice.currency}
                  </p>
                </div>
              </div>
            </div>

            {/* Line Items */}
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Line Items</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Unit Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {invoice.lineItems.map((item, index) => (
                      <tr key={item._id || index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(item.unitPrice, invoice.currency)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(item.total, invoice.currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Total */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-end">
                <div className="text-right">
                  <p className="text-lg font-medium text-gray-900">
                    Total: {formatCurrency(invoice.amount, invoice.currency)}
                  </p>
                </div>
              </div>
            </div>

            {/* Notes */}
            {invoice.notes && (
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Notes</h3>
                <p className="text-sm text-gray-600">{invoice.notes}</p>
              </div>
            )}

            {/* Actions */}
            <div className="px-6 py-4 bg-gray-50">
              <div className="flex justify-between items-center">
                <button
                  onClick={() => window.open(`/api/invoices/${invoice._id}/pdf`, '_blank')}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Download PDF
                </button>
                <Link
                  href="/dashboard"
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Back to Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
