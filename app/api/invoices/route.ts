import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/server-utils';
import { getInvoices, createInvoice } from '@/controllers/invoiceController';
import { sanitizeHtml } from '@/lib/utils';
import { z } from 'zod';
import mongoose from 'mongoose';

const createInvoiceSchema = z.object({
  clientName: z.string().min(1, 'Client name is required').max(100, 'Client name too long'),
  clientEmail: z.string().email('Invalid email format'),
  amount: z.number().positive('Amount must be positive').max(1000000, 'Amount too large').optional(),
  currency: z.string().min(3, 'Currency code required').max(3, 'Invalid currency code'),
  dueDate: z.string().refine((date) => {
    const inputDate = new Date(date);
    return !isNaN(inputDate.getTime());
  }, 'Invalid date format'),
  lineItems: z.array(z.object({
    description: z.string().min(1, 'Description is required').max(200, 'Description too long'),
    quantity: z.number().positive('Quantity must be positive'),
    unitPrice: z.number().positive('Unit price must be positive')
  })).min(1, 'At least one line item is required'),
  notes: z.string().max(500, 'Notes too long').optional()
});

export async function GET(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Check if the userId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(user.id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid authentication token' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '5');

    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        { success: false, error: 'Invalid pagination parameters' },
        { status: 400 }
      );
    }

    const result = await getInvoices(user.id, page, limit);

    return NextResponse.json({
      success: true,
      data: result.invoices,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: result.totalPages
      }
    });

  } catch (error) {
    console.error('Get invoices error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Check if the userId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(user.id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid authentication token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = createInvoiceSchema.parse(body);

    // Sanitize all string inputs
    const sanitizedData = {
      ...validatedData,
      clientName: sanitizeHtml(validatedData.clientName),
      clientEmail: sanitizeHtml(validatedData.clientEmail),
      notes: validatedData.notes ? sanitizeHtml(validatedData.notes) : undefined,
      lineItems: validatedData.lineItems.map(item => ({
        ...item,
        description: sanitizeHtml(item.description)
      }))
    };

    // Calculate line item totals
    const lineItemsWithTotals = sanitizedData.lineItems.map(item => ({
      ...item,
      total: item.quantity * item.unitPrice
    }));

    // Calculate total amount from line items if not provided
    const calculatedAmount = validatedData.amount || lineItemsWithTotals.reduce((total, item) => total + item.total, 0);

    const invoiceData = {
      clientName: sanitizedData.clientName,
      clientEmail: sanitizedData.clientEmail,
      amount: calculatedAmount,
      currency: sanitizedData.currency,
      dueDate: new Date(validatedData.dueDate),
      lineItems: lineItemsWithTotals,
      notes: sanitizedData.notes,
      userId: user.id
    };

    const newInvoice = await createInvoice(invoiceData);

    return NextResponse.json({
      success: true,
      data: newInvoice,
      message: 'Invoice created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Create invoice error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
