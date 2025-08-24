'use client';

import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import InvoiceList from '@/components/InvoiceList';
import { Invoice } from '@/types';
import Image from 'next/image';

interface DashboardProps {
  initialInvoices: Invoice[];
  initialTotalInvoices: number;
  initialTotalPages: number;
}

export default function Dashboard({ 
  initialInvoices, 
  initialTotalInvoices, 
  initialTotalPages 
}: DashboardProps) {
  const { user } = useAuth();

  // User is guaranteed to be authenticated by middleware
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="mb-8">
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
                  <h1 className="text-3xl font-bold text-gray-900">
                    Dashboard
                  </h1>
                  <p className="text-gray-600">
                    Welcome back, {user.name}. Here are your recent invoices.
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Role</div>
                <div className="text-lg font-medium text-gray-900 capitalize">
                  {user.role}
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Invoices
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {initialTotalInvoices}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Paid Invoices
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {initialInvoices.filter(inv => inv.status === 'paid').length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Pending Invoices
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {initialInvoices.filter(inv => inv.status === 'pending').length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Invoice List */}
          <InvoiceList
            initialInvoices={initialInvoices}
            totalInvoices={initialTotalInvoices}
            totalPages={initialTotalPages}
            userId={user.id}
          />
        </div>
      </div>
    </div>
  );
}
