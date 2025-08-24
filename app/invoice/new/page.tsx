'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import { CreateInvoiceRequest, LineItem } from '@/types';
import Link from 'next/link';
import Image from 'next/image';
import api from '@/lib/axios';
import axios from 'axios';
import { mutate } from 'swr';

export default function NewInvoicePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState<CreateInvoiceRequest>({
    clientName: '',
    clientEmail: '',
    currency: 'INR',
    dueDate: '',
    lineItems: [{ description: '', quantity: 1, unitPrice: 0 }],
    notes: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // User is guaranteed to be authenticated by middleware
  if (!user) {
    return null;
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.clientName.trim()) {
      newErrors.clientName = 'Client name is required';
    }

    if (!formData.clientEmail.trim()) {
      newErrors.clientEmail = 'Client email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.clientEmail)) {
      newErrors.clientEmail = 'Invalid email format';
    }

    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required';
    } else {
      const dueDate = new Date(formData.dueDate);
      const today = new Date();
      if (dueDate < today) {
        newErrors.dueDate = 'Due date cannot be in the past';
      }
    }

    if (formData.lineItems.length === 0) {
      newErrors.lineItems = 'At least one line item is required';
    } else {
      formData.lineItems.forEach((item, index) => {
        if (!item.description.trim()) {
          newErrors[`lineItems.${index}.description`] = 'Description is required';
        }
        if (item.quantity <= 0) {
          newErrors[`lineItems.${index}.quantity`] = 'Quantity must be greater than 0';
        }
        if (item.unitPrice <= 0) {
          newErrors[`lineItems.${index}.unitPrice`] = 'Unit price must be greater than 0';
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Calculate and set the total amount from line items
      const totalAmount = calculateTotal();
      const invoiceData = {
        ...formData,
        amount: totalAmount
      };

      const response = await api.post('/api/invoices', invoiceData);
      
      // Mutate all invoice lists to refresh the data
      await mutate('/api/invoices');
      
      router.push(`/invoice/${response.data.data._id}`);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data?.error) {
        setErrors({ submit: error.response.data.error });
      } else {
        setErrors({ submit: 'An error occurred. Please try again.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const addLineItem = () => {
    setFormData(prev => ({
      ...prev,
      lineItems: [...prev.lineItems, { description: '', quantity: 1, unitPrice: 0 }]
    }));
  };

  const removeLineItem = (index: number) => {
    if (formData.lineItems.length > 1) {
      setFormData(prev => ({
        ...prev,
        lineItems: prev.lineItems.filter((_, i) => i !== index)
      }));
    }
  };

  const updateLineItem = (index: number, field: keyof LineItem, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      lineItems: prev.lineItems.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const calculateTotal = () => {
    return formData.lineItems.reduce((total, item) => total + (item.quantity * item.unitPrice), 0);
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

          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center">
                <div className="h-8 w-8 relative mr-3">
                  <Image
                    src="/logo.jpg"
                    alt="Invoice Manager Logo"
                    fill
                    className="rounded object-cover"
                    priority
                  />
                </div>
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900">Create New Invoice</h1>
                  <p className="text-gray-600 mt-1">Fill in the details below to create a new invoice.</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
              {/* Client Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="clientName" className="block text-sm font-medium text-gray-700">
                    Client Name *
                  </label>
                  <input
                    type="text"
                    id="clientName"
                    value={formData.clientName}
                    onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                      errors.clientName ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.clientName && (
                    <p className="mt-1 text-sm text-red-600">{errors.clientName}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="clientEmail" className="block text-sm font-medium text-gray-700">
                    Client Email *
                  </label>
                  <input
                    type="email"
                    id="clientEmail"
                    value={formData.clientEmail}
                    onChange={(e) => setFormData(prev => ({ ...prev, clientEmail: e.target.value }))}
                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                      errors.clientEmail ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.clientEmail && (
                    <p className="mt-1 text-sm text-red-600">{errors.clientEmail}</p>
                  )}
                </div>
              </div>

              {/* Invoice Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                    Total Amount
                  </label>
                  <div className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900 sm:text-sm">
                    {formData.currency} {calculateTotal().toFixed(2)}
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Calculated automatically from line items</p>
                </div>

                <div>
                  <label htmlFor="currency" className="block text-sm font-medium text-gray-700">
                    Currency
                  </label>
                  <select
                    id="currency"
                    value={formData.currency}
                    onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="INR">INR</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="CAD">CAD</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
                    Due Date *
                  </label>
                  <input
                    type="date"
                    id="dueDate"
                    value={formData.dueDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                      errors.dueDate ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.dueDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.dueDate}</p>
                  )}
                </div>
              </div>

              {/* Line Items */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Line Items</h3>
                  <button
                    type="button"
                    onClick={addLineItem}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    + Add Item
                  </button>
                </div>

                {formData.lineItems.map((item, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 p-4 border border-gray-200 rounded-lg">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Description *</label>
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                        className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                          errors[`lineItems.${index}.description`] ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      {errors[`lineItems.${index}.description`] && (
                        <p className="mt-1 text-sm text-red-600">{errors[`lineItems.${index}.description`]}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Quantity *</label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateLineItem(index, 'quantity', parseInt(e.target.value) || 1)}
                        className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                          errors[`lineItems.${index}.quantity`] ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      {errors[`lineItems.${index}.quantity`] && (
                        <p className="mt-1 text-sm text-red-600">{errors[`lineItems.${index}.quantity`]}</p>
                      )}
                    </div>

                    <div className="flex items-end space-x-2">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700">Unit Price *</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.unitPrice}
                          onChange={(e) => updateLineItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                          className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                            errors[`lineItems.${index}.unitPrice`] ? 'border-red-300' : 'border-gray-300'
                          }`}
                        />
                        {errors[`lineItems.${index}.unitPrice`] && (
                          <p className="mt-1 text-sm text-red-600">{errors[`lineItems.${index}.unitPrice`]}</p>
                        )}
                      </div>

                      {formData.lineItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeLineItem(index)}
                          className="px-3 py-2 text-red-600 hover:text-red-800 focus:outline-none"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {errors.lineItems && (
                  <p className="text-sm text-red-600">{errors.lineItems}</p>
                )}
              </div>

              {/* Notes */}
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                  Notes
                </label>
                <textarea
                  id="notes"
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Additional notes or comments..."
                />
              </div>

              {/* Total */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium text-gray-900">Total Amount:</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {formData.currency} {calculateTotal().toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Submit Error */}
              {errors.submit && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                  {errors.submit}
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end space-x-3">
                <Link
                  href="/dashboard"
                  className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Creating...' : 'Create Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
