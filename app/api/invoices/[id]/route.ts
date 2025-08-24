import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/server-utils';
import { getInvoiceById } from '@/controllers/invoiceController';
import mongoose from 'mongoose';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    
    // Check if the invoice id is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid invoice ID' },
        { status: 400 }
      );
    }

    const invoice = await getInvoiceById(id, user.id);

    if (!invoice) {
      return NextResponse.json(
        { success: false, error: 'Invoice not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: invoice
    });

  } catch (error) {
    console.error('Get invoice error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
